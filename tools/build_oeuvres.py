#!/usr/bin/env python3
"""Génère les pages statiques des œuvres validées (Schema.org JSON-LD),
la page d'index /oeuvres/ et les entrées du sitemap.

Source : API publique https://api.caribbeanmetadata.org/api/v1/works
(uniquement les œuvres validées, sans e-mail ni donnée personnelle).

Usage :  python3 tools/build_oeuvres.py
"""
import html
import json
import re
import sys
import unicodedata
import urllib.request
from pathlib import Path

BASE = "https://caribbeanmetadata.org"
API = "https://api.caribbeanmetadata.org/api/v1"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "oeuvres"

FAMILY_FR = {
    "literary": "Littérature et écrits",
    "musical": "Musique",
    "heritage": "Patrimoine",
    "audiovisual": "Audiovisuel",
    "performing_arts": "Arts vivants",
    "visual_arts": "Arts visuels",
}
FAMILY_LABELS = {
    "F01_linguistic": "Langues",
    "F02_cultural": "Marqueurs culturels",
    "F03_narrative": "Narration",
    "F04_rhythmic": "Rythmes",
    "F05_geographic": "Géographie",
    "F06_sociohistorical": "Repères socio-historiques",
}
# codes ISO 639-3 du CMS -> étiquettes BCP 47 (langues) utilisées par Schema.org
LANG = {"fra": "fr", "eng": "en", "nld": "nl", "spa": "es", "hat": "ht",
        "pap": "pap", "srn": "srn", "acf": "acf", "jam": "jam"}
LEVEL_FR = {"platinum": "Platine", "gold": "Or", "silver": "Argent", "bronze": "Bronze"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "cms-static-builder/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def clean(s):
    return re.sub(r"\s+", " ", (s or "")).strip()


def slugify(text, cms_id):
    t = unicodedata.normalize("NFKD", clean(text)).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()[:55].strip("-")
    return f"{t}-{cms_id.split('-')[-1].lower()}" if t else cms_id.lower()


def trunc(s, n):
    s = clean(s)
    return s if len(s) <= n else s[: n - 1].rsplit(" ", 1)[0] + "…"


def bcp(codes):
    out = []
    for c in codes or []:
        v = LANG.get(c, c)
        if v not in out:
            out.append(v)
    return out


def markers(tags):
    """Retourne {famille: [marqueurs]} à partir de metadata_tags."""
    res = {}
    for key, val in (tags or {}).items():
        if not isinstance(val, dict):
            continue
        items = []
        for k in ("markers", "tags"):
            if isinstance(val.get(k), list):
                items += [clean(str(x)) for x in val[k]]
        for k in ("genre", "territory"):
            if isinstance(val.get(k), str):
                items.append(clean(val[k]))
        items = [i for i in dict.fromkeys(items) if i]
        if items:
            res[key] = items
    return res


def json_ld_work(w, url, slug):
    creator = w.get("creator") or {}
    kws = list(dict.fromkeys(
        m for k, v in markers(w.get("metadata_tags")).items() if k not in ("F01_linguistic", "F05_geographic") for m in v))
    node = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": url + "#work",
        "url": url,
        "name": clean(w["title"]),
        "description": clean(w.get("description")) or None,
        "inLanguage": bcp(w.get("languages")),
        "dateCreated": str(w["year"]) if w.get("year") else None,
        "genre": FAMILY_FR.get(w.get("family"), w.get("family")),
        "keywords": kws or None,
        "contentLocation": {"@type": "Place", "name": w.get("territory")} if w.get("territory") else None,
        "creator": {
            "@type": "Person" if creator.get("type") == "individual" else "Organization",
            "name": creator.get("name"),
        } if creator.get("name") else None,
        "identifier": {"@type": "PropertyValue", "propertyID": "CMS ID", "value": w["cms_id"]},
        "isPartOf": {"@type": "DataCatalog", "name": "Caribbean Metadata Standard", "url": BASE + "/"},
        "additionalProperty": [
            {"@type": "PropertyValue", "name": "Standard", "value": w.get("standard", "CMS v2.0")},
            {"@type": "PropertyValue", "name": "Niveau de conformité", "value": LEVEL_FR.get(w.get("compliance_level"), w.get("compliance_level"))},
            {"@type": "PropertyValue", "name": "Complétude des familles CMS", "value": (w.get("completeness") or {}).get("percentage"), "unitText": "%"},
        ],
    }
    # pas de "license" ici : la licence CC-BY porte sur la fiche de métadonnées, pas sur l'œuvre décrite
    if clean(w.get("title_original")) and clean(w["title_original"]) != clean(w["title"]):
        node["alternateName"] = clean(w["title_original"])
    node = {k: v for k, v in node.items() if v not in (None, [], "")}
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Caribbean Metadata Standard", "item": BASE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Œuvres validées", "item": BASE + "/oeuvres/"},
            {"@type": "ListItem", "position": 3, "name": trunc(w["title"], 80), "item": url},
        ],
    }
    return [node, crumbs]


