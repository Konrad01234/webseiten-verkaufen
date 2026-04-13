-- ============================================================================
-- EasyJobs — Cron-Job: Abgelaufene Stellenanzeigen deaktivieren
-- ============================================================================
-- Voraussetzung: pg_cron Extension muss aktiv sein (Supabase Dashboard →
--   Database → Extensions → pg_cron aktivieren).
--
-- Im SQL Editor ausführen. Idempotent — wenn der Job schon existiert
-- wird er nur überschrieben.
-- ============================================================================

-- pg_cron Extension aktivieren (nötig für SELECT cron.schedule)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Alten Job entfernen falls vorhanden
SELECT cron.unschedule('deactivate-expired-jobs')
 WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'deactivate-expired-jobs');

-- Täglich um 3 Uhr nachts läuft: alle Jobs deren Ablaufdatum in der
-- Vergangenheit liegt, werden auf active=false gesetzt. Damit
-- verschwinden sie aus der "Jobs finden"-Liste (listJobs filtert
-- auf .eq('active', true)).
SELECT cron.schedule(
  'deactivate-expired-jobs',
  '0 3 * * *',
  $$
    UPDATE public.jobs
       SET active = false
     WHERE active = true
       AND created_at < now() - interval '90 days';
  $$
);

-- Kontrolle welche Jobs laufen:
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- ============================================================================
-- Hinweis: Der alte Wizard-Step 4 erlaubte Laufzeiten von 30/60/90
-- Tagen. Mit diesem Cron verschwinden Jobs standardmäßig nach 90
-- Tagen. Anpassen falls du andere Grenzen willst.
-- ============================================================================
