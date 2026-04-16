-- ============================================================================
-- WorkPilot — Security Hardening v2
-- ============================================================================
-- Einmal im Supabase SQL Editor ausfuehren:
--   Dashboard → SQL Editor → New query → paste → Run
-- Idempotent: mehrfach ausfuehrbar.
--
-- Behebt Luecken aus dem Security-Audit:
--   1. Email-Spoofing → Admin-Eskalation: Nicht-Admin konnte profiles.email
--      auf eine Admin-Adresse setzen und damit Admin-Rechte erlangen.
--   2. Storage-Path-Hijacking: Jeder Auth-User konnte in fremde
--      {user-id}/-Ordner hochladen → Quota-Abuse + Pfad-Squatting.
--   3. Worker konnte eigene applications.status auf 'accepted' setzen
--      (oder 'invited'/'rejected').
--   4. UPDATE-Policies ohne WITH CHECK: Besitzer konnte Zeile an fremden
--      User "verschenken" (employer_id / worker_id / id umbiegen).
--   5. Reviews ohne Duplicate-Schutz + ohne Self-Review-Block.
--   6. applications_count race (read-modify-write) → ersetzt durch
--      atomare RPC.
-- ============================================================================


-- ---------------------------------------------------------------------
-- 1) profiles: E-Mail als privilegierte Spalte zusaetzlich schuetzen
-- ---------------------------------------------------------------------
-- Der bisherige guard_profile_privileged_cols-Trigger aus
-- supabase-security-hardening.sql schuetzt nur `approved` und `role`.
-- Die E-Mail haengt daran aber noch wichtigere Privilegien: der Admin-
-- Check in profiles_admin_update_approval + support_update_admin +
-- dem Frontend basiert auf profiles.email. Ohne Guard konnte ein
-- regulaerer User:
--   DB.updateProfile(myId, { email: 'kwg.range@web.de' })
-- aufrufen und sofort Admin werden (bis Supabase-Auth email-confirm
-- verlangt — was im aktuellen Setup nicht hart erzwungen ist).

CREATE OR REPLACE FUNCTION public.guard_profile_privileged_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_email text;
  is_admin boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT email INTO caller_email
    FROM public.profiles
   WHERE id = auth.uid();

  is_admin := caller_email IN ('kwg.range@web.de', 'jojo102009@icloud.com');

  IF is_admin THEN
    RETURN NEW;
  END IF;

  -- Nicht-Admin: privilegierte Spalten aus OLD zurueckschreiben.
  IF NEW.approved IS DISTINCT FROM OLD.approved THEN
    NEW.approved := OLD.approved;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;
  -- NEU: E-Mail ist ebenfalls privilegiert, weil der Admin-Check daran
  -- haengt. Aenderungen bleiben clientseitig im Form sichtbar, werden
  -- aber beim Save auf den alten Wert zurueckgesetzt.
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    NEW.email := OLD.email;
  END IF;
  -- NEU: id + role aendern via UPDATE ist nicht vorgesehen (role wurde
  -- bereits oben gecovert; id ist PK, aber wir sind defensiv).
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    NEW.id := OLD.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger neu verknuepfen (idempotent).
DROP TRIGGER IF EXISTS profiles_guard_privileged_cols ON public.profiles;
CREATE TRIGGER profiles_guard_privileged_cols
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_privileged_cols();


-- ---------------------------------------------------------------------
-- 2) Storage: uploads nur in den eigenen {user-id}/-Ordner
-- ---------------------------------------------------------------------
-- Vorher: INSERT-Policy pruefte nur bucket_id='images'. Angreifer
-- konnte `victim_uid/avatar.jpg` hochladen und damit den Pfad besetzen.
-- db.js baut den Pfad standardmaessig als `${uid}/${timestamp}-name`,
-- der erste Ordnerteil ist also immer die User-UUID.

DROP POLICY IF EXISTS "images_insert_authenticated" ON storage.objects;
CREATE POLICY "images_insert_authenticated"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- UPDATE/DELETE auf eigene Files — zusaetzlich zum owner-Check den
-- Path-Check mitziehen (owner-Check kann durch CreatePolicies-Tricks
-- umgangen werden, wenn Admin via Service-Role ein File anlegt).
DROP POLICY IF EXISTS "images_update_owner" ON storage.objects;
CREATE POLICY "images_update_owner"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "images_delete_owner" ON storage.objects;
CREATE POLICY "images_delete_owner"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );


