/**
 * Cloudflare Pages Function: dynamische sitemap.xml
 * ------------------------------------------------------------------
 * Wird automatisch an GET /sitemap.xml gebunden und liefert eine
 * XML-Sitemap mit allen statischen Routen + allen aktiven Jobs aus
 * Supabase.
 *
 * Warum wichtig: Google indexiert nur URLs, die in der Sitemap stehen
 * oder verlinkt sind. Da die App ein SPA ist, hat der HTML-Crawler
 * keine Job-Links zu folgen — die Sitemap ist der einzige Weg, Google
 * auf jeden einzelnen Job hinzuweisen.
 *
 * Die Supabase-URL + Anon-Key werden aus config.js ausgelesen (kopiert,
 * damit die Function unabhängig vom Client-JS läuft).
 */

// WICHTIG: Werte müssen mit config.js übereinstimmen.
// Wenn sich dort etwas ändert, hier bitte ebenfalls anpassen.
const SUPABASE_URL = 'https://qowrnfdjwikkjlpluali.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvd3JuZmRqd2lra2pscGx1YWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzNzcsImV4cCI6MjA5MTM5MTM3N30.kjp9fxAupQlPBum1TknMk1oJhrQUY1DT0jEjMYJtqEM';

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/#jobs', priority: '0.9', changefreq: 'hourly' },
  { path: '/#employer-landing', priority: '0.8', changefreq: 'weekly' },
  { path: '/#register', priority: '0.7', changefreq: 'monthly' },
  { path: '/#login', priority: '0.5', changefreq: 'monthly' },
  { path: '/#impressum', priority: '0.2', changefreq: 'yearly' },
  { path: '/#datenschutz', priority: '0.2', changefreq: 'yearly' },
  { path: '/#agb', priority: '0.2', changefreq: 'yearly' }
];

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchActiveJobs() {
  // Jobs per Supabase REST abrufen. Anon-Key + RLS erlaubt nur
  // Leseoperationen auf aktive Jobs, daher sicher zu exponieren.
  const url = `${SUPABASE_URL}/rest/v1/jobs?select=id,updated_at,created_at,active&active=eq.true&order=created_at.desc&limit=5000`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    console.warn('[sitemap] Supabase fetch failed', res.status, await res.text());
    return [];
  }
  return await res.json();
}

export async function onRequest(context) {
  const origin = new URL(context.request.url).origin;

  let jobs = [];
  try {
    jobs = await fetchActiveJobs();
  } catch (e) {
    console.error('[sitemap] jobs fetch error', e);
  }

  const urls = [];

  // Statische Routen
  for (const r of STATIC_ROUTES) {
    urls.push(
      `  <url>\n` +
      `    <loc>${xmlEscape(origin + r.path)}</loc>\n` +
      `    <changefreq>${r.changefreq}</changefreq>\n` +
      `    <priority>${r.priority}</priority>\n` +
      `  </url>`
    );
  }

  // Job-Detailseiten (SPA-Hash-Route #job-<id>)
  for (const j of jobs) {
    const lastmod = (j.updated_at || j.created_at || new Date().toISOString()).slice(0, 10);
    urls.push(
      `  <url>\n` +
      `    <loc>${xmlEscape(origin + '/#job-' + j.id)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>weekly</changefreq>\n` +
      `    <priority>0.8</priority>\n` +
      `  </url>`
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.join('\n') + `\n` +
    `</urlset>\n`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // 1 Stunde Cache — reduziert Supabase-Last, bleibt aber frisch genug
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}
