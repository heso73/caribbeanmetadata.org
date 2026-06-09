// ══════════════════════════════════════════════════════════════════════════════
// CMS API — Caribbean Metadata Standard
// Cloudflare Worker v2.0
// Caribwood Language Lab · 2026
// ══════════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = 'https://vtbaqvjxfgseykjcinpu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_cZc3a7kaK3M7ZcHRsoTI8w_NQz4Xy0z';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// ── Supabase REST helper ──────────────────────────────────────────────────────
async function sb(path, params = '') {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}${params}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!r.ok) throw new Error(`Supabase error ${r.status}`);
  return r.json();
}

async function sbPost(path, data) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || `Insert error ${r.status}`);
  }
  return r.json();
}

// ── Response helpers ──────────────────────────────────────────────────────────
function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: CORS_HEADERS,
  });
}

function error(message, status = 400) {
  return json({ error: message, status }, status);
}

// ── Router ────────────────────────────────────────────────────────────────────
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ── GET /api/v2 — Index ──────────────────────────────────────────────────
    if (path === '/api/v2' || path === '/api/v2/') {
      return json({
        name: 'Caribbean Metadata Standard API',
        version: '2.0',
        standard: 'CMS v2.0',
        maintainer: 'Caribwood Language Lab — Guadeloupe',
        website: 'https://caribbeanmetadata.org',
        licence: 'CC-BY 4.0',
        endpoints: {
          'GET /api/v2': 'This index',
          'GET /api/v2/stats': 'Platform statistics',
          'GET /api/v2/works': 'List works (filters: territory, family, language, status, limit, offset)',
          'GET /api/v2/works/:id': 'Get a specific work by UUID',
          'POST /api/v2/works': 'Submit a new work for CMS registration',
          'GET /api/v2/certifications': 'List certifications (filters: territory, limit, offset)',
          'GET /api/v2/certifications/:cms_id': 'Verify a certification by CMS ID',
          'GET /api/v2/vocabulary/markers': '27 official CMS cultural markers',
          'GET /api/v2/vocabulary/languages': '10 Caribbean languages (ISO 639-3)',
          'GET /api/v2/vocabulary/territories': '20 Caribbean territories',
          'GET /api/v2/vocabulary/domains': '14 cultural domains',
        },
      });
    }

    // ── GET /api/v2/stats ────────────────────────────────────────────────────
    if (path === '/api/v2/stats' && method === 'GET') {
      try {
        const [works, certs, creators] = await Promise.all([
          sb('works', '?select=status,territory,family,languages'),
          sb('certifications', '?select=level,issued_at&revoked=eq.false'),
          sb('creators', '?select=id&verified=eq.true'),
        ]);

        const territories = new Set(works.map(w => w.territory).filter(Boolean));
        const families = new Set(works.map(w => w.family).filter(Boolean));
        const langs = new Set(works.flatMap(w => w.languages || []).filter(Boolean));
        const byStatus = works.reduce((acc, w) => { acc[w.status] = (acc[w.status]||0)+1; return acc; }, {});

        return json({
          cms_version: '2.0',
          last_updated: new Date().toISOString().split('T')[0],
          works: {
            total: works.length,
            by_status: byStatus,
            territories_covered: territories.size,
            families_covered: families.size,
            languages_covered: langs.size,
          },
          certifications: {
            total: certs.length,
          },
          creators: {
            verified: creators.length,
          },
          vocabulary: {
            cultural_markers: 27,
            languages: 10,
            territories: 20,
            domains: 14,
          },
          corpus: {
            records: 110,
            licence: 'CC-BY 4.0',
            source: 'https://github.com/heso73/cms-nlp-corpus',
          },
        });
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── GET /api/v2/works ────────────────────────────────────────────────────
    if (path === '/api/v2/works' && method === 'GET') {
      try {
        const territory = url.searchParams.get('territory');
        const family = url.searchParams.get('family');
        const language = url.searchParams.get('language');
        const status = url.searchParams.get('status') || 'validated';
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let params = `?select=id,title,title_original,family,year,territory,languages,status,submitted_at&status=eq.${status}`;
        if (territory) params += `&territory=eq.${encodeURIComponent(territory)}`;
        if (family) params += `&family=eq.${encodeURIComponent(family)}`;
        if (language) params += `&languages=cs.{${encodeURIComponent(language)}}`;
        params += `&order=submitted_at.desc&limit=${limit}&offset=${offset}`;

        const works = await sb('works', params);

        return json({
          data: works,
          meta: {
            limit,
            offset,
            count: works.length,
            filters: { territory, family, language, status },
          },
        });
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── GET /api/v2/works/:id ────────────────────────────────────────────────
    const workMatch = path.match(/^\/api\/v2\/works\/([a-f0-9-]{36})$/);
    if (workMatch && method === 'GET') {
      try {
        const id = workMatch[1];
        const works = await sb('works', `?id=eq.${id}&select=*,creators(name,type,territory)&limit=1`);
        if (!works.length) return error('Work not found', 404);
        return json({ data: works[0] });
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── POST /api/v2/works ───────────────────────────────────────────────────
    if (path === '/api/v2/works' && method === 'POST') {
      try {
        const body = await request.json();

        // Validation minimale
        if (!body.title) return error('title is required');
        if (!body.territory) return error('territory is required');
        if (!body.languages || !body.languages.length) return error('languages[] is required');

        // Créateur anonyme par défaut si pas fourni
        const creatorId = body.creator_id || '00000000-0000-0000-0000-000000000001';

        const work = await sbPost('works', {
          creator_id: creatorId,
          title: body.title,
          title_original: body.title_original || null,
          family: body.family || null,
          year: body.year || new Date().getFullYear(),
          territory: body.territory,
          languages: body.languages,
          description: body.description || null,
          status: 'pending',
        });

        return json({
          message: 'Work submitted successfully',
          data: work[0],
          next: 'Your submission will be reviewed by the CMS validation team.',
        }, 201);
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── GET /api/v2/certifications ───────────────────────────────────────────
    if (path === '/api/v2/certifications' && method === 'GET') {
      try {
        const territory = url.searchParams.get('territory');
        const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let params = `?select=cms_id,level,score,issued_at,works(title,territory,family,year)&revoked=eq.false`;
        if (territory) params += `&works.territory=eq.${encodeURIComponent(territory)}`;
        params += `&order=issued_at.desc&limit=${limit}&offset=${offset}`;

        const certs = await sb('certifications', params);
        return json({ data: certs, meta: { limit, offset, count: certs.length } });
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── GET /api/v2/certifications/:cms_id ───────────────────────────────────
    const certMatch = path.match(/^\/api\/v2\/certifications\/([A-Z0-9-]+)$/);
    if (certMatch && method === 'GET') {
      try {
        const cms_id = certMatch[1];
        const certs = await sb('certifications',
          `?cms_id=eq.${encodeURIComponent(cms_id)}&select=*,works(title,title_original,family,year,territory,languages,creators(name,type,territory))&limit=1`
        );
        if (!certs.length) return error(`No certification found for ID: ${cms_id}`, 404);
        const cert = certs[0];
        return json({
          valid: !cert.revoked,
          cms_id: cert.cms_id,
          issued_at: cert.issued_at,
          work: cert.works,
          completeness: cert.score,
          metadata: cert.metadata_json,
          standard: 'CMS v2.0',
          issuer: 'Caribwood Language Lab — caribbeanmetadata.org',
        });
      } catch (e) {
        return error(e.message, 500);
      }
    }

    // ── GET /api/v2/vocabulary/* ─────────────────────────────────────────────
    if (path === '/api/v2/vocabulary/markers' && method === 'GET') {
      return json({
        version: '2.0',
        total: 27,
        markers: [
          { id:'gwo_ka',      name:'Gwo Ka',          category:'music',    territory:'Guadeloupe' },
          { id:'bele',        name:'Bèlè',             category:'dance',    territory:'Martinique' },
          { id:'konpa',       name:'Konpa',            category:'music',    territory:'Haïti' },
          { id:'zouk',        name:'Zouk',             category:'music',    territory:'Antilles françaises' },
          { id:'calypso',     name:'Calypso',          category:'music',    territory:'Trinidad' },
          { id:'soca',        name:'Soca',             category:'music',    territory:'Trinidad' },
          { id:'reggae',      name:'Reggae',           category:'music',    territory:'Jamaica' },
          { id:'ska',         name:'Ska',              category:'music',    territory:'Jamaica' },
          { id:'dancehall',   name:'Dancehall',        category:'music',    territory:'Jamaica' },
          { id:'tumba',       name:'Tumba',            category:'music',    territory:'Curaçao' },
          { id:'son_cubano',  name:'Son Cubano',       category:'music',    territory:'Cuba' },
          { id:'salsa',       name:'Salsa',            category:'music',    territory:'Caraïbe' },
          { id:'bachata',     name:'Bachata',          category:'music',    territory:'Dominican Republic' },
          { id:'merengue',    name:'Merengue',         category:'music',    territory:'Dominican Republic' },
          { id:'kaseko',      name:'Kaseko',           category:'music',    territory:'Suriname' },
          { id:'kadans',      name:'Kadans',           category:'music',    territory:'Antilles françaises' },
          { id:'bouyon',      name:'Bouyon',           category:'music',    territory:'Dominica' },
          { id:'carnival',    name:'Carnival',         category:'carnival', territory:'Pan-caribéenne' },
          { id:'mas',         name:'Mas',              category:'carnival', territory:'Trinidad' },
          { id:'rara',        name:'Rara',             category:'carnival', territory:'Haïti' },
          { id:'vodou',       name:'Vodou',            category:'religion', territory:'Haïti' },
          { id:'orisha',      name:'Orisha',           category:'religion', territory:'Caraïbe' },
          { id:'rastafari',   name:'Rastafari',        category:'religion', territory:'Jamaica' },
          { id:'maroon',      name:'Maroon Culture',   category:'heritage', territory:'Caraïbe' },
          { id:'quadrille',   name:'Quadrille créole', category:'dance',    territory:'Antilles françaises' },
          { id:'danmye',      name:'Danmyé',           category:'dance',    territory:'Martinique' },
          { id:'chante_noel', name:'Chanté Noël',      category:'heritage', territory:'Antilles françaises' },
        ],
      });
    }

    if (path === '/api/v2/vocabulary/languages' && method === 'GET') {
      return json({
        version: '2.0',
        standard: 'ISO 639-3',
        total: 10,
        languages: [
          { code:'gcf', name:'Créole guadeloupéen', territory:'Guadeloupe' },
          { code:'acf', name:'Créole antillais',    territory:'Martinique' },
          { code:'hat', name:'Créole haïtien',      territory:'Haïti' },
          { code:'jam', name:'Jamaican Patois',     territory:'Jamaica' },
          { code:'pap', name:'Papiamentu',          territory:'Aruba · Curaçao' },
          { code:'srn', name:'Sranan Tongo',        territory:'Suriname' },
          { code:'nld', name:'Nederlands Caribisch',territory:'Suriname · Antilles NL' },
          { code:'fra', name:'Français caribéen',   territory:'Antilles françaises' },
          { code:'eng', name:'English Caribbean',   territory:'Trinidad · Barbados' },
          { code:'spa', name:'Español caribeño',    territory:'Cuba · RD · PR' },
        ],
      });
    }

    if (path === '/api/v2/vocabulary/territories' && method === 'GET') {
      return json({
        version: '2.0',
        total: 20,
        territories: [
          'Guadeloupe','Martinique','Haiti','Guyane','Jamaica','Trinidad',
          'Barbados','Cuba','Dominican Republic','Puerto Rico','Aruba',
          'Curacao','Suriname','Dominica','St Lucia','St Vincent',
          'Grenada','Antigua','Diaspora caribéenne','Caribbean (général)',
        ],
      });
    }

    if (path === '/api/v2/vocabulary/domains' && method === 'GET') {
      return json({
        version: '2.0',
        total: 14,
        domains: [
          'music','dance','theatre','literature','oral_tradition',
          'intangible_heritage','religion','gastronomy','carnival',
          'visual_arts','education','general','news','social_media',
        ],
      });
    }

    // ── Backward compatibility — v1 routes ───────────────────────────────────
    if (path.startsWith('/api/v1')) {
      return json({
        message: 'CMS API v1 is deprecated. Please use /api/v2',
        migration: 'https://caribbeanmetadata.org/developers.html',
        v2_index: '/api/v2',
      }, 301);
    }

    // ── 404 ──────────────────────────────────────────────────────────────────
    return json({
      error: 'Not found',
      available_versions: ['/api/v2'],
      documentation: 'https://caribbeanmetadata.org/developers.html',
    }, 404);
  },
};