-- ---------------------------------------------------------------------
-- 3) applications: Worker darf status nur auf 'withdrawn' setzen
-- ---------------------------------------------------------------------
-- Vorher: apps_update_worker liess Worker beliebige UPDATEs auf eigene
-- Zeilen zu, also auch status='accepted'. Folge: Worker konnte sich
-- selbst einstellen — umgeht Max-3-Bewerbungen-Check, getActiveJob-
-- Logik und laesst den Employer denken er habe zugesagt.

-- WITH CHECK ergaenzen (war vorher nur USING) damit nach dem Update
-- auch noch derselbe Worker Eigentuemer ist.
DROP POLICY IF EXISTS "apps_update_worker" ON public.applications;
CREATE POLICY "apps_update_worker" ON public.applications
  FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "apps_update_employer" ON public.applications;
CREATE POLICY "apps_update_employer" ON public.applications
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
  );

-- Trigger der Status-Transitions erzwingt:
--   Worker darf status NUR auf 'withdrawn' setzen.
--   Niemand darf job_id, worker_id im laufenden Row aendern.
CREATE OR REPLACE FUNCTION public.guard_application_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service-Role / Migrations → durchlassen.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Identifier-Spalten NIE aendern lassen (weder Worker noch Employer).
  IF NEW.job_id IS DISTINCT FROM OLD.job_id THEN
    NEW.job_id := OLD.job_id;
  END IF;
  IF NEW.worker_id IS DISTINCT FROM OLD.worker_id THEN
    NEW.worker_id := OLD.worker_id;
  END IF;

  -- Wenn der Caller der Worker ist: status nur auf 'withdrawn' erlaubt.
  IF auth.uid() = NEW.worker_id
     AND NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('withdrawn') THEN
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS applications_guard_update ON public.applications;
CREATE TRIGGER applications_guard_update
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_application_update();


-- ---------------------------------------------------------------------
-- 4) WITH CHECK auf jobs/chats UPDATE + Ownership-Spalten schuetzen
-- ---------------------------------------------------------------------
-- Vorher hatten jobs_update_employer + chats_update_member nur USING.
-- Employer konnte damit sein eigenes Job-Row UPDATEn und dabei die
-- employer_id auf eine fremde UUID setzen → Job landet beim Opfer.

DROP POLICY IF EXISTS "jobs_update_employer" ON public.jobs;
CREATE POLICY "jobs_update_employer" ON public.jobs
  FOR UPDATE
  USING (auth.uid() = employer_id)
  WITH CHECK (auth.uid() = employer_id);

DROP POLICY IF EXISTS "chats_update_member" ON public.chats;
CREATE POLICY "chats_update_member" ON public.chats
  FOR UPDATE
  USING (auth.uid() = worker_id OR auth.uid() = employer_id)
  WITH CHECK (auth.uid() = worker_id OR auth.uid() = employer_id);

-- Zusaetzlich Trigger der Ownership-Spalten hart vor Umbiegung schuetzt
-- (WITH CHECK allein blockiert nur wenn das RESULT nicht mehr owned ist;
-- wenn beide alt + neu UUIDs die USING-Condition erfuellen wuerden,
-- laesst's durch).
CREATE OR REPLACE FUNCTION public.guard_job_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.employer_id IS DISTINCT FROM OLD.employer_id THEN
    NEW.employer_id := OLD.employer_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS jobs_guard_update ON public.jobs;
CREATE TRIGGER jobs_guard_update
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_job_update();

CREATE OR REPLACE FUNCTION public.guard_chat_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF NEW.worker_id   IS DISTINCT FROM OLD.worker_id   THEN NEW.worker_id   := OLD.worker_id;   END IF;
  IF NEW.employer_id IS DISTINCT FROM OLD.employer_id THEN NEW.employer_id := OLD.employer_id; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS chats_guard_update ON public.chats;
CREATE TRIGGER chats_guard_update
  BEFORE UPDATE ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_chat_update();


-- ---------------------------------------------------------------------
-- 5) reviews: Unique-Constraint + Self-Review-Block + Job-Check
-- ---------------------------------------------------------------------
-- Vorher konnte ein User denselben Arbeitgeber 100× hintereinander
-- bewerten (review-bombing), sich selbst bewerten oder ohne jeden
-- Job-Bezug einfach beliebige UUIDs als reviewed_id einsetzen.

