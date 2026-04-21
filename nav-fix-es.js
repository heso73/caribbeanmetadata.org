/**
 * CMS Navigation Fix — ES pages
 * Drop-in for all *-es.html pages.
 * Usage: <script src="nav-fix-es.js"></script>
 *        <script src="lang-switcher.js"></script>
 */
(function () {
  'use strict';

  const NAV_ITEMS = [
    { href: 'about-es.html',       label: 'Acerca de' },
    { href: 'families-es.html',    label: 'Las 6 familias' },
    { href: 'resources.html',      label: 'Recursos' },
    { href: 'lab-es.html',         label: 'Language Lab' },
    { href: 'collaborate-es.html', label: 'Colaborar' },
    { href: 'declaration-es.html', label: 'Declaración' },
    { href: 'contact.html',        label: 'Contacto' },
    { href: 'founders-es.html',    label: 'Los 100 Primeros' },
    { href: 'validator.html',      label: 'Certificar contenido' },
  ];

  const FOOTER_COLS = [
    {
      title: 'El Estándar',
      links: [
        { href: 'about-es.html',       label: 'Acerca de' },
        { href: 'families-es.html',    label: 'Las 6 familias' },
        { href: 'resources.html',      label: 'Documentación' },
        { href: 'declaration-es.html', label: 'Declaración Fundadora' },
      ]
    },
    {
      title: 'Ecosistema',
      links: [
        { href: 'lab-es.html',         label: 'Language Lab' },
        { href: 'collaborate-es.html', label: 'Colaborar' },
        { href: 'contact.html',        label: 'Contacto' },
      ]
    },
    {
      title: 'Recursos',
      links: [
        { href: 'CMS_WhitePaper_v1.0.pdf', label: 'White Paper ↓' },
        { href: 'glossaire.html',          label: 'Glosario' },
        { href: 'developers.html',         label: 'Desarrolladores / API' },
        { href: 'resources.html',          label: 'FAQ' },
        { href: 'press-es.html',           label: 'Prensa' },
        { href: 'founders-es.html',        label: '→ Los 100 Primeros' },
        { href: 'validator.html',          label: '→ Certificar contenido' },
      ]
    },
  ];

  function currentPage() {
    return window.location.pathname.split('/').pop() || 'index-es.html';
  }

  function buildNav() {
    const nav = document.createElement('nav');
    const logo = document.createElement('a');
    logo.href = 'index-es.html';
    logo.className = 'logo';
    logo.textContent = 'CMS';
    nav.appendChild(logo);
    const ul = document.createElement('ul');
    NAV_ITEMS.forEach(function (item) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.label;
      if (item.href === currentPage()) a.className = 'active';
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    return nav;
  }

  function buildFooter() {
    const footer = document.createElement('footer');
    const logo = document.createElement('a');
    logo.href = 'index-es.html';
    logo.className = 'footer-logo';
    logo.textContent = 'CMS';
    footer.appendChild(logo);
    const tagline = document.createElement('p');
    tagline.className = 'footer-tagline';
    tagline.textContent = 'Caribbean Metadata Standard — Estructurando la visibilidad cultural caribeña. Un proyecto del Caribwood Language Lab.';
    footer.appendChild(tagline);
    const cols = document.createElement('div');
    cols.className = 'footer-cols';
    FOOTER_COLS.forEach(function (col) {
      const div = document.createElement('div');
      const title = document.createElement('p');
      title.className = 'footer-col-title';
      title.textContent = col.title;
      div.appendChild(title);
      const ul = document.createElement('ul');
      col.links.forEach(function (link) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.label;
        li.appendChild(a);
        ul.appendChild(li);
      });
      div.appendChild(ul);
      cols.appendChild(div);
    });
    footer.appendChild(cols);
    const credit = document.createElement('p');
    credit.className = 'footer-credit';
    credit.innerHTML = '<strong>caribbeanmetadata.org</strong> · CMS v1.0 · Caribwood Language Lab — Guadeloupe';
    footer.appendChild(credit);
    return footer;
  }

  function init() {
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