CSS = """
:root{--navy:#003E6B;--teal:#00838a;--ink:#14212b;--muted:#5b6b78;--bg:#f6f9fb;--card:#fff;--line:#dbe5ec}
@media (prefers-color-scheme:dark){:root{--navy:#8ccbf0;--teal:#5fd3d8;--ink:#e8f0f5;--muted:#9fb1bf;--bg:#0c1820;--card:#12232e;--line:#24404f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 'DM Sans',system-ui,-apple-system,Segoe UI,sans-serif;padding-inline:16px}
.wrap{max-width:820px;margin:0 auto;padding-block:24px 56px}
a{color:var(--teal)}nav.top{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:14px;padding-block:10px 20px;border-bottom:1px solid var(--line);margin-bottom:24px}
nav.top a{color:var(--navy);text-decoration:none;font-weight:600}
h1{font-family:'DM Serif Display',Georgia,serif;font-weight:400;font-size:clamp(1.6rem,4.5vw,2.3rem);line-height:1.2;margin:0 0 12px;color:var(--navy);text-wrap:balance}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px;padding:0;list-style:none}
.meta li{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:3px 10px;font-size:13px}
.lead{font-size:1.06rem}
h2{font-size:1.05rem;margin:28px 0 8px;color:var(--navy)}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:14px 18px}
dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;margin:0}dt{color:var(--muted);font-size:14px}dd{margin:0}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}.tags li{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:1px 10px;font-size:13px}
.fam{margin-block:10px}.fam b{display:block;font-size:13px;color:var(--muted);margin-bottom:4px;font-weight:600}
ul.list{padding-left:18px}ul.list li{margin-block:6px}
footer{margin-top:36px;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:14px}
"""

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=DM+Serif+Display&display=swap" rel="stylesheet">'
NAV = ('<nav class="top" aria-label="Navigation"><a href="/">Accueil</a><a href="/catalogue.html">Catalogue</a>'
       '<a href="/oeuvres/">Œuvres validées</a><a href="/spec.html">Spécification</a>'
       '<a href="/developers.html">API</a><a href="/certification.html">Certification</a></nav>')


def page(title, desc, url, body, ld, extra_head=""):
    ld_tags = "\n".join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False) for x in ld)
    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Caribbean Metadata Standard">
<meta property="og:title" content="{html.escape(title, quote=True)}">
<meta property="og:description" content="{html.escape(desc, quote=True)}">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary">
{extra_head}
{FONTS}
<style>{CSS}</style>
{ld_tags}
</head>
<body>
<div class="wrap">
{NAV}
{body}
<footer>Fiche du <a href="/spec.html">Caribbean Metadata Standard</a> (CMS v2.0), issue du <a href="/catalogue.html">catalogue</a>. Les métadonnées de cette fiche sont sous licence <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a> ; l'œuvre décrite reste soumise à ses propres droits.</footer>
</div>
</body>
</html>
"""


def work_page(w, url, slug):
    e = html.escape
    creator = w.get("creator") or {}
    fam = FAMILY_FR.get(w.get("family"), w.get("family") or "")
    langs = ", ".join(bcp(w.get("languages")))
    desc = clean(w.get("description")) or f"{clean(w['title'])} : œuvre caribéenne de la famille {fam} ({w.get('territory','')}), référencée dans le Caribbean Metadata Standard."
    title = trunc(w["title"], 62) + " | Caribbean Metadata"
    meta = [x for x in (fam, w.get("territory"), str(w.get("year") or ""), langs) if x]
    lis = "".join(f"<li>{e(x)}</li>" for x in meta)
    fam_blocks = ""
    for key, items in markers(w.get("metadata_tags")).items():
        label = FAMILY_LABELS.get(key, key)
        fam_blocks += f'<div class="fam"><b>{e(label)}</b><ul class="tags">' + "".join(f"<li>{e(i)}</li>" for i in items) + "</ul></div>"
    cert = w.get("certified_at", "")[:10]
    body = f"""<article>
