// =====================================================================
// EasyJobs — Supabase Configuration
// ---------------------------------------------------------------------
// The anon key is meant to be public; row-level security policies in
// supabase-schema.sql enforce who can read/write what. NEVER paste your
// `service_role` key here — that one bypasses RLS.
// =====================================================================
window.SUPABASE_CONFIG = {
  url:     'https://qowrnfdjwikkjlpluali.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvd3JuZmRqd2lra2pscGx1YWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTUzNzcsImV4cCI6MjA5MTM5MTM3N30.kjp9fxAupQlPBum1TknMk1oJhrQUY1DT0jEjMYJtqEM'
};
