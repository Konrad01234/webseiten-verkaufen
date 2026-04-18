-- ============================================================================
-- WorkPilot — Invitation-Flow: Arbeitnehmer nimmt die Einladung selbst an
-- ----------------------------------------------------------------------------
-- Voraussetzung: supabase-schema.sql + supabase-hardening-v2.sql sind
-- VORHER bereits eingespielt. Diese Migration setzt auf dem Guard-Trigger
-- aus v2 auf und erweitert ihn um die 'invited' -> 'accepted'-Transition
-- fuer den Bewerber.
--
-- Idempotent: mehrfaches Ausfuehren ist sicher.
-- ============================================================================

-- ---------------------------------------------------------------------
-- 1) Guard-Trigger erweitern: Worker darf jetzt AUCH 'accepted' setzen,
--    aber nur wenn die Bewerbung vorher auf 'invited' stand.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_application_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service-Role / Migrations -> durchlassen.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Identifier-Spalten NIE aendern lassen.
  IF NEW.job_id IS DISTINCT FROM OLD.job_id THEN
    NEW.job_id := OLD.job_id;
  END IF;
  IF NEW.worker_id IS DISTINCT FROM OLD.worker_id THEN
    NEW.worker_id := OLD.worker_id;
  END IF;

  -- Wenn der Caller der Worker ist: status nur auf 'withdrawn' setzen,
  -- oder auf 'accepted' wenn vorher 'invited' war (Einladung annehmen).
  IF auth.uid() = NEW.worker_id AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'withdrawn' THEN
      -- ok, Worker zieht zurueck / lehnt ab
      NULL;
    ELSIF NEW.status = 'accepted' AND OLD.status = 'invited' THEN
      -- ok, Worker nimmt die Einladung an
      NULL;
    ELSE
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger neu binden (idempotent)
DROP TRIGGER IF EXISTS applications_guard_update ON public.applications;
CREATE TRIGGER applications_guard_update
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_application_update();


-- ---------------------------------------------------------------------
-- 2) RPC accept_invitation(app_id): nimmt die Einladung atomar an und
--    fuehrt die Folge-Effekte aus:
--      - eigene Bewerbung -> 'accepted'
--      - andere eigene offene Bewerbungen -> 'withdrawn'
--      - andere offene Bewerbungen auf demselben Job -> 'rejected'
--      - Job auf inaktiv setzen (aus der Suche entfernen)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.accept_invitation(app_id_in BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_worker_id UUID;
  v_job_id    BIGINT;
  v_status    TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht eingeloggt';
  END IF;

  SELECT worker_id, job_id, status
    INTO v_worker_id, v_job_id, v_status
    FROM public.applications
   WHERE id = app_id_in;

  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Bewerbung nicht gefunden';
  END IF;
  IF v_worker_id <> auth.uid() THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;
  IF v_status <> 'invited' THEN
    RAISE EXCEPTION 'Es liegt keine offene Einladung vor (Status: %)', v_status;
  END IF;

  -- Eigene Bewerbung akzeptieren (Trigger erlaubt invited -> accepted).
  UPDATE public.applications
     SET status = 'accepted'
   WHERE id = app_id_in;

  -- Alle eigenen anderen offenen Bewerbungen zurueckziehen.
  UPDATE public.applications
     SET status = 'withdrawn'
   WHERE worker_id = v_worker_id
     AND id <> app_id_in
     AND status IN ('pending','reviewing','invited');

  -- Alle anderen offenen Bewerbungen auf diesem Job ablehnen.
  UPDATE public.applications
     SET status = 'rejected'
   WHERE job_id = v_job_id
     AND id <> app_id_in
     AND status IN ('pending','reviewing','invited');

  -- Job aus der Suche nehmen.
  UPDATE public.jobs
     SET active = false
   WHERE id = v_job_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_invitation(BIGINT) TO authenticated;


-- ---------------------------------------------------------------------
-- 3) RPC decline_invitation(app_id): Worker lehnt Einladung ab.
--    Einfache Variante: status = 'withdrawn' auf seiner eigenen Row.
--    Als RPC verpackt, damit der Client nicht selbst pruefen muss.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decline_invitation(app_id_in BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_worker_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Nicht eingeloggt';
  END IF;

  SELECT worker_id INTO v_worker_id
    FROM public.applications
   WHERE id = app_id_in;

  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Bewerbung nicht gefunden';
  END IF;
  IF v_worker_id <> auth.uid() THEN
    RAISE EXCEPTION 'Nicht berechtigt';
  END IF;

  UPDATE public.applications
     SET status = 'withdrawn'
   WHERE id = app_id_in;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decline_invitation(BIGINT) TO authenticated;

-- ============================================================================
-- Fertig. Frontend-Nutzung:
--   await DB.sb.rpc('accept_invitation',  { app_id_in: 42 });
--   await DB.sb.rpc('decline_invitation', { app_id_in: 42 });
-- ============================================================================