<h1>{e(clean(w['title']))}</h1>
<ul class="meta">{lis}</ul>
<p class="lead">{e(desc)}</p>
{'<h2>Marqueurs culturels CMS</h2><div class="card">' + fam_blocks + '</div>' if fam_blocks else ''}
<h2>Fiche d'enregistrement</h2>
<div class="card"><dl>
<dt>Identifiant CMS</dt><dd><code>{e(w['cms_id'])}</code></dd>
<dt>Créateur</dt><dd>{e(creator.get('name',''))}{' (' + e(creator.get('territory')) + ')' if creator.get('territory') else ''}</dd>
<dt>Niveau</dt><dd>{e(LEVEL_FR.get(w.get('compliance_level'), w.get('compliance_level') or ''))}, complétude {e(str((w.get('completeness') or {}).get('percentage','')))} %</dd>
{'<dt>Certifiée le</dt><dd>' + e(cert) + '</dd>' if cert else ''}
<dt>Donnée brute</dt><dd><a href="{API}/works/{e(w['cms_id'])}">JSON de l'API</a></dd>
</dl></div>
</article>"""
    return page(title, trunc(desc, 158), url, body, json_ld_work(w, url, slug))


def index_page(items):
    e = html.escape
    lis = "".join(
        f'<li><a href="/oeuvres/{s}.html">{e(trunc(w["title"], 110))}</a> <span style="color:var(--muted)">— {e(w.get("territory") or "")}, {e(str(w.get("year") or ""))}, {e(FAMILY_FR.get(w.get("family"), ""))}</span></li>'
        for w, s in items
    )
    body = f"""<h1>Œuvres caribéennes validées</h1>
<p class="lead">{len(items)} œuvres, écrits, musiques et patrimoines de la Caraïbe, décrits avec le Caribbean Metadata Standard (27 champs, 10 langues ISO, 20 territoires). Chaque fiche est lisible par les moteurs de recherche et les IA.</p>
<ul class="list">{lis}</ul>"""
    ld = [{
        "@context": "https://schema.org", "@type": "CollectionPage",
        "name": "Œuvres caribéennes validées", "url": BASE + "/oeuvres/",
        "isPartOf": {"@type": "DataCatalog", "name": "Caribbean Metadata Standard", "url": BASE + "/"},
        "mainEntity": {"@type": "ItemList", "numberOfItems": len(items), "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "url": f"{BASE}/oeuvres/{s}.html", "name": trunc(w["title"], 110)}
            for i, (w, s) in enumerate(items)]},
    }]
    desc = f"{len(items)} œuvres caribéennes validées et décrites avec le Caribbean Metadata Standard : musique, littérature, patrimoine, audiovisuel."
    return page("Œuvres caribéennes validées | Caribbean Metadata", desc, BASE + "/oeuvres/", body, ld)


def update_sitemap(entries):
    p = ROOT / "sitemap.xml"
    s = p.read_text(encoding="utf-8")
    block = "  <!-- OEUVRES:START -->\n" + "\n".join(
        f"  <url><loc>{u}</loc><lastmod>{d}</lastmod><changefreq>monthly</changefreq><priority>{pr}</priority></url>"
        for u, d, pr in entries) + "\n  <!-- OEUVRES:END -->"
    if "<!-- OEUVRES:START -->" in s:
        s = re.sub(r"  <!-- OEUVRES:START -->.*?<!-- OEUVRES:END -->", lambda m: block, s, flags=re.S)
    else:
        s = s.replace("</urlset>", block + "\n</urlset>")
    p.write_text(s, encoding="utf-8")


def main():
    listing = get(f"{API}/works?limit=100&offset=0")["works"]
    works = [get(f"{API}/works/{w['cms_id']}") for w in listing]
    works.sort(key=lambda w: (w.get("certified_at") or "", w["cms_id"]))

    seen, kept = {}, []
    for w in works:
        key = (clean(w["title"]).lower(), clean(w.get("description")).lower())
        if key in seen:      # doublon exact : on n'indexe qu'une fiche
            continue
        seen[key] = w["cms_id"]
        kept.append((w, slugify(w["title"], w["cms_id"])))

    OUT.mkdir(exist_ok=True)
    for old in OUT.glob("*.html"):
        old.unlink()
    for w, slug in kept:
        (OUT / f"{slug}.html").write_text(work_page(w, f"{BASE}/oeuvres/{slug}.html", slug), encoding="utf-8")
    (OUT / "index.html").write_text(index_page(kept), encoding="utf-8")

    today = max((w.get("certified_at") or "")[:10] for w, _ in kept) or "2026-09-26"
    entries = [(f"{BASE}/oeuvres/", today, "0.8")] + [
        (f"{BASE}/oeuvres/{s}.html", (w.get("certified_at") or today)[:10], "0.6") for w, s in kept]
    update_sitemap(entries)
    print(f"{len(kept)} fiches générées sur {len(works)} œuvres validées")


if __name__ == "__main__":
    sys.exit(main())
