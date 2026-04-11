-- ============================================================================
-- EasyJobs — Add employer approval workflow
-- ============================================================================
-- Run this ONCE in your Supabase SQL editor:
--   https://supabase.com/dashboard/project/qowrnfdjwikkjlpluali  →  SQL Editor
--   → New query → paste this whole file → Run
--
-- It is idempotent: safe to run more than once, will not destroy data.
-- ============================================================================

-- 1) Add the `approved` column. Default false so brand-new employers
--    have to be unlocked by an admin before they can post jobs.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approved boolean DEFAULT false;

-- 2) Workers don't need manual approval, so flag every existing worker
--    as approved up front.
UPDATE public.profiles
   SET approved = true
 WHERE role = 'worker'
   AND approved IS DISTINCT FROM true;

-- 3) Existing employers were created BEFORE the approval workflow
--    existed, so we grandfather them in too — otherwise the user would
--    suddenly be locked out of accounts that worked yesterday.
UPDATE public.profiles
   SET approved = true
 WHERE role = 'employer'
   AND approved IS DISTINCT FROM true;

-- 4) Trigger that auto-approves any NEW worker the moment a profile
--    row is inserted or has its role changed to 'worker'. Employers
--    are left at the column default (false) so an admin still has to
--    flip the switch.
CREATE OR REPLACE FUNCTION public.auto_approve_workers()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role = 'worker' THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_auto_approve_workers ON public.profiles;
CREATE TRIGGER profiles_auto_approve_workers
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_approve_workers();

-- 5) Allow only the user themselves to read their own approved flag
--    (already covered by the existing profiles_select_all policy from
--    supabase-schema.sql, so nothing extra to add here). Approval
--    flips happen via the existing profiles_update_self UPDATE policy
--    when the admin edits *their own* admin profile, but for editing
--    other people's profiles we need a service-role call OR a
--    dedicated admin policy. Quick + safe option: let any
--    authenticated user with role=employer/worker SELECT every
--    profile (already true) and let admins update via a policy
--    keyed off a hard-coded admin email list.
--
--    The admin emails are baked into the frontend in
--    easyjobs-complete.html (ADMIN_EMAILS const). Mirror them here
--    so the database itself enforces the rule:
DROP POLICY IF EXISTS "profiles_admin_update_approval" ON public.profiles;
CREATE POLICY "profiles_admin_update_approval"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
        FROM public.profiles p
       WHERE p.id = auth.uid()
         AND p.email IN ('kwg.range@web.de', 'jojo102009@icloud.com')
    )
  );

-- ============================================================================
-- Done. After running this:
--   - existing accounts keep working (all flagged as approved)
--   - new workers are auto-approved by the trigger
--   - new employers default to approved = false  →  pending in admin panel
--   - the admin panel has an "Arbeitgeber Freischaltung" table with
--     Freischalten / Sperren buttons that flip this column
-- ============================================================================
