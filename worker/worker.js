/**
 * CMS API — Caribbean Metadata Standard v2.0
 * Cloudflare Worker — Public REST API
 * Caribwood Language Lab — caribbeanmetadata.org
 */

const SUPABASE_URL = 'https://vtbaqvjxfgseykjcinpu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cZc3a7kaK3M7ZcHRsoTI8w_NQz4Xy0z';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json; charset=utf-8',
};

// ── Vocabulaires CMS v2.0 ──────────────────────────────────────────────────
const VOCABULARIES = {
  languages: {
    hat: 'Créole haïtien',
    gcf: 'Créole guadeloupéen',
    acf: 'Créole antillais (Martinique)',
    jam: 'Jamaican Patois',
    pap: 'Papiamentu (Aruba · Curaçao)',
    srn: 'Sranan Tongo (Suriname)',
    nld: 'Nederlands Caribisch',
    fra: 'Français caribéen',
    eng: 'English Caribbean',
    spa: 'Español caribeño',
  },
  territories: [
    'Haiti','Guadeloupe','Martinique','Guyane','Jamaica','Trinidad',
    'Barbados','Cuba','Dominican Republic','Puerto Rico','Aruba',
    'Curacao','Suriname','Dominica','St Lucia','St Vincent',
    'Grenada','Antigua','Diaspora caribéenne','Caribbean (général)',
  ],
  domains: [
    'music','dance','theatre','literature','oral_tradition',
    'intangible_heritage','religion','gastronomy','carnival',
    'visual_arts','education','general','news','social_media',
  ],
  families: [
    'audiovisual','musical','literary','heritage','visual_arts','performing_arts',
  ],
  cultural_markers: {
    music: ['Gwo Ka','Bèlè','Konpa','Zouk','Calypso','Soca','Reggae','Ska',
            'Dancehall','Tumba','Son Cubano','Salsa','Bachata','Merengue',
            'Kaseko','Kadans','Bouyon'],
    dance_performance: ['Quadrille créole','Danmyé','Kalenda'],
    carnival_heritage: ['Carnival','Mas','Rara'],
    religion_spirituality: ['Vodou','Orisha','Rastafari'],
    heritage: ['Maroon Culture','Chanté Noël'],
    sociohistorical: ["Mémoire de l'esclavage",'Créolisation','Négritude',
                      'Antillanité','Postcolonialité','Marronage'],
  },
};

// ── Router ─────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (method !== 'GET' && method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }
    // POST only allowed on /api/v1/works with valid admin token
    if (method === 'POST') {
      const authHeader = request.headers.get('X-CMS-Admin') || '';
      if (authHeader !== (env.CMS_ADMIN_TOKEN || 'cms2026caribwood')) {
        return json({ error: 'Unauthorized' }, 401);
      }
    }

    // Routes
    if (path === '' || path === '/api/v1') {
      return handleRoot();
    }
    if (path === '/api/v1/vocabularies') {
      return handleVocabularies(url);
    }
    if (path === '/api/v1/vocabularies/languages') {
      return json({ version: '2.0', data: VOCABULARIES.languages });
    }
    if (path === '/api/v1/vocabularies/territories') {
      return json({ version: '2.0', data: VOCABULARIES.territories });
    }
    if (path === '/api/v1/vocabularies/domains') {
      return json({ version: '2.0', data: VOCABULARIES.domains });
    }
    if (path === '/api/v1/vocabularies/markers') {
      return json({ version: '2.0', data: VOCABULARIES.cultural_markers });
    }
    if (path === '/api/v1/schema') {
      return handleSchema();
    }
    if (path === '/api/v1/works') {
      return handleWorks(url);
    }
    if (path.startsWith('/api/v1/works/')) {
      const id = path.replace('/api/v1/works/', '');
      return handleWork(id);
    }
    if (path === '/api/v1/stats') {
      return handleStats();
    }

    return json({ error: 'Not found', available_endpoints: [
      'GET /api/v1',
      'GET /api/v1/vocabularies',
      'GET /api/v1/vocabularies/languages',
      'GET /api/v1/vocabularies/territories',
      'GET /api/v1/vocabularies/domains',
      'GET /api/v1/vocabularies/markers',
      'GET /api/v1/schema',
      'GET /api/v1/works',
      'GET /api/v1/works/:cms_id',
      'GET /api/v1/stats',
    ]}, 404);
  }
};

