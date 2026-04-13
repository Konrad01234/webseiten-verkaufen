-- ============================================================================
-- EasyJobs — Storage Bucket "images" + RLS-Policies
-- ============================================================================
-- Voraussetzung: Bucket muss VORHER manuell im Dashboard angelegt werden
--   (Storage → New bucket → Name: "images" → Public: ON)
-- Dann dieses SQL ausführen, das die Schreib-Policies setzt.
-- Idempotent.
-- ============================================================================

-- Authenticated users dürfen in den images-Bucket hochladen
DROP POLICY IF EXISTS "images_insert_authenticated" ON storage.objects;
CREATE POLICY "images_insert_authenticated"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Authenticated users dürfen ihre eigenen Files updaten
DROP POLICY IF EXISTS "images_update_owner" ON storage.objects;
CREATE POLICY "images_update_owner"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid());

-- Authenticated users dürfen ihre eigenen Files löschen
DROP POLICY IF EXISTS "images_delete_owner" ON storage.objects;
CREATE POLICY "images_delete_owner"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'images' AND owner = auth.uid());

-- Public read (kann auch bei "Public bucket" über das UI eingestellt werden)
DROP POLICY IF EXISTS "images_select_public" ON storage.objects;
CREATE POLICY "images_select_public"
  ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'images');

-- ============================================================================
-- Fertig. Im Frontend window.IMAGE_BUCKET = 'images' setzen (config.js),
-- dann landen Bilder im Storage statt als Base64 in der DB.
-- ============================================================================
