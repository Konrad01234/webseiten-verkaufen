-- ============================================================================
-- WorkPilot — File-Upload fuer Bewerbungen (Motivationsschreiben)
-- ----------------------------------------------------------------------------
-- 1. Fuegt zwei Spalten auf `applications` hinzu: Speicher-Pfad + Original-Name
-- 2. Setzt RLS-Policies fuer einen PRIVATEN Storage-Bucket "documents".
--    Der Bucket muss VORHER im Supabase-Dashboard angelegt werden:
--        Storage -> New bucket -> Name: "documents" -> Public: OFF
-- 3. Nach dem Einspielen in config.js setzen:
--        window.DOCUMENTS_BUCKET = 'documents';
-- ----------------------------------------------------------------------------
-- Idempotent: mehrfaches Ausfuehren ist sicher.
-- ============================================================================

-- 1. Neue Spalten auf `applications`
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS motivation_file_path TEXT,
  ADD COLUMN IF NOT EXISTS motivation_file_name TEXT;

-- 2. RLS-Policies fuer den privaten "documents"-Bucket
--    Pfad-Schema: applications/<worker_uid>/<timestamp>-<filename>

-- Upload: Eingeloggte duerfen NUR in ihren eigenen Unterordner schreiben.
DROP POLICY IF EXISTS "documents_insert_own_folder" ON storage.objects;
CREATE POLICY "documents_insert_own_folder"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'applications'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Lesen: Eigentuemer (Bewerber) ODER der Arbeitgeber des zugehoerigen Jobs.
DROP POLICY IF EXISTS "documents_select_owner_or_employer" ON storage.objects;
CREATE POLICY "documents_select_owner_or_employer"
  ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      -- Eigene Datei
      (
        (storage.foldername(name))[1] = 'applications'
        AND auth.uid()::text = (storage.foldername(name))[2]
      )
      OR
      -- Arbeitgeber, dessen Job referenziert ist
      EXISTS (
        SELECT 1
        FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
        WHERE a.motivation_file_path = storage.objects.name
          AND j.employer_id = auth.uid()
      )
    )
  );

-- Loeschen: nur Eigentuemer.
DROP POLICY IF EXISTS "documents_delete_owner" ON storage.objects;
CREATE POLICY "documents_delete_owner"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'applications'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- Update: nur Eigentuemer.
DROP POLICY IF EXISTS "documents_update_owner" ON storage.objects;
CREATE POLICY "documents_update_owner"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = 'applications'
    AND auth.uid()::text = (storage.foldername(name))[2]
  );

-- ============================================================================
-- Fertig. Workflow:
--   1. Bewerber lädt PDF hoch -> landet unter applications/<uid>/<ts>-file.pdf
--   2. Frontend speichert Pfad + Name auf applications-Row
--   3. Arbeitgeber sieht "Anschreiben"-Button -> Frontend fordert Signed URL
--      (createSignedUrl) -> Supabase prüft RLS -> Employer darf lesen -> URL
--      ist 10 Minuten gueltig
-- ============================================================================
