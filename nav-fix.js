/**
 * CMS Navigation Fix — caribbeanmetadata.org
 * ============================================
 * - Nav canonique unifiée FR avec hamburger mobile
 * - Footer canonique unifié FR
 * - Marquage automatique de la page active
 * - Hamburger fonctionnel sur mobile
 *
 * USAGE — ajouter UNE LIGNE à la fin de chaque <body> FR :
 *   <script src="nav-fix.js"></script>
 */

(function () {
  'use strict';

  // ── NAV CANONIQUE FR ────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { href: 'about.html',       label: 'À propos' },
    { href: 'families.html',    label: 'Les 6 familles' },
    { href: 'resources.html',   label: 'Ressources' },
    { href: 'lab.html',         label: 'Language Lab' },
    { href: 'collaborate.html', label: 'Collaborer' },
    { href: 'declaration.html', label: 'Déclaration' },
    { href: 'contact.html',     label: 'Contact' },
    { href: 'founders.html',    label: 'Les 100 Premiers' },
    { href: 'validator.html',   label: 'Valider un contenu', cta: true },
  ];

  // ── FOOTER CANONIQUE FR ─────────────────────────────────────────────────────
  const FOOTER_COLS = [
    {
      title: 'Le Standard',
      links: [
        { href: 'about.html',       label: 'À propos' },
        { href: 'families.html',    label: 'Les 6 familles' },
        { href: 'resources.html',   label: 'Documentation' },
        { href: 'declaration.html', label: 'Déclaration fondatrice' },
      ]
    },
    {
      title: 'Écosystème',
      links: [
        { href: 'lab.html',         label: 'Language Lab' },
        { href: 'collaborate.html', label: 'Collaborer' },
        { href: 'contact.html',     label: 'Contact' },
      ]
    },
    {
      title: 'Ressources',
      links: [
        { href: 'resources.html',   label: 'White Paper' },
        { href: 'glossaire.html',   label: 'Glossaire' },
        { href: 'developers.html',  label: 'Developers / API' },
        { href: 'resources.html#faq', label: 'FAQ' },
        { href: 'press-fr.html',    label: 'Presse' },
        { href: 'founders.html',    label: '→ Les 100 Premiers' },
        { href: 'validator.html',   label: '→ Valider un contenu' },
      ]
    },
  ];

  // ── CSS HAMBURGER ────────────────────────────────────────────────────────────
  const CSS = `
    nav { position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
      background: rgba(255,255,255,0.98); border-bottom: 1px solid rgba(0,0,0,0.1);
      padding: 0 6%; height: 68px; display: flex; align-items: center;
      justify-content: space-between; }
    nav .logo { font-size: 20px; font-weight: 700; color: #003E6B;
      text-decoration: none; letter-spacing: 2px; }
    nav ul { display: flex; gap: 20px; list-style: none; align-items: center; }
    nav ul a { font-size: 13px; color: #2a2a2a; text-decoration: none;
      transition: color .2s; font-weight: 500; }
    nav ul a:hover, nav ul a.active { color: #003E6B; }
    nav ul a.active { font-weight: 700; }
    nav ul a.nav-cta { padding: 7px 16px; background: #00C2C7; color: #003E6B !important;
      border-radius: 4px; font-weight: 700 !important; font-size: 12px; letter-spacing: 0.5px; }
    nav ul a.nav-cta:hover { background: #00A8AE !important; }
    .nav-burger { display: none; flex-direction: column; justify-content: center;
      gap: 5px; width: 36px; height: 36px; cursor: pointer;
      background: none; border: none; padding: 4px; }
    .nav-burger span { display: block; height: 2px; background: #003E6B;
      border-radius: 2px; transition: all .3s; }
    .nav-burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .nav-burger.open span:nth-child(2) { opacity: 0; }
    .nav-burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    @media (max-width: 900px) {
      .nav-burger { display: flex; }
      nav ul { display: none; position: fixed; top: 68px; left: 0; right: 0;
        background: rgba(255,255,255,0.98); flex-direction: column;
        align-items: flex-start; padding: 24px 6%; gap: 0;
        border-bottom: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
      nav ul.open { display: flex; }
      nav ul li { width: 100%; }
      nav ul a { display: block; padding: 12px 0;
        border-bottom: 1px solid rgba(0,62,107,0.06); font-size: 15px; }
      nav ul li:last-child a { border-bottom: none; }
    }
  `;

  // ── HELPERS ─────────────────────────────────────────────────────────────────
  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
  }

  function isActive(href) {
    return href.split('#')[0] === currentPage();
  }

  function injectCSS() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ── BUILD NAV ────────────────────────────────────────────────────────────────
  function buildNav() {
    const nav = document.createElement('nav');

    // Logo
    const logo = document.createElement('a');
    logo.href = 'index.html';
    logo.className = 'logo';
    logo.textContent = 'CMS';
    nav.appendChild(logo);

    // Hamburger button
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.id = 'nav-burger';
    burger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(burger);

    // Links list
    const ul = document.createElement('ul');
    ul.id = 'nav-links';
    NAV_ITEMS.forEach(function(item) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if (isActive(item.href)) a.classList.add('active');
      if (item.cta) a.classList.add('nav-cta');
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);

    // Hamburger click handler
    burger.addEventListener('click', function() {
      burger.classList.toggle('open');
      ul.classList.toggle('open');
    });

    // Close menu when a link is clicked
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
    const footer = document.createElement('footer');

    const logo = document.createElement('a');
    logo.href = 'index.html';
    logo.className = 'footer-logo';
    logo.textContent = 'CMS';
    footer.appendChild(logo);

    const tagline = document.createElement('p');
    tagline.className = 'footer-tagline';
    tagline.textContent = 'Caribbean Metadata Standard — Structurer la visibilité culturelle caribéenne. Un projet du Caribwood Language Lab.';
    footer.appendChild(tagline);

    const colsDiv = document.createElement('div');
    colsDiv.className = 'footer-cols';
    FOOTER_COLS.forEach(function(col) {
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

  // ── INJECT ───────────────────────────────────────────────────────────────────
  function init() {
    injectCSS();

    // Nav
    const existingNav = document.querySelector('nav');
    const newNav = buildNav();
    if (existingNav) {
      existingNav.parentNode.replaceChild(newNav, existingNav);
    } else {
      document.body.insertBefore(newNav, document.body.firstChild);
    }

    // Footer
    const existingFooter = document.querySelector('footer');
    const newFooter = buildFooter();
    if (existingFooter) {
      existingFooter.parentNode.replaceChild(newFooter, existingFooter);
    } else {
      document.body.appendChild(newFooter);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
