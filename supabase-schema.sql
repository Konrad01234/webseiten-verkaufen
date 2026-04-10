-- =====================================================================
-- EasyJobs Supabase Schema
-- ---------------------------------------------------------------------
-- Run this entire file ONCE in your Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES (extends auth.users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('worker','employer')),
  name            TEXT NOT NULL,
  company         TEXT,
  industry        TEXT,
  description     TEXT,
  address         TEXT,
  city            TEXT,
  phone           TEXT,
  website         TEXT,
  founded         INT,
  employees       TEXT,
  company_logo    TEXT,
  company_images  TEXT[] DEFAULT '{}',
  cv_data         JSONB,
  cv_uploaded     BOOLEAN DEFAULT FALSE,
  docs_uploaded   BOOLEAN DEFAULT FALSE,
  approved        BOOLEAN DEFAULT TRUE,
  profile_complete INT DEFAULT 20,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 2. JOBS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.jobs (
  id                BIGSERIAL PRIMARY KEY,
  employer_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  company           TEXT NOT NULL,
  city              TEXT,
  location          TEXT,
  category          TEXT,
  type              TEXT,
  hours             TEXT,
  salary            TEXT,
  salary_num        NUMERIC,
  description       TEXT,
  tags              TEXT[] DEFAULT '{}',
  images            TEXT[] DEFAULT '{}',
  company_logo      TEXT,
  promoted          BOOLEAN DEFAULT FALSE,
  promoted_until    TIMESTAMPTZ,
  views             INT DEFAULT 0,
  clicks            INT DEFAULT 0,
  saves             INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  active            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS jobs_employer_idx ON public.jobs(employer_id);
CREATE INDEX IF NOT EXISTS jobs_active_idx   ON public.jobs(active);
CREATE INDEX IF NOT EXISTS jobs_created_idx  ON public.jobs(created_at DESC);

-- ---------------------------------------------------------------------
-- 3. APPLICATIONS (worker → job)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id          BIGSERIAL PRIMARY KEY,
  job_id      BIGINT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','invited','withdrawn')),
  message     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);
CREATE INDEX IF NOT EXISTS applications_worker_idx ON public.applications(worker_id);
CREATE INDEX IF NOT EXISTS applications_job_idx    ON public.applications(job_id);

-- ---------------------------------------------------------------------
-- 4. CHATS + MESSAGES
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chats (
  id              BIGSERIAL PRIMARY KEY,
  worker_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id          BIGINT REFERENCES public.jobs(id) ON DELETE SET NULL,
  job_title       TEXT,
  last_message    TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, employer_id, job_id)
);
CREATE INDEX IF NOT EXISTS chats_worker_idx   ON public.chats(worker_id);
CREATE INDEX IF NOT EXISTS chats_employer_idx ON public.chats(employer_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id          BIGSERIAL PRIMARY KEY,
  chat_id     BIGINT NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_chat_idx ON public.messages(chat_id, created_at);

-- ---------------------------------------------------------------------
-- 5. REVIEWS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id           BIGSERIAL PRIMARY KEY,
  reviewer_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id       BIGINT REFERENCES public.jobs(id) ON DELETE SET NULL,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reviews_reviewed_idx ON public.reviews(reviewed_id);

-- ---------------------------------------------------------------------
-- 6. SAVED JOBS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id     BIGINT NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- ---------------------------------------------------------------------
-- 7. SUPPORT TICKETS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category     TEXT,
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  status       TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  admin_reply  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
-- These rules are enforced by Postgres itself, not by the JS client.
-- A malicious user editing browser code CANNOT bypass them.
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_all"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self"  ON public.profiles;
CREATE POLICY "profiles_select_all"  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------
-- jobs (publicly readable, only owner can write)
-- ---------------------------------------------------------------------
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "jobs_select_all"        ON public.jobs;
DROP POLICY IF EXISTS "jobs_insert_employer"   ON public.jobs;
DROP POLICY IF EXISTS "jobs_update_employer"   ON public.jobs;
DROP POLICY IF EXISTS "jobs_delete_employer"   ON public.jobs;
CREATE POLICY "jobs_select_all"      ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert_employer" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id);
CREATE POLICY "jobs_update_employer" ON public.jobs FOR UPDATE USING (auth.uid() = employer_id);
CREATE POLICY "jobs_delete_employer" ON public.jobs FOR DELETE USING (auth.uid() = employer_id);

-- ---------------------------------------------------------------------
-- applications (worker sees own, employer sees own job applications)
-- ---------------------------------------------------------------------
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "apps_select_worker"   ON public.applications;
DROP POLICY IF EXISTS "apps_select_employer" ON public.applications;
DROP POLICY IF EXISTS "apps_insert_worker"   ON public.applications;
DROP POLICY IF EXISTS "apps_update_worker"   ON public.applications;
DROP POLICY IF EXISTS "apps_update_employer" ON public.applications;
CREATE POLICY "apps_select_worker"   ON public.applications FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "apps_select_employer" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
);
CREATE POLICY "apps_insert_worker"   ON public.applications FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "apps_update_worker"   ON public.applications FOR UPDATE USING (auth.uid() = worker_id);
CREATE POLICY "apps_update_employer" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.employer_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- chats + messages (only participants)
-- ---------------------------------------------------------------------
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chats_select_member" ON public.chats;
DROP POLICY IF EXISTS "chats_insert_member" ON public.chats;
DROP POLICY IF EXISTS "chats_update_member" ON public.chats;
CREATE POLICY "chats_select_member" ON public.chats FOR SELECT USING (auth.uid() = worker_id OR auth.uid() = employer_id);
CREATE POLICY "chats_insert_member" ON public.chats FOR INSERT WITH CHECK (auth.uid() = worker_id OR auth.uid() = employer_id);
CREATE POLICY "chats_update_member" ON public.chats FOR UPDATE USING (auth.uid() = worker_id OR auth.uid() = employer_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "msgs_select_member" ON public.messages;
DROP POLICY IF EXISTS "msgs_insert_member" ON public.messages;
CREATE POLICY "msgs_select_member" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND (c.worker_id = auth.uid() OR c.employer_id = auth.uid()))
);
CREATE POLICY "msgs_insert_member" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.chats c WHERE c.id = chat_id AND (c.worker_id = auth.uid() OR c.employer_id = auth.uid()))
);

-- ---------------------------------------------------------------------
-- reviews (publicly readable, only authenticated users can write)
-- ---------------------------------------------------------------------
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_select_all"       ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_reviewer"  ON public.reviews;
CREATE POLICY "reviews_select_all"      ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_reviewer" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ---------------------------------------------------------------------
-- saved_jobs (only own)
-- ---------------------------------------------------------------------
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "saved_select_self" ON public.saved_jobs;
DROP POLICY IF EXISTS "saved_insert_self" ON public.saved_jobs;
DROP POLICY IF EXISTS "saved_delete_self" ON public.saved_jobs;
CREATE POLICY "saved_select_self" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saved_insert_self" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_self" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- support_tickets (only own)
-- ---------------------------------------------------------------------
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_select_self" ON public.support_tickets;
DROP POLICY IF EXISTS "support_insert_self" ON public.support_tickets;
CREATE POLICY "support_select_self" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "support_insert_self" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- TRIGGERS — auto-create profile when a user signs up
-- =====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, name, company)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker'),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'company'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- REALTIME — enable for messages so chat updates instantly
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