// ── Handlers ───────────────────────────────────────────────────────────────

function handleRoot() {
  return json({
    name: 'Caribbean Metadata Standard API',
    version: '2.0',
    standard: 'CMS v2.0',
    maintainer: 'Caribwood Language Lab',
    website: 'https://caribbeanmetadata.org',
    description: 'Open REST API for Caribbean audiovisual metadata. Makes Caribbean content correctly identifiable and recommendable by platform algorithms.',
    endpoints: {
      vocabularies: '/api/v1/vocabularies',
      schema: '/api/v1/schema',
      works: '/api/v1/works',
      stats: '/api/v1/stats',
    },
    cors: 'open — CORS * enabled',
    license: 'CC-BY 4.0',
  });
}

function handleVocabularies(url) {
  return json({
    version: '2.0',
    description: 'CMS v2.0 controlled vocabularies — 10 languages, 20 territories, 14 domains, 27+ cultural markers',
    vocabularies: VOCABULARIES,
  });
}

function handleSchema() {
  return json({
    '$schema': 'http://json-schema.org/draft-07/schema#',
    '$id': 'https://caribbeanmetadata.org/api/v1/schema',
    title: 'Caribbean Metadata Standard',
    version: '2.0',
    status: 'locked',
    locked_date: '2026-06-06',
    description: 'Schéma officiel du Caribbean Metadata Standard (CMS) v2.0 — Caribwood Language Lab',
    six_families: {
      F01_linguistic:      { description: 'Langue principale ISO 639-3', alignment: 'dc:language, schema:inLanguage, MARC 041' },
      F02_cultural:        { description: 'Marqueurs culturels caribéens', alignment: 'dc:subject, schema:keywords, EBUCore genre' },
      F03_narrative:       { description: 'Domaine et type de contenu', alignment: 'dc:type, schema:genre, EBUCore contentType' },
      F04_rhythmic:        { description: 'Marqueurs musicaux et rythmiques', alignment: 'EBUCore audioFormat (extension CMS)' },
      F05_geographic:      { description: 'Territoire caribéen d\'origine', alignment: 'dc:coverage, schema:locationCreated, MARC 651' },
      F06_sociohistorical: { description: 'Mémoire, histoire, résistance', alignment: 'dc:subject, schema:about, MARC 650' },
    },
    required_fields: ['cms_id', 'lang_code', 'cms_territory', 'cms_domain', 'title', 'family'],
    cms_id_pattern: '^CMS-[A-Z]{3}-[0-9]{4}-[A-Z0-9]{8}$',
    completeness: {
      description: 'Complétude calculée sur les 6 familles — 1 famille renseignée = présence d\'au moins 1 marqueur',
      formula: 'families_filled / 6 * 100',
      note: 'Indicateur technique objectif — pas un jugement sur la valeur culturelle de l\'œuvre',
    },
  });
}