-- A) Self-Review verhindern (harte DB-Constraint, keine Policy —
--    mehr Defense-in-Depth).
ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_no_self;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_no_self
  CHECK (reviewer_id <> reviewed_id);

-- B) Max 1 Review pro Reviewer+Reviewed+Job-Kombi. Wenn job_id null
--    ist (historisch moeglich), erlauben wir 1 Review pro Paar.
CREATE UNIQUE INDEX IF NOT EXISTS reviews_uniq_per_job
  ON public.reviews (reviewer_id, reviewed_id, COALESCE(job_id, 0));

-- C) INSERT-Policy auf tatsaechliche Job-Interaktion einschraenken:
--    Reviewer muss in der genannten Bewerbung Worker gewesen sein
--    UND der reviewed_id muss der Employer dieses Jobs sein.
--    Wenn job_id null ist, koennen wir nicht validieren → blockieren.
DROP POLICY IF EXISTS "reviews_insert_reviewer" ON public.reviews;
CREATE POLICY "reviews_insert_reviewer" ON public.reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND job_id IS NOT NULL
    AND EXISTS (
      SELECT 1
        FROM public.applications a
        JOIN public.jobs j ON j.id = a.job_id
       WHERE a.job_id = reviews.job_id
         AND a.worker_id = reviewer_id
         AND j.employer_id = reviewed_id
         AND a.status IN ('accepted','withdrawn')
    )
  );


-- ---------------------------------------------------------------------
-- 6) Atomic increment fuer Job-Metriken
-- ---------------------------------------------------------------------
-- Vorher: db.js read-modify-write in incrementJobMetric. Zwei parallele
-- Bewerbungen auf denselben Job haben beide applications_count=N
-- gelesen und N+1 geschrieben → eine Zaehlung verloren.

CREATE OR REPLACE FUNCTION public.job_increment_metric(job_id_in BIGINT, field_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF field_name = 'views' THEN
    UPDATE public.jobs SET views = views + 1 WHERE id = job_id_in;
  ELSIF field_name = 'clicks' THEN
    UPDATE public.jobs SET clicks = clicks + 1 WHERE id = job_id_in;
  ELSIF field_name = 'saves' THEN
    UPDATE public.jobs SET saves = saves + 1 WHERE id = job_id_in;
  ELSIF field_name = 'applications_count' THEN
    UPDATE public.jobs SET applications_count = applications_count + 1 WHERE id = job_id_in;
  ELSE
    RAISE EXCEPTION 'job_increment_metric: unknown field_name %', field_name;
  END IF;
END;
$$;

-- RPC aufrufbar fuer authenticated + anon (Views zaehlen auch
-- anonyme Besucher — kein Security-Risiko, Zaehler ist public).
GRANT EXECUTE ON FUNCTION public.job_increment_metric(BIGINT, TEXT) TO anon, authenticated;


-- ============================================================================
-- Fertig. Sanity-Check nach dem Run:
--   1. Non-Admin UPDATE mit { email: 'kwg.range@web.de' } → email bleibt alt.
--   2. UPLOAD to 'victim_uid/test.jpg' als anderer User → permission denied.
--   3. Worker UPDATE { status: 'accepted' } → bleibt 'pending'.
--   4. Employer UPDATE jobs SET employer_id=OTHER_UUID → bleibt auf sich.
--   5. Zweite Review desselben Workers zu gleichem Job → 23505 duplicate key.
--   6. Self-review (reviewer=reviewed) → 23514 check violation.
--   7. sb.rpc('job_increment_metric', { job_id_in: 1, field_name: 'views' })
--      → inkrementiert atomar.
-- ============================================================================
