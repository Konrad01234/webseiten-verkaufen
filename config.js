// =====================================================================
// WorkPilot — Supabase Configuration
// ---------------------------------------------------------------------
// The anon key is meant to be public; row-level security policies in
// supabase-schema.sql enforce who can read/write what. NEVER paste your
// `service_role` key here — that one bypasses RLS.
// =====================================================================
window.SUPABASE_CONFIG = {
  url:     'https://qowrnfdjwikkjlpluali.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvd3JuZmRqd2lra2pscGx1YWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzNzcsImV4cCI6MjA5MTM5MTM3N30.kjp9fxAupQlPBum1TknMk1oJhrQUY1DT0jEjMYJtqEM'
};

// Optional hCaptcha Site-Key. Wenn leer, wird kein Captcha angezeigt
// und Registrierung läuft normal. Sobald du in Supabase Bot Protection
// aktivierst, trag hier deinen Site-Key ein:
//   1. https://hcaptcha.com → Site-Key holen
//   2. Supabase Dashboard → Authentication → Bot Protection → hCaptcha
//      → Site Key + Secret Key eintragen → Save
//   3. Hier den Site-Key eintragen
window.HCAPTCHA_SITE_KEY = '0e0c0f20-4954-49c4-82cc-3f922daed460';

// Optional Storage-Bucket für Bilder. Wenn leer, werden Bilder weiter
// als Base64 in die DB geschrieben (funktioniert, aber bei vielen
// Bildern ineffizient). Sobald du im Supabase-Dashboard einen public
// bucket "images" anlegst, hier 'images' eintragen:
window.IMAGE_BUCKET = 'images';