async function handleWorks(url) {
  const params = url.searchParams;
  const territory = params.get('territory');
  const family = params.get('family');
  const language = params.get('language');
  const domain = params.get('domain');
  const limit = Math.min(parseInt(params.get('limit') || '20'), 100);
  const offset = parseInt(params.get('offset') || '0');

  let query = `works?select=id,title,title_original,family,year,territory,languages,description,status,created_at,creators(name,type,territory)&order=created_at.desc&limit=${limit}&offset=${offset}`;

  if (territory) query += `&territory=eq.${encodeURIComponent(territory)}`;
  if (family) query += `&family=eq.${encodeURIComponent(family)}`;
  if (language) query += `&languages=cs.{${encodeURIComponent(language)}}`;

  try {
    const data = await sbFetch(query);

    // Récupérer aussi les certifications pour la complétude
    const workIds = data.map(w => w.id);
    let certs = [];
    if (workIds.length > 0) {
      const certQuery = `certifications?work_id=in.(${workIds.join(',')})&select=work_id,cms_id,metadata_json,issued_at&revoked=eq.false`;
      certs = await sbFetch(certQuery).catch(() => []);
    }
    const certMap = {};
    certs.forEach(c => { certMap[c.work_id] = c; });

    const works = data.map(w => formatWork(w, certMap[w.id]));

    return json({
      version: '2.0',
      total: works.length,
      limit,
      offset,
      filters_applied: { territory, family, language, domain },
      works,
    });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function handleWork(cmsId) {
  // Validation format CMS ID
  if (!/^CMS-[A-Z]{2,5}-\d{4}-[A-Z0-9]{8}$/.test(cmsId.toUpperCase())) {
    // Peut-être un UUID direct
    if (!/^[0-9a-f-]{36}$/.test(cmsId)) {
      return json({ error: 'Invalid identifier format. Use CMS-XXX-YYYY-XXXXXXXX or UUID.' }, 400);
    }
  }

  try {
    let cert, work;

    if (cmsId.startsWith('CMS-')) {
      const certs = await sbFetch(`certifications?cms_id=eq.${encodeURIComponent(cmsId.toUpperCase())}&select=*,works(*,creators(name,type,territory))&limit=1`);
      if (!certs || certs.length === 0) return json({ error: 'Work not found', cms_id: cmsId }, 404);
      cert = certs[0];
      work = cert.works;
    } else {
      const works = await sbFetch(`works?id=eq.${cmsId}&select=*,creators(name,type,territory)&limit=1`);
      if (!works || works.length === 0) return json({ error: 'Work not found', id: cmsId }, 404);
      work = works[0];
      const certs = await sbFetch(`certifications?work_id=eq.${cmsId}&select=*&revoked=eq.false&limit=1`);
      cert = certs && certs.length > 0 ? certs[0] : null;
    }

    return json(formatWork(work, cert, true));
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

async function handleStats() {
  try {
    const [works, certs] = await Promise.all([
      sbFetch('works?select=territory,family,languages'),
      sbFetch('certifications?select=metadata_json,issued_at&revoked=eq.false'),
    ]);

    const territories = {};
    const families = {};
    works.forEach(w => {
      if (w.territory) territories[w.territory] = (territories[w.territory] || 0) + 1;
      if (w.family) families[w.family] = (families[w.family] || 0) + 1;
    });

    const completenessValues = certs.map(c => c.metadata_json?.completude_pct || 0);
    const avgCompleteness = completenessValues.length
      ? Math.round(completenessValues.reduce((a, b) => a + b, 0) / completenessValues.length)
      : 0;
    const fullyComplete = completenessValues.filter(p => p === 100).length;

    return json({
      version: '2.0',
      generated_at: new Date().toISOString(),
      totals: {
        works: works.length,
        certified_works: certs.length,
        territories_represented: Object.keys(territories).length,
        families_represented: Object.keys(families).length,
      },
      completeness: {
        average_pct: avgCompleteness,
        fully_complete: fullyComplete,
        description: 'Percentage of 6 CMS families filled per work',
      },
      by_territory: territories,
      by_family: families,
    });
  } catch (e) {
    return json({ error: 'Database error', message: e.message }, 500);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatWork(work, cert, full = false) {
  const meta = cert?.metadata_json || {};
  const families_filled = meta.families_filled || 0;
  const completude_pct = meta.completude_pct || 0;

  const base = {
    cms_id: cert?.cms_id || null,
    id: work.id,
    title: work.title,
    title_original: work.title_original || null,
    family: work.family,
    year: work.year,
    territory: work.territory,
    languages: work.languages || [],
    creator: work.creators ? {
      name: work.creators.name,
      type: work.creators.type,
      territory: work.creators.territory,
    } : null,
    completeness: {
      families_filled,
      total_families: 6,
      percentage: completude_pct,
    },
    certified: !!cert,
    certified_at: cert?.issued_at || null,
    standard: 'CMS v2.0',
    registry: 'https://caribbeanmetadata.org/certification.html',
  };

  if (full) {
    base.description = work.description || null;
    base.metadata_tags = meta.metadata_tags || {};
  }

  return base;
}

async function sbFetch(path) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) throw new Error(`Supabase error ${r.status}`);
  return r.json();
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: CORS_HEADERS,
  });
}
