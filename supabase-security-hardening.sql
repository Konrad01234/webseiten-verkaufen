-- ============================================================================
-- EasyJobs — Security hardening
-- ============================================================================
-- Run this ONCE in your Supabase SQL editor:
--   https://supabase.com/dashboard/project/qowrnfdjwikkjlpluali  →  SQL Editor
--   → New query → paste → Run
--
-- Idempotent: safe to run more than once.
--
-- What this fixes:
--   1. Non-admins can no longer modify their own `approved` flag.
--      Previously a blocked employer could call
--      DB.updateProfile({approved: true}) and instantly unblock
--      themselves — the profiles_update_self policy had no
--      column-level restriction.
--   2. Non-admins can no longer change their own `role`. A worker
--      could silently become an employer (or vice versa) before.
--   3. Admins get an UPDATE policy on support_tickets so tickets
--      can actually be resolved / replied to from the admin panel.
--
-- What this is careful NOT to break:
--   The app's current intent (commit 672830e) is "everyone is approved
--   by default, admin can BLOCK an employer". That flow used to happen
--   client-side in db.js signUp(), which upserted the new profile with
--   approved=true. Once the block-trigger below is installed, that
--   client upsert would be reverted (because the signing-up user is
--   not in the admin list), leaving new employers stuck at approved=false.
--
--   Fix: we move the auto-approval into the database itself, so it
--   happens in the same transaction as the INSERT (before the
--   block-trigger can fire, and regardless of what the client sends).
-- ============================================================================

-- ---------------------------------------------------------------------
-- 0) Strengthen the existing auto-approve trigger so it also fires
--    on INSERT for employers. This replaces the worker-only function
--    from supabase-add-approval.sql with one that approves every
--    new profile row unconditionally, which is the current intent.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_approve_workers()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- On INSERT we always approve. The admin may flip the flag to false
  -- later to block the account; the block-trigger below enforces that
  -- only admins can do that.
  IF TG_OP = 'INSERT' THEN
    NEW.approved := true;
  -- On UPDATE OF role → worker we keep the historical behaviour of
  -- force-approving. This path is rare but keeps parity with the
  -- original trigger.
  ELSIF TG_OP = 'UPDATE' AND NEW.role = 'worker' AND NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;

-- Re-install the trigger so it fires on both INSERT and UPDATE OF role.
-- (The DROP from supabase-add-approval.sql already drops the old trigger
-- name, so this CREATE replaces it cleanly.)
DROP TRIGGER IF EXISTS profiles_auto_approve_workers ON public.profiles;
CREATE TRIGGER profiles_auto_approve_workers
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_workers();

-- ---------------------------------------------------------------------
-- 1+2) BEFORE UPDATE trigger that forbids non-admins from changing
--      privileged columns. We can't express "UPDATE is OK except for
--      these columns" in a USING/WITH CHECK expression alone without
--      enumerating every allowed column, which would break every time
--      someone adds a new field. A trigger is the most forward-compatible
--      way to lock down these specific columns.
-- ---------------------------------------------------------------------
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
  -- auth.uid() returns NULL for service-role calls (server-side backend,
  -- migrations). Those are always trusted, so let them through.
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admin check — mirrors ADMIN_EMAILS in the frontend and the
  -- profiles_admin_update_approval policy in supabase-add-approval.sql.
  SELECT email INTO caller_email
    FROM public.profiles
   WHERE id = auth.uid();

  is_admin := caller_email IN ('kwg.range@web.de', 'jojo102009@icloud.com');

  IF is_admin THEN
    RETURN NEW;
  END IF;

  -- Non-admin: silently revert any attempted change to privileged
  -- columns. We revert (rather than RAISE EXCEPTION) so the rest of the
  -- UPDATE still commits — the user's other profile edits (name,
  -- phone, skills, etc.) should go through even if their JS tried to
  -- tack a cheeky `approved: true` onto the same patch.
  IF NEW.approved IS DISTINCT FROM OLD.approved THEN
    NEW.approved := OLD.approved;
  END IF;
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    NEW.role := OLD.role;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_privileged_cols ON public.profiles;
CREATE TRIGGER profiles_guard_privileged_cols
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_profile_privileged_cols();

-- ---------------------------------------------------------------------
-- 3) Admins need to update support_tickets (status, admin_reply).
--    Without this the admin panel can read tickets but not resolve
--    them — every update silently fails at the RLS layer.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "support_update_admin" ON public.support_tickets;
CREATE POLICY "support_update_admin"
  ON public.support_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.email IN ('kwg.range@web.de', 'jojo102009@icloud.com')
    )
  );

-- ============================================================================
-- Sanity after running this:
--   - New sign-up (worker or employer) → profile row is approved=true
--     because of the auto-approve INSERT trigger.
--   - DB.updateProfile({approved: true/false}) from a non-admin is a
--     silent no-op on the approved column (other fields still save).
--   - DB.updateProfile({role: 'employer'}) from a non-admin worker
--     silently stays a worker.
--   - adminToggleApproval() still works because admins bypass the
--     guard trigger.
--   - Admins can UPDATE support_tickets to set status / admin_reply.
-- ============================================================================
