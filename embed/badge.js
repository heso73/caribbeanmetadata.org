(function () {
  var API_BASE = 'https://api.caribbeanmetadata.org/api/v1/works/';
  var LEVEL_COLORS = { platinum: '#6b5b95', gold: '#c9a227', silver: '#8a8f98', bronze: '#a9673a' };
  var LEVEL_LABELS = { platinum: 'Platine', gold: 'Or', silver: 'Argent', bronze: 'Bronze' };

  function renderBadge(el, work) {
    var level = work.compliance_level || 'bronze';
    var color = LEVEL_COLORS[level] || '#333';
    var label = LEVEL_LABELS[level] || level;

    var a = document.createElement('a');
    a.href = work.registry || 'https://caribbeanmetadata.org';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.cssText =
      'display:inline-flex;align-items:center;gap:6px;' +
      'font-family:system-ui,-apple-system,sans-serif;font-size:12px;' +
      'padding:4px 10px;border-radius:999px;text-decoration:none;' +
      'background:#0b1f2a;color:#fff;border:1px solid ' + color + ';';

    a.innerHTML =
      '<span style="width:6px;height:6px;border-radius:50%;background:' + color + ';display:inline-block;"></span>' +
      'Certifié CMS · ' + (work.territory || '') + ' · ' + label;

    el.innerHTML = '';
    el.appendChild(a);
  }

  function renderError(el) {
    el.style.display = 'none'; // échec silencieux, jamais de badge cassé visible chez le partenaire
  }

  function init() {
    document.querySelectorAll('.cms-badge[data-cms-id]').forEach(function (el) {
      var cmsId = el.getAttribute('data-cms-id');
      fetch(API_BASE + encodeURIComponent(cmsId))
        .then(function (r) { if (!r.ok) throw new Error('not found'); return r.json(); })
        .then(function (work) { renderBadge(el, work); })
        .catch(function () { renderError(el); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
