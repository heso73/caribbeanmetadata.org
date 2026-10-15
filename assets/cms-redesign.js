/**
 * Caribbean Metadata Standard — animations du design v3
 * - réseau de points animé dans le héros (canvas, aucune dépendance)
 * - apparition progressive des blocs au défilement
 * Ne modifie ni le contenu ni les balises SEO. Désactivé si
 * l'utilisateur demande « réduire les animations ».
 */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Réseau de points ---------- */
  function initNetwork() {
    var hero = document.querySelector('.hero, .page-hero, .hero-page');
    if (!hero || hero.querySelector('.cms-net')) return;
    var c = document.createElement('canvas');
    c.className = 'cms-net';
    c.setAttribute('aria-hidden', 'true');
    hero.insertBefore(c, hero.firstChild);
    var x = c.getContext('2d'), W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [], raf = 0, visible = true;

    function size() {
      W = c.width = hero.offsetWidth * dpr;
      H = c.height = hero.offsetHeight * dpr;
      var n = Math.max(24, Math.min(80, Math.floor(hero.offsetWidth / 16)));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .22 * dpr, vy: (Math.random() - .5) * .22 * dpr,
          r: (.8 + Math.random() * 1.8) * dpr
        });
      }
    }
    function frame() {
      x.clearRect(0, 0, W, H);
      var d = 140 * dpr, i, j, p, q, dx, dy, dd;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (!reduce) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
      }
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < d) {
            x.strokeStyle = 'rgba(120,225,255,' + (.32 * (1 - dd / d)).toFixed(3) + ')';
            x.lineWidth = dpr * .8;
            x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke();
          }
        }
        x.fillStyle = 'rgba(190,243,255,.9)';
        x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.2832); x.fill();
      }
      if (!reduce && visible) raf = requestAnimationFrame(frame);
    }
    size(); frame();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(function () { size(); if (reduce) frame(); }, 150); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
      }).observe(hero);
    }
  }

  /* ---------- Apparition au défilement ---------- */
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    var sel = '.cms-v3 .sec-head,.cms-v3 .why-card,.cms-v3 .fam-card,.cms-v3 .bl-item,.cms-v3 .iva-mock,' +
              '.cms-v3 .cs,.cms-v3 .api-win,.cms-v3 .gc,.cms-v3 .timeline,.cms-v3 .jc,.cms-v3 .diagram-wrap';
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    doc.classList.add('cms-js');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('cms-in'); io.unobserve(e.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el, i) {
      el.classList.add('cms-reveal');
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  }

  function start() { initNetwork(); initReveal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
