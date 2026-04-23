/**
 * CMS Navigation Fix — caribbeanmetadata.org
 * ============================================
 * VERSION DÉFINITIVE — FR + EN + ES
 * - Nav canonique unifiée 3 langues avec hamburger mobile
 * - Footer canonique unifié 3 langues
 * - Switcher FR | EN | ES intégré
 * - Marquage automatique de la page active
 *
 * USAGE — UNE LIGNE à la fin de chaque <body> :
 *   <script src="nav-fix.js"></script>
 *
 * Convention de nommage des fichiers :
 *   FR  : page.html        (ex: about.html)
 *   EN  : page-en.html     (ex: about-en.html)
 *   ES  : page-es.html     (ex: about-es.html)
 */

(function () {
  'use strict';

  // ── DÉTECTION LANGUE ─────────────────────────────────────────────────────────
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const lang = page.endsWith('-es.html') ? 'es'
             : page.endsWith('-en.html') ? 'en'
             : 'fr';
  const basePage = page.replace(/-en\.html$/, '').replace(/-es\.html$/, '').replace(/\.html$/, '');

  function pageFor(l) {
    if (l === 'fr') return basePage + '.html';
    return basePage + '-' + l + '.html';
  }

  // ── NAV ITEMS ────────────────────────────────────────────────────────────────
  const NAV = {
    fr: [
      { href: 'about.html',        label: 'À propos' },
      { href: 'families.html',     label: 'Les 6 familles' },
      { href: 'resources.html',    label: 'Ressources' },
      { href: 'lab.html',          label: 'Language Lab' },
      { href: 'collaborate.html',  label: 'Collaborer' },
      { href: 'declaration.html',  label: 'Déclaration' },
      { href: 'contact.html',      label: 'Contact' },
      { href: 'founders.html',     label: 'Les 100 Premiers' },
      { href: 'validator.html',    label: 'Valider un contenu', cta: true },
    ],
    en: [
      { href: 'about-en.html',       label: 'About' },
      { href: 'families-en.html',    label: 'The 6 Families' },
      { href: 'resources.html',      label: 'Resources' },
      { href: 'lab-en.html',         label: 'Language Lab' },
      { href: 'collaborate-en.html', label: 'Collaborate' },
      { href: 'declaration-en.html', label: 'Declaration' },
      { href: 'contact-en.html',     label: 'Contact' },
      { href: 'founders-en.html',    label: 'The 100 Founders' },
      { href: 'validator.html',      label: 'Certify content', cta: true },
    ],
    es: [
      { href: 'about-es.html',       label: 'Acerca de' },
      { href: 'families-es.html',    label: 'Las 6 familias' },
      { href: 'resources.html',      label: 'Recursos' },
      { href: 'lab-es.html',         label: 'Language Lab' },
      { href: 'collaborate-es.html', label: 'Colaborar' },
      { href: 'declaration-es.html', label: 'Declaración' },
      { href: 'contact-es.html',     label: 'Contacto' },
      { href: 'founders-es.html',    label: 'Los 100 Primeros' },
      { href: 'validator.html',      label: 'Certificar contenido', cta: true },
    ]
  };

  // ── FOOTER ───────────────────────────────────────────────────────────────────
  const FOOTER = {
    fr: {
      tagline: 'Caribbean Metadata Standard — Structurer la visibilité culturelle caribéenne. Un projet du Caribwood Language Lab.',
      cols: [
        { title: 'Le Standard', links: [
          { href: 'about.html',        label: 'À propos' },
          { href: 'families.html',     label: 'Les 6 familles' },
          { href: 'resources.html',    label: 'Documentation' },
          { href: 'declaration.html',  label: 'Déclaration fondatrice' },
        ]},
        { title: 'Écosystème', links: [
          { href: 'lab.html',          label: 'Language Lab' },
          { href: 'collaborate.html',  label: 'Collaborer' },
          { href: 'contact.html',      label: 'Contact' },
        ]},
        { title: 'Ressources', links: [
          { href: 'resources.html',      label: 'White Paper' },
          { href: 'glossaire.html',      label: 'Glossaire' },
          { href: 'developers.html',     label: 'Developers / API' },
          { href: 'resources.html#faq',  label: 'FAQ' },
          { href: 'press-fr.html',       label: 'Presse' },
          { href: 'founders.html',       label: '→ Les 100 Premiers' },
          { href: 'validator.html',      label: '→ Valider un contenu' },
        ]},
      ]
    },
    en: {
      tagline: 'Caribbean Metadata Standard — Structuring Caribbean cultural visibility. A Caribwood Language Lab project.',
      cols: [
        { title: 'The Standard', links: [
          { href: 'about-en.html',       label: 'About' },
          { href: 'families-en.html',    label: 'The 6 Families' },
          { href: 'resources.html',      label: 'Documentation' },
          { href: 'declaration-en.html', label: 'Founding Declaration' },
        ]},
        { title: 'Ecosystem', links: [
          { href: 'lab-en.html',         label: 'Language Lab' },
          { href: 'collaborate-en.html', label: 'Collaborate' },
          { href: 'contact-en.html',     label: 'Contact' },
        ]},
        { title: 'Resources', links: [
          { href: 'resources.html',      label: 'White Paper' },
          { href: 'glossaire.html',      label: 'Glossary' },
          { href: 'developers.html',     label: 'Developers / API' },
          { href: 'resources.html#faq',  label: 'FAQ' },
          { href: 'press-en.html',       label: 'Press' },
          { href: 'founders-en.html',    label: '→ The 100 Founders' },
          { href: 'validator.html',      label: '→ Certify content' },
        ]},
      ]
    },
    es: {
      tagline: 'Caribbean Metadata Standard — Estructurando la visibilidad cultural caribeña. Un proyecto de Caribwood Language Lab.',
      cols: [
        { title: 'El Estándar', links: [
          { href: 'about-es.html',       label: 'Acerca de' },
          { href: 'families-es.html',    label: 'Las 6 familias' },
          { href: 'resources.html',      label: 'Documentación' },
          { href: 'declaration-es.html', label: 'Declaración Fundadora' },
        ]},
        { title: 'Ecosistema', links: [
          { href: 'lab-es.html',         label: 'Language Lab' },
          { href: 'collaborate-es.html', label: 'Colaborar' },
          { href: 'contact-es.html',     label: 'Contacto' },
        ]},
        { title: 'Recursos', links: [
          { href: 'resources.html',      label: 'White Paper' },
          { href: 'glossaire.html',      label: 'Glosario' },
          { href: 'developers.html',     label: 'Developers / API' },
          { href: 'resources.html#faq',  label: 'FAQ' },
          { href: 'press-es.html',       label: 'Prensa' },
          { href: 'founders-es.html',    label: '→ Los 100 Primeros' },
          { href: 'validator.html',      label: '→ Certificar contenido' },
        ]},
      ]
    }
  };

  // ── CSS ──────────────────────────────────────────────────────────────────────
  const CSS = `
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(255,255,255,0.98); border-bottom: 1px solid rgba(0,0,0,0.1);
      padding: 0 6%; height: 68px; display: flex; align-items: center;
      justify-content: space-between;
    }
    nav .cms-logo { font-size: 20px; font-weight: 700; color: #003E6B;
      text-decoration: none; letter-spacing: 2px; flex-shrink: 0; }
    nav .nav-links { display: flex; gap: 16px; list-style: none; align-items: center; flex-wrap: nowrap; }
    nav .nav-links a { font-size: 12px; color: #2a2a2a; text-decoration: none;
      transition: color .2s; font-weight: 500; white-space: nowrap; }
    nav .nav-links a:hover, nav .nav-links a.active { color: #003E6B; }
    nav .nav-links a.active { font-weight: 700; }
    nav .nav-links a.nav-cta { padding: 7px 14px; background: #00C2C7;
      color: #003E6B !important; border-radius: 4px; font-weight: 700 !important;
      font-size: 11px; letter-spacing: 0.5px; }
    nav .nav-links a.nav-cta:hover { background: #00A8AE !important; }
    .lang-switcher { display: flex; align-items: center; gap: 3px; margin-left: 10px; flex-shrink: 0; }
    .lang-switcher a { font-size: 11px; font-weight: 700; padding: 4px 7px;
      border-radius: 3px; text-decoration: none; letter-spacing: 0.5px; transition: all .2s; }
    .lang-switcher a.lang-active { background: #003E6B; color: #fff; }
    .lang-switcher a:not(.lang-active) { color: #003E6B; border: 1px solid rgba(0,62,107,0.25); }
    .lang-switcher a:not(.lang-active):hover { background: rgba(0,62,107,0.08); }
    .nav-burger { display: none; flex-direction: column; justify-content: center;
      gap: 5px; width: 36px; height: 36px; cursor: pointer;
      background: none; border: none; padding: 4px; flex-shrink: 0; }
    .nav-burger span { display: block; height: 2px; background: #003E6B;
      border-radius: 2px; transition: all .3s; }
    .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-burger.open span:nth-child(2) { opacity: 0; }
    .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    @media (max-width: 1100px) {
      .nav-burger { display: flex; }
      nav .nav-links { display: none; position: fixed; top: 68px; left: 0; right: 0;
        background: rgba(255,255,255,0.98); flex-direction: column;
        align-items: flex-start; padding: 24px 6%; gap: 0;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08); max-height: calc(100vh - 68px); overflow-y: auto; }
      nav .nav-links.open { display: flex; }
      nav .nav-links li { width: 100%; }
      nav .nav-links a { display: block; padding: 12px 0;
        border-bottom: 1px solid rgba(0,62,107,0.06); font-size: 15px; }
      nav .nav-links li:last-child a { border-bottom: none; }
      .lang-switcher { margin-left: 0; padding: 12px 0; border-bottom: none; }
    }
    footer { background: #003E6B; padding: 56px 6% 32px; }
    .footer-logo { font-size: 22px; font-weight: 700; color: #fff; letter-spacing: 2px;
      text-decoration: none; display: block; margin-bottom: 12px; }
    .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 40px; max-width: 320px; }
    .footer-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .footer-col-title { font-size: 11px; font-weight: 700; color: #00C2C7; letter-spacing: 2px;
      margin-bottom: 16px; text-transform: uppercase; }
    .footer-cols ul { list-style: none; padding: 0; margin: 0; }
    .footer-cols li { margin-bottom: 8px; }
    .footer-cols a { font-size: 13px; color: rgba(255,255,255,0.75); text-decoration: none; transition: color .2s; }
    .footer-cols a:hover { color: #fff; }
    .footer-credit { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.15);
      font-size: 12px; color: rgba(255,255,255,0.5); text-align: center; }
    @media (max-width: 900px) {
      .footer-cols { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 600px) {
      .footer-cols { grid-template-columns: 1fr; }
    }
  `;

  // ── BUILD NAV ────────────────────────────────────────────────────────────────
  function buildNav() {
    const nav = document.createElement('nav');
    const items = NAV[lang];
    const indexPage = lang === 'fr' ? 'index.html' : 'index-' + lang + '.html';

    const logo = document.createElement('a');
    logo.href = indexPage;
    logo.className = 'cms-logo';
    logo.textContent = 'CMS';
    nav.appendChild(logo);

    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(burger);

    const ul = document.createElement('ul');
    ul.className = 'nav-links';

    items.forEach(function(item) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if (item.href.split('#')[0] === page) a.classList.add('active');
      if (item.cta) a.classList.add('nav-cta');
      li.appendChild(a);
      ul.appendChild(li);
    });

    // Switcher FR | EN | ES
    const switcherLi = document.createElement('li');
    const switcherDiv = document.createElement('div');
    switcherDiv.className = 'lang-switcher';
    ['fr', 'en', 'es'].forEach(function(l) {
      const a = document.createElement('a');
      a.href = pageFor(l);
      a.textContent = l.toUpperCase();
      if (l === lang) a.classList.add('lang-active');
      switcherDiv.appendChild(a);
    });
    switcherLi.appendChild(switcherDiv);
    ul.appendChild(switcherLi);
    nav.appendChild(ul);

    burger.addEventListener('click', function() {
      burger.classList.toggle('open');
      ul.classList.toggle('open');
    });
    ul.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        burger.classList.remove('open');
        ul.classList.remove('open');
      });
    });

    return nav;
  }

  // ── BUILD FOOTER ─────────────────────────────────────────────────────────────
  function buildFooter() {
    const f = FOOTER[lang];
    const indexPage = lang === 'fr' ? 'index.html' : 'index-' + lang + '.html';
    const footer = document.createElement('footer');

    const logo = document.createElement('a');
    logo.href = indexPage;
    logo.className = 'footer-logo';
    logo.textContent = 'CMS';
    footer.appendChild(logo);

    const tagline = document.createElement('p');
    tagline.className = 'footer-tagline';
    tagline.textContent = f.tagline;
    footer.appendChild(tagline);

    const colsDiv = document.createElement('div');
    colsDiv.className = 'footer-cols';
    f.cols.forEach(function(col) {
      const div = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'footer-col-title';
      title.textContent = col.title;
      div.appendChild(title);
      const ul = document.createElement('ul');
      col.links.forEach(function(link) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        li.appendChild(a);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      colsDiv.appendChild(div);
    });
    footer.appendChild(colsDiv);

    const credit = document.createElement('p');
    credit.className = 'footer-credit';
    credit.innerHTML = '<strong>caribbeanmetadata.org</strong> · CMS v1.0 · Caribwood Language Lab — Guadeloupe';
    footer.appendChild(credit);

    return footer;
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const existingNav = document.querySelector('nav');
    const newNav = buildNav();
    if (existingNav) existingNav.parentNode.replaceChild(newNav, existingNav);
    else document.body.insertBefore(newNav, document.body.firstChild);

    const existingFooter = document.querySelector('footer');
    const newFooter = buildFooter();
    if (existingFooter) existingFooter.parentNode.replaceChild(newFooter, existingFooter);
    else document.body.appendChild(newFooter);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
