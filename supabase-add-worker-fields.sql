-- ============================================================================
-- EasyJobs — Phase 3 migration: worker fields + active job + completed jobs
-- ============================================================================
-- Führe das ONCE im Supabase SQL-Editor aus:
--   https://supabase.com/dashboard/project/qowrnfdjwikkjlpluali/sql
-- Idempotent: sicher mehrfach ausführbar.
-- ============================================================================

-- 1) Worker-Profildaten, die bisher nur in localStorage lagen
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills       TEXT[]   DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weekly_hours INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS refs         JSONB    DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about        TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_file_name TEXT;

-- 2) Aktueller Job + abgeschlossene Jobs (für "Aktiver Job"-System)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_job     JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_jobs JSONB DEFAULT '[]'::jsonb;

-- 3) Ein paar weitere Profile-Flags die im Code genutzt werden
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo           TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS images         TEXT[] DEFAULT '{}';

-- ============================================================================
-- Fertig. Die Anwendung kann diese Felder jetzt über DB.updateProfile
-- schreiben und über DB.getProfile lesen.
-- ============================================================================
