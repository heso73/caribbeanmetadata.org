/**
 * CMS Live Stats Loader
 * Caribbean Metadata Standard — Caribwood Language Lab
 *
 * Fetches live corpus statistics from the public CMS API and injects them
 * into any element carrying a [data-cms-stat] attribute on the page.
 * This replaces hardcoded numbers (which silently drift out of date as the
 * corpus grows every Sunday via the automated expansion worker) with a
 * single source of truth.
 *
 * Usage in HTML:
 *   <div data-cms-stat="totals.works">…</div>
 *   <div data-cms-stat="totals.territories_represented">…</div>
 *   <div data-cms-stat="by_territory.Cuba">…</div>
 *
 * Falls back silently (leaves existing static text untouched) if the API
 * is unreachable, so the site never shows a broken/empty number.
 */
(function () {
  const STATS_ENDPOINT = "https://cms-api.small-disk-3275.workers.dev/api/v1/stats";
  const CACHE_KEY = "cms_stats_cache_v1";
  const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes — avoids hammering the API on every page view

  function getNested(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }

  function applyStats(stats) {
    const nodes = document.querySelectorAll("[data-cms-stat]");
    nodes.forEach((node) => {
      const path = node.getAttribute("data-cms-stat");
      const value = getNested(stats, path);
      if (value !== undefined && value !== null) {
        node.textContent = typeof value === "number" ? value.toLocaleString("fr-FR") : value;
      }
      // If the path isn't found, the original static content stays as a safe fallback.
    });
  }

  function loadFromCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL_MS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveToCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      /* sessionStorage unavailable — non-fatal, just skip caching */
    }
  }

  function init() {
    const cached = loadFromCache();
    if (cached) {
      applyStats(cached);
      return;
    }
    fetch(STATS_ENDPOINT)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("stats fetch failed"))))
      .then((data) => {
        applyStats(data);
        saveToCache(data);
      })
      .catch(() => {
        // Network or API failure: leave static fallback text in the HTML untouched.
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
