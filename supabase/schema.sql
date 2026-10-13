-- ==============================================================================
-- CAMPUSBUZZ — MASTER PRODUCTION DATABASE DEFINITION (SCHEMA + HARDENED RLS + SEED DATA)
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. APPLICATION TABLES
-- ------------------------------------------------------------------------------

-- User Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'organizer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Clubs & Societies
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  domain TEXT NOT NULL,
  statement TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  instagram_url TEXT,
  github_url TEXT,
  contact_email TEXT,
  lead_name TEXT,
  established TEXT DEFAULT '2020',
  member_count INTEGER DEFAULT 0,
  what_we_do TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club Membership & Organizer Roles (Normalizes organizer assignments)
CREATE TABLE IF NOT EXISTS public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'organizer' CHECK (role IN ('organizer', 'lead')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Campus Events (Includes 'past' status for completed archives)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  category TEXT NOT NULL,
  event_date DATE NOT NULL,
  day_of_week TEXT,
  start_time TIME NOT NULL,
  end_time TIME,
  venue TEXT NOT NULL,
  eligibility TEXT DEFAULT 'Open to all MSU Baroda engineering students',
  registration_deadline TIMESTAMPTZ,
  registration_url TEXT NOT NULL,
  contact_email TEXT,
  official_url TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'cancelled', 'archived', 'past')),
  views INTEGER NOT NULL DEFAULT 0,
  registration_clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student Bookmarks / Saved Events
CREATE TABLE IF NOT EXISTS public.saved_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Recommendation Quiz Questions
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  category TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quiz Options with Weighted Club Scores
CREATE TABLE IF NOT EXISTS public.quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  club_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Persisted Quiz Recommendation Results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  top_club_id UUID REFERENCES public.clubs(id) ON DELETE SET NULL,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campus Lounge Photo Gallery
CREATE TABLE IF NOT EXISTS public.lounge_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  caption TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  location TEXT,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event Analytics & Interactions
CREATE TABLE IF NOT EXISTS public.event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  views INTEGER NOT NULL DEFAULT 0,
  registration_clicks INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. SECURITY DEFINER HELPER FUNCTIONS (NON-RECURSIVE)
-- ------------------------------------------------------------------------------

-- Retrieve role of the currently authenticated user
-- Bypasses RLS because it runs as postgres (SECURITY DEFINER), preventing policy recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  current_role TEXT;
BEGIN
  SELECT role INTO current_role
  FROM public.profiles
  WHERE id = auth.uid();
  RETURN current_role;
END;
$$;

-- Check if current user is an active Administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (public.get_my_role() = 'admin');
$$;

-- Check if current user is an assigned Organizer for a specific club
-- Verifies BOTH the club_members relationship AND the profile role
CREATE OR REPLACE FUNCTION public.is_club_organizer(target_club_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.club_members cm
    JOIN public.profiles p ON p.id = cm.user_id
    WHERE cm.user_id = auth.uid()
      AND cm.club_id = target_club_id
      AND p.role IN ('organizer', 'admin')
      AND cm.role IN ('organizer', 'lead')
  );
END;
$$;

-- Atomic RPC functions for analytics counter increments
-- Scoped strictly to valid published or past events to prevent arbitrary abuse
CREATE OR REPLACE FUNCTION public.increment_event_views(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status IN ('published', 'past')) THEN
    UPDATE public.events
    SET views = views + 1
    WHERE id = event_id;

    INSERT INTO public.event_analytics (event_id, views, registration_clicks)
    VALUES (event_id, 1, 0)
    ON CONFLICT (event_id) DO UPDATE
    SET views = public.event_analytics.views + 1,
        updated_at = now();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_registration_click(event_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.events WHERE id = event_id AND status IN ('published', 'past')) THEN
    UPDATE public.events
    SET registration_clicks = registration_clicks + 1
    WHERE id = event_id;

    INSERT INTO public.event_analytics (event_id, views, registration_clicks)
    VALUES (event_id, 0, 1)
    ON CONFLICT (event_id) DO UPDATE
    SET registration_clicks = public.event_analytics.registration_clicks + 1,
        updated_at = now();
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_event_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_registration_click(UUID) TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 4. TRIGGERS (ROLE INTEGRITY & EVENT ASSIGNMENT INTEGRITY)
-- ------------------------------------------------------------------------------

-- Automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'),
    'student' -- Public signups always default to student. Never allow self-assigned organizer/admin!
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger: Prevent regular users from modifying their role in profiles
-- Uses OLD/NEW record directly without RLS policy recursion
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: only administrators can change user roles.';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- Trigger: Prevent organizers from moving events to another club
CREATE OR REPLACE FUNCTION public.protect_event_club_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.club_id IS DISTINCT FROM OLD.club_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: organizers cannot reassign an event to another club.';
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_event_club_assignment ON public.events;
CREATE TRIGGER tr_protect_event_club_assignment
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_event_club_assignment();

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lounge_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- ============================================================================
  -- PROFILES RLS (ZERO RECURSION, STRICT PRIVATE ACCESS)
  -- ============================================================================
  DROP POLICY IF EXISTS "Public profiles are readable by everyone" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view own profile or admins can view all" ON public.profiles;
  -- Non-recursive SELECT: user sees their own profile, admins see all profiles
  CREATE POLICY "Users can view own profile or admins can view all"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  -- Users update their own profile (role immutability is strictly enforced by tr_protect_profile_role)
  CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

  DROP POLICY IF EXISTS "Admins can manage any profile" ON public.profiles;
  CREATE POLICY "Admins can manage any profile"
    ON public.profiles FOR ALL
    USING (public.is_admin());

  -- ============================================================================
  -- CLUB MEMBERS RLS (RESTRICTED ACCESS)
  -- ============================================================================
  DROP POLICY IF EXISTS "Club members are viewable by everyone" ON public.club_members;
  DROP POLICY IF EXISTS "Club members viewable by assigned user, club organizers, and admins" ON public.club_members;
  CREATE POLICY "Club members viewable by assigned user, club organizers, and admins"
    ON public.club_members FOR SELECT
    USING (auth.uid() = user_id OR public.is_club_organizer(club_id) OR public.is_admin());

  DROP POLICY IF EXISTS "Admins can manage club members" ON public.club_members;
  CREATE POLICY "Admins can manage club members"
    ON public.club_members FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

  -- ============================================================================
  -- CLUBS RLS
  -- ============================================================================
  DROP POLICY IF EXISTS "Clubs are viewable by everyone" ON public.clubs;
  CREATE POLICY "Clubs are viewable by everyone"
    ON public.clubs FOR SELECT
    USING (is_active = true OR public.is_admin());

  DROP POLICY IF EXISTS "Admins can manage clubs" ON public.clubs;
  CREATE POLICY "Admins can manage clubs"
    ON public.clubs FOR ALL
    USING (public.is_admin());

  DROP POLICY IF EXISTS "Organizers can update their own club" ON public.clubs;
  CREATE POLICY "Organizers can update their own club"
    ON public.clubs FOR UPDATE
    USING (public.is_club_organizer(id));

  -- ============================================================================
  -- EVENTS RLS (CRITICAL BOUNDARY ENFORCEMENT & WITH CHECK)
  -- ============================================================================
  DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
  -- Public can view both 'published' and archived 'past' events
  CREATE POLICY "Published events are viewable by everyone"
    ON public.events FOR SELECT
    USING (status IN ('published', 'past') OR public.is_admin() OR public.is_club_organizer(club_id));

  DROP POLICY IF EXISTS "Organizers can create events for their club" ON public.events;
  CREATE POLICY "Organizers can create events for their club"
    ON public.events FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND (public.is_admin() OR public.is_club_organizer(club_id)));

  DROP POLICY IF EXISTS "Organizers can update their own club events" ON public.events;
  -- WITH CHECK guarantees organizer cannot reassign event to another club
  CREATE POLICY "Organizers can update their own club events"
    ON public.events FOR UPDATE
    USING (public.is_admin() OR public.is_club_organizer(club_id))
    WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id));

  DROP POLICY IF EXISTS "Organizers can delete their own club events" ON public.events;
  CREATE POLICY "Organizers can delete their own club events"
    ON public.events FOR DELETE
    USING (public.is_admin() OR public.is_club_organizer(club_id));

  -- ============================================================================
  -- SAVED EVENTS RLS
  -- ============================================================================
  DROP POLICY IF EXISTS "Users can view their own saved events" ON public.saved_events;
  CREATE POLICY "Users can view their own saved events"
    ON public.saved_events FOR SELECT
    USING (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can save events for themselves" ON public.saved_events;
  CREATE POLICY "Users can save events for themselves"
    ON public.saved_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  DROP POLICY IF EXISTS "Users can remove their own saved events" ON public.saved_events;
  CREATE POLICY "Users can remove their own saved events"
    ON public.saved_events FOR DELETE
    USING (auth.uid() = user_id);

  -- ============================================================================
  -- QUIZ RLS
  -- ============================================================================
  DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;
  CREATE POLICY "Quiz questions are viewable by everyone"
    ON public.quiz_questions FOR SELECT
    USING (is_active = true);

  DROP POLICY IF EXISTS "Quiz options are viewable by everyone" ON public.quiz_options;
  CREATE POLICY "Quiz options are viewable by everyone"
    ON public.quiz_options FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Admins can manage quiz content" ON public.quiz_questions;
  CREATE POLICY "Admins can manage quiz content"
    ON public.quiz_questions FOR ALL
    USING (public.is_admin());

  DROP POLICY IF EXISTS "Users can view their own quiz results" ON public.quiz_results;
  CREATE POLICY "Users can view their own quiz results"
    ON public.quiz_results FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

  DROP POLICY IF EXISTS "Users can save their quiz results" ON public.quiz_results;
  CREATE POLICY "Users can save their quiz results"
    ON public.quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  -- ============================================================================
  -- LOUNGE POSTS RLS
  -- ============================================================================
  DROP POLICY IF EXISTS "Lounge posts are viewable by everyone" ON public.lounge_posts;
  CREATE POLICY "Lounge posts are viewable by everyone"
    ON public.lounge_posts FOR SELECT
    USING (true);

  DROP POLICY IF EXISTS "Organizers and admins can manage lounge posts" ON public.lounge_posts;
  CREATE POLICY "Organizers and admins can manage lounge posts"
    ON public.lounge_posts FOR ALL
    USING (public.is_admin() OR public.is_club_organizer(club_id))
    WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id));

  -- ============================================================================
  -- EVENT ANALYTICS RLS
  -- ============================================================================
  DROP POLICY IF EXISTS "Event analytics viewable by club organizer or admin" ON public.event_analytics;
  CREATE POLICY "Event analytics viewable by club organizer or admin"
    ON public.event_analytics FOR SELECT
    USING (
      public.is_admin() OR EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_id AND public.is_club_organizer(e.club_id)
      )
    );

  DROP POLICY IF EXISTS "Admins can manage event analytics" ON public.event_analytics;
  CREATE POLICY "Admins can manage event analytics"
    ON public.event_analytics FOR ALL
    USING (public.is_admin());
END $$;

-- ------------------------------------------------------------------------------
-- 6. SEED DATA (5 CLUBS, 16 EVENTS, QUIZ & LOUNGE)
-- ------------------------------------------------------------------------------

-- 1. SEED 5 DEVELOPMENT CLUBS
INSERT INTO public.clubs (
  id, name, slug, description, category, domain, statement,
  logo_url, cover_image_url, website_url, instagram_url, github_url,
  contact_email, lead_name, established, member_count, what_we_do, is_active
) VALUES
(
  'c1111111-1111-1111-1111-111111111111',
  'VIMARSH',
  'vimarsh',
  'VIMARSH is dedicated to cultivating rigorous algorithmic problem solving, data structures mastery, and competitive programming excellence among MSU engineering students.',
  'Coding & DSA',
  'Competitive Programming / Algorithms',
  'Bridging mathematical intuition and algorithmic efficiency.',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
  'https://vimarsh-msu.github.io',
  'https://instagram.com/vimarsh_msu',
  'https://github.com/vimarsh-msu',
  'vimarsh.cse@msubaroda.ac.in',
  'Aarav Patel (Final Year CSE)',
  '2018',
  320,
  ARRAY[
    'Weekly CodeForces & LeetCode problem discussions',
    'ICPC regional preparation bootcamps',
    'Dynamic Programming and Graph Theory masterclasses',
    'Annual Inter-College Hack-the-Algorithm sprint'
  ],
  true
),
(
  'c2222222-2222-2222-2222-222222222222',
  'Dev Infinity',
  'dev-infinity',
  'Dev Infinity is the software development hub at MSU Baroda. We build real-world open-source tools, organize web development bootcamps, and run annual 36-hour hackathons.',
  'Web & Software Dev',
  'Full-Stack Web / Mobile / Cloud',
  'Shipping real products that impact our student community.',
  'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80',
  'https://devinfinity.msu.edu',
  'https://instagram.com/devinfinity_msu',
  'https://github.com/devinfinity-msu',
  'devinfinity.club@msubaroda.ac.in',
  'Diya Shah (3rd Year CSE)',
  '2019',
  450,
  ARRAY[
    'React, Next.js, and Modern TypeScript workshops',
    'Cloud architecture and microservices fundamentals',
    'Campus open-source project sprints',
    'Annual MSU HackFest hackathon'
  ],
  true
),
(
  'c3333333-3333-3333-3333-333333333333',
  'Cultural Club',
  'cultural-club',
  'The Cultural Club is the heartbeat of student expression at MSU Faculty of Tech. We organize open-mic nights, theatrical productions, music festivals, and traditional celebration galas.',
  'Arts & Culture',
  'Music / Theatre / Dance / Fine Arts',
  'Uniting code and creativity under one vibrant campus spotlight.',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
  'https://cultural-fte.org',
  'https://instagram.com/cultural_fte_msu',
  '',
  'cultural.fte@msubaroda.ac.in',
  'Rhea Joshi (4th Year CSE)',
  '2015',
  500,
  ARRAY[
    'Semester acoustic open-mic sessions in Central Lawn',
    'Annual MSU Cultural Fest gala and talent showcases',
    'Drama and street-play (Nukkad Natak) performances',
    'Fine arts and digital campus photography exhibitions'
  ],
  true
),
(
  'c4444444-4444-4444-4444-444444444444',
  'Robotics Club',
  'robotics-club',
  'MSU Robotics Club empowers students to design, solder, program, and race intelligent machines. From combat robots to autonomous drones and computer vision rovers.',
  'Hardware & Robotics',
  'Robotics / IoT / Embedded Systems / AI',
  'Where mechanical precision meets autonomous intelligence.',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
  'https://robotics-msu.org',
  'https://instagram.com/robotics_msu',
  'https://github.com/robotics-msu',
  'robotics.club@msubaroda.ac.in',
  'Kabir Mehta (3rd Year CSE)',
  '2017',
  280,
  ARRAY[
    'Arduino, ESP32, and Raspberry Pi hands-on labs',
    'RoboWars & Line Follower engineering competitions',
    'Autonomous navigation using ROS and OpenCV',
    'Drone assembly and obstacle navigation trials'
  ],
  true
),
(
  'c5555555-5555-5555-5555-555555555555',
  'Finance & Entrepreneurship Club',
  'finance-entrepreneurship',
  'The Finance & Entrepreneurship Club bridges engineering with business acumen. We explore venture capital, product-market fit, blockchain economics, and pitch decks.',
  'Business & Startups',
  'FinTech / Startups / Venture Capital',
  'Empowering engineers to build venture-backed enterprises.',
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80',
  'https://ecell-msu.org',
  'https://instagram.com/ecell_msu',
  '',
  'ecell.finance@msubaroda.ac.in',
  'Siddharth Trivedi (4th Year CSE)',
  '2020',
  310,
  ARRAY[
    'Annual Pitch to Founders Shark-Tank style competition',
    'Algorithmic trading and personal finance bootcamps',
    'Founder fireside chats with MSU Baroda alumni',
    'Case study workshops on SaaS economics and valuation'
  ],
  true
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    domain = EXCLUDED.domain,
    lead_name = EXCLUDED.lead_name,
    member_count = EXCLUDED.member_count,
    what_we_do = EXCLUDED.what_we_do;

-- 2. SEED 16 REALISTIC CAMPUS EVENTS (UPCOMING, THIS WEEK & PAST)
INSERT INTO public.events (
  id, club_id, title, slug, category, event_date, day_of_week, start_time, end_time,
  venue, registration_deadline, registration_url, poster_url, short_description, description,
  eligibility, contact_email, official_url, featured, status, views, registration_clicks, tags
) VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  'c1111111-1111-1111-1111-111111111111',
  'CodeForge 2026: The Algorithmic Sprint',
  'codeforge-2026',
  'Coding Contest',
  '2026-10-09',
  'Friday',
  '17:30:00',
  '20:30:00',
  'Computer Center Lab 2, FTE Campus',
  '2026-10-08T23:59:00+05:30',
  'https://unstop.com/o/codeforge-msu-2026',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1000&auto=format&fit=crop&q=80',
  '3 hours, 6 tough algorithmic problems. Test your mastery of dynamic programming, segment trees, and graphs.',
  'CodeForge is VIMARSH''s flagship competitive programming sprint tailored for CSE & IT students preparing for ICPC and top engineering placements.',
  'Open to all MSU Baroda engineering students (Beginner to Advanced divisions)',
  'events.vimarsh@msubaroda.ac.in',
  'https://vimarsh-msu.github.io/events/codeforge',
  true,
  'published',
  482,
  164,
  ARRAY['DSA', 'ICPC', 'C++', 'Algorithms']
),
(
  'e2222222-2222-2222-2222-222222222222',
  'c2222222-2222-2222-2222-222222222222',
  'Full-Stack React & Next.js Masterclass',
  'full-stack-react-masterclass',
  'Workshop',
  '2026-10-10',
  'Saturday',
  '10:00:00',
  '14:00:00',
  'CSE Seminar Hall, 2nd Floor',
  '2026-10-09T18:00:00+05:30',
  'https://forms.gle/msu-devinfinity-react2026',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1000&auto=format&fit=crop&q=80',
  'Build and deploy a modern full-stack web application with React 19, Server Components, and Tailwind CSS.',
  'Hands-on code-along workshop. Bring your laptops fully charged with Node.js installed. We will cover architecture paradigms and continuous deployment.',
  'Prior basic familiarity with JavaScript and HTML recommended.',
  'devinfinity.club@msubaroda.ac.in',
  'https://devinfinity.msu.edu/workshops/react',
  true,
  'published',
  620,
  215,
  ARRAY['WebDev', 'React', 'Next.js', 'Tailwind']
),
(
  'e3333333-3333-3333-3333-333333333333',
  'c4444444-4444-4444-4444-444444444444',
  'Autonomous Rovers with ESP32 & ROS',
  'autonomous-rovers-esp32-ros',
  'Workshop',
  '2026-10-12',
  'Monday',
  '14:00:00',
  '18:00:00',
  'Hardware & IoT Lab, Electrical Block',
  '2026-10-11T20:00:00+05:30',
  'https://forms.gle/robotics-esp32-msu',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1000&auto=format&fit=crop&q=80',
  'Assemble dual-motor chassis, wire motor drivers to ESP32, and write firmware for sensor-based obstacle avoidance.',
  'A comprehensive physical hardware lab. Teams of 2 will receive a hardware kit to program live.',
  'All engineering students (Limited to 25 teams)',
  'robotics.club@msubaroda.ac.in',
  'https://robotics-msu.org/workshops/esp32',
  true,
  'published',
  390,
  110,
  ARRAY['Robotics', 'IoT', 'ESP32', 'Hardware']
),
(
  'e4444444-4444-4444-4444-444444444444',
  'c3333333-3333-3333-3333-333333333333',
  'Campus Acoustic Jam & Open Mic Night',
  'campus-acoustic-jam',
  'Cultural',
  '2026-10-14',
  'Wednesday',
  '18:30:00',
  '21:30:00',
  'Central Lawns Amphitheatre, FTE',
  '2026-10-13T12:00:00+05:30',
  'https://forms.gle/cultural-openmic-fte',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
  'An evening of indie vocals, poetry, acoustic chords, and campus storytelling under the starry Baroda sky.',
  'Step away from screens and compiler errors! Bring your acoustic guitars, cajóns, original poetry, or stand-up bits.',
  'Open to all students, faculty, and alumni across MSU Baroda.',
  'cultural.fte@msubaroda.ac.in',
  'https://cultural-fte.org/openmic',
  false,
  'published',
  710,
  240,
  ARRAY['Music', 'OpenMic', 'Poetry', 'CampusLife']
),
(
  'e5555555-5555-5555-5555-555555555555',
  'c5555555-5555-5555-5555-555555555555',
  'From 0 to Term Sheet: Startup Pitch Night',
  'from-0-to-term-sheet',
  'Entrepreneurship',
  '2026-10-16',
  'Friday',
  '16:00:00',
  '19:30:00',
  'Main Auditorium, Faculty of Tech',
  '2026-10-14T23:59:00+05:30',
  'https://ecell-msu.org/pitch-2026',
  'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1000&auto=format&fit=crop&q=80',
  'Pitch your tech startup prototype to early-stage angel investors and seasoned MSU tech alumni.',
  'Selected student teams get 5 minutes to pitch followed by 3 minutes of Q&A with angel investors and founders.',
  'Student teams of 1-4 members with working prototype or validated deck.',
  'ecell.finance@msubaroda.ac.in',
  'https://ecell-msu.org',
  true,
  'published',
  520,
  138,
  ARRAY['Startups', 'Pitching', 'VentureCapital', 'FinTech']
),
(
  'e6666666-6666-6666-6666-666666666666',
  'c2222222-2222-2222-2222-222222222222',
  'HackMSU 2026: 36-Hour Hackathon',
  'hackmsu-2026',
  'Hackathon',
  '2026-10-24',
  'Saturday',
  '09:00:00',
  '21:00:00',
  'CSE & IT Department Wings',
  '2026-10-20T23:59:00+05:30',
  'https://devfolio.co/hackmsu-2026',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80',
  'MSU Baroda''s grandest annual student hackathon. Build solutions across AI, FinTech, Web3, and Smart Campus.',
  '36 hours of non-stop hacking, developer workshops, hardware lending library, and prize pool.',
  'All college students across India with valid college ID.',
  'hackathon@devinfinity.msu.edu',
  'https://hackmsu2026.devinfinity.msu.edu',
  true,
  'published',
  1250,
  520,
  ARRAY['Hackathon', 'AI', 'OpenSource', 'Web3', 'Competition']
),
(
  'e7777777-7777-7777-7777-777777777777',
  'c2222222-2222-2222-2222-222222222222',
  'Git & GitHub Collaborative Workflow Workshop',
  'git-github-workshop',
  'Workshop',
  '2026-10-26',
  'Monday',
  '16:00:00',
  '18:30:00',
  'Lab 1, Department of Computer Science',
  '2026-10-25T20:00:00+05:30',
  'https://forms.gle/msu-github-2026',
  'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1000&auto=format&fit=crop&q=80',
  'Learn Git branching, rebasing, pull request reviews, and open-source contribution workflows.',
  'Interactive hands-on session for first and second year engineering students looking to contribute to open source.',
  'Open to all 1st and 2nd year students.',
  'devinfinity.club@msubaroda.ac.in',
  'https://devinfinity.msu.edu',
  false,
  'published',
  310,
  88,
  ARRAY['Git', 'GitHub', 'OpenSource', 'VersionControl']
),
(
  'e8888888-8888-8888-8888-888888888888',
  'c1111111-1111-1111-1111-111111111111',
  'Blockchain Fundamentals & Smart Contracts',
  'blockchain-fundamentals',
  'Tech Talk',
  '2026-10-28',
  'Wednesday',
  '15:30:00',
  '17:30:00',
  'Auditorium 2, FTE Campus',
  '2026-10-27T18:00:00+05:30',
  'https://forms.gle/msu-blockchain-fundamentals',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1000&auto=format&fit=crop&q=80',
  'Demystifying EVM, distributed consensus, cryptography, and writing your first Solidity contract.',
  'An introduction into the mathematical and cryptographic underpinnings of decentralized ledger systems.',
  'All engineering students.',
  'vimarsh.cse@msubaroda.ac.in',
  'https://vimarsh-msu.github.io',
  false,
  'published',
  245,
  62,
  ARRAY['Blockchain', 'Solidity', 'Web3', 'Cryptography']
),
(
  'e9999999-9999-9999-9999-999999999999',
  'c1111111-1111-1111-1111-111111111111',
  'Competitive Programming Sprint: Trees & Graphs',
  'dsa-sprint-trees-graphs',
  'Coding Contest',
  '2026-11-01',
  'Sunday',
  '14:00:00',
  '17:00:00',
  'Online via CodeForces',
  '2026-10-31T23:59:00+05:30',
  'https://codeforces.com/group/msu-vimarsh',
  'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=1000&auto=format&fit=crop&q=80',
  'A rigorous 3-hour virtual contest zeroing in on BFS/DFS traversal, Dijkstra, and Lowest Common Ancestor (LCA).',
  'Ranked virtual contest with post-contest editorial discussions led by final year ICPC regionalists.',
  'Open to all students with Codeforces account.',
  'vimarsh.cse@msubaroda.ac.in',
  'https://vimarsh-msu.github.io',
  false,
  'published',
  420,
  145,
  ARRAY['DSA', 'Trees', 'Graphs', 'Codeforces']
),
(
  'eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'c2222222-2222-2222-2222-222222222222',
  'AI/ML Introduction: From Zero to PyTorch',
  'ai-ml-intro-pytorch',
  'Workshop',
  '2026-11-04',
  'Wednesday',
  '16:00:00',
  '19:00:00',
  'Computer Center Lab 1',
  '2026-11-03T18:00:00+05:30',
  'https://forms.gle/msu-pytorch-intro',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1000&auto=format&fit=crop&q=80',
  'Build and train neural networks using PyTorch for computer vision and classification tasks.',
  'Hands-on introductory workshop covering tensors, autograd, forward passes, and training loops.',
  'Basic Python knowledge expected.',
  'devinfinity.club@msubaroda.ac.in',
  'https://devinfinity.msu.edu',
  true,
  'published',
  580,
  190,
  ARRAY['AI', 'MachineLearning', 'PyTorch', 'Python']
),
(
  'ebbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'c2222222-2222-2222-2222-222222222222',
  'Tech Talk: The Future of Software Architecture',
  'future-of-software-architecture',
  'Tech Talk',
  '2026-11-07',
  'Saturday',
  '11:00:00',
  '13:00:00',
  'CSE Seminar Hall, 2nd Floor',
  '2026-11-06T20:00:00+05:30',
  'https://forms.gle/msu-tech-talk-architecture',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=80',
  'Industry guest lecture on cloud native microservices, event-driven architecture, and distributed systems.',
  'Hosted by MSU alumni working at leading tech enterprises. Open Q&A and placement networking.',
  'Open to all years.',
  'devinfinity.club@msubaroda.ac.in',
  'https://devinfinity.msu.edu',
  false,
  'published',
  340,
  95,
  ARRAY['Architecture', 'Cloud', 'DistributedSystems', 'TechTalk']
),
(
  'eccccccc-cccc-cccc-cccc-cccccccccccc',
  'c4444444-4444-4444-4444-444444444444',
  'Arduino & Sensor Build Day',
  'arduino-sensor-build-day',
  'Workshop',
  '2026-11-10',
  'Tuesday',
  '14:00:00',
  '17:30:00',
  'Electrical Workshop Block',
  '2026-11-09T18:00:00+05:30',
  'https://forms.gle/msu-arduino-build-day',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80',
  'Hands-on breadboarding, ultrasonic sensors, servos, and PWM control with Arduino UNO.',
  'Hardware kit provided for each pair. Build your first physical sensor instrument and take home your circuit logic.',
  'All engineering branches welcome.',
  'robotics.club@msubaroda.ac.in',
  'https://robotics-msu.org',
  false,
  'published',
  290,
  74,
  ARRAY['Arduino', 'Sensors', 'Embedded', 'Hardware']
),
(
  'eddddddd-dddd-dddd-dddd-dddddddddddd',
  'c5555555-5555-5555-5555-555555555555',
  'Personal Finance & Equity Basics for Engineers',
  'personal-finance-equity-basics',
  'Seminar',
  '2026-11-14',
  'Saturday',
  '15:00:00',
  '17:00:00',
  'Mechanical Auditorium, FTE',
  '2026-11-13T20:00:00+05:30',
  'https://ecell-msu.org/finance-basics',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1000&auto=format&fit=crop&q=80',
  'Understand index funds, employee stock options (ESOPs), compounding, and personal taxation before your first job.',
  'Essential financial literacy designed specifically for upcoming engineering graduates.',
  'Final and pre-final year students.',
  'ecell.finance@msubaroda.ac.in',
  'https://ecell-msu.org',
  false,
  'published',
  460,
  130,
  ARRAY['Finance', 'ESOPs', 'Taxation', 'Wealth']
),
(
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'c3333333-3333-3333-3333-333333333333',
  'Annual Cultural Night & Theatre Showcase',
  'annual-cultural-night',
  'Cultural',
  '2026-11-20',
  'Friday',
  '17:30:00',
  '21:30:00',
  'Main Open Air Theatre (OAT), MSU Baroda',
  '2026-11-19T12:00:00+05:30',
  'https://forms.gle/msu-cultural-night-2026',
  'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=1000&auto=format&fit=crop&q=80',
  'Campus flagship cultural evening with theatrical plays, band performances, and classical dances.',
  'The largest non-technical celebration of the autumn term across the University.',
  'Open to all MSU students & faculty.',
  'cultural.fte@msubaroda.ac.in',
  'https://cultural-fte.org',
  true,
  'published',
  890,
  350,
  ARRAY['Cultural', 'Music', 'Theatre', 'Celebration']
),
(
  'efffffff-ffff-ffff-ffff-ffffffffffff',
  'c2222222-2222-2222-2222-222222222222',
  'UI/UX Design Systems with Figma',
  'ui-ux-design-systems-figma',
  'Workshop',
  '2026-09-20',
  'Sunday',
  '10:00:00',
  '13:00:00',
  'Computer Center Lab 1',
  '2026-09-19T23:59:00+05:30',
  'https://forms.gle/msu-figma-workshop',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=1000&auto=format&fit=crop&q=80',
  'Design tokens, typography scales, auto-layout, and interactive prototypes for student product builders.',
  'Archived past workshop recording and Figma resource library available for attendees.',
  'All students.',
  'devinfinity.club@msubaroda.ac.in',
  'https://devinfinity.msu.edu',
  false,
  'past',
  640,
  210,
  ARRAY['UIUX', 'Figma', 'Design', 'Product']
),
(
  'e0000000-0000-0000-0000-000000000000',
  'c1111111-1111-1111-1111-111111111111',
  'Debugging & Reverse Engineering Challenge',
  'debugging-reverse-engineering-challenge',
  'Coding Contest',
  '2026-09-15',
  'Tuesday',
  '17:00:00',
  '20:00:00',
  'Computer Center Lab 2',
  '2026-09-14T23:59:00+05:30',
  'https://unstop.com/o/msu-debugging-challenge',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1000&auto=format&fit=crop&q=80',
  'Find obscure memory leaks, segfaults, and logical bugs across 5 deliberately broken C++ codebases.',
  'Archived contest with published post-mortem analysis and fastest solver leaderboards.',
  'Open to all students.',
  'vimarsh.cse@msubaroda.ac.in',
  'https://vimarsh-msu.github.io',
  false,
  'past',
  530,
  175,
  ARRAY['Debugging', 'C++', 'Security', 'Contest']
)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    event_date = EXCLUDED.event_date,
    venue = EXCLUDED.venue,
    status = EXCLUDED.status,
    views = EXCLUDED.views,
    registration_clicks = EXCLUDED.registration_clicks;

-- 3. SEED 5 QUIZ QUESTIONS & WEIGHTED OPTIONS (VALID HEXADECIMAL UUIDs: d1111111-...)
DO $$
DECLARE
  q1 UUID := 'd1111111-1111-1111-1111-111111111111';
  q2 UUID := 'd2222222-2222-2222-2222-222222222222';
  q3 UUID := 'd3333333-3333-3333-3333-333333333333';
  q4 UUID := 'd4444444-4444-4444-4444-444444444444';
  q5 UUID := 'd5555555-5555-5555-5555-555555555555';
BEGIN
  INSERT INTO public.quiz_questions (id, question_text, category, order_index, is_active)
  VALUES
    (q1, 'When you open your laptop on a free Saturday morning, what are you most drawn to doing?', 'Natural Curiosity', 1, true),
    (q2, 'What kind of achievement gives you the biggest rush of adrenaline?', 'Reward Drivers', 2, true),
    (q3, 'Which toolkit or environment would you enjoy mastering the most?', 'Technical Stacks', 3, true),
    (q4, 'What type of campus event are you most eager to participate in?', 'Event Preferences', 4, true),
    (q5, 'In your dream career after graduation, what role appeals to you most?', 'Career Vision', 5, true)
  ON CONFLICT (id) DO UPDATE
  SET question_text = EXCLUDED.question_text,
      category = EXCLUDED.category;

  -- Options for Q1
  DELETE FROM public.quiz_options WHERE question_id IN (q1, q2, q3, q4, q5);

  INSERT INTO public.quiz_options (question_id, option_text, club_weights, order_index)
  VALUES
    (q1, 'Tackling tricky algorithmic puzzles or grinding LeetCode / Codeforces problems.', '{"vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 1, "cultural-club": 0}', 1),
    (q1, 'Building an app, redesigning a landing page, or tinkering with a full-stack web project.', '{"dev-infinity": 5, "vimarsh": 1, "robotics-club": 1, "finance-entrepreneurship": 2, "cultural-club": 0}', 2),
    (q1, 'Writing music, jamming on an instrument, practicing theatre, or planning a campus social.', '{"cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0}', 3),
    (q1, 'Soldering microcontroller circuits, tuning motors, or programming Arduino / Raspberry Pi boards.', '{"robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 4),
    (q1, 'Reading startup breakdowns, tracking market indices, or drafting pitch decks and business models.', '{"finance-entrepreneurship": 5, "dev-infinity": 1, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0}', 5);

  -- Options for Q2
  INSERT INTO public.quiz_options (question_id, option_text, club_weights, order_index)
  VALUES
    (q2, 'Seeing a Green Accepted verdict on a hard dynamic programming or graph problem.', '{"vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "finance-entrepreneurship": 0, "cultural-club": 0}', 1),
    (q2, 'Deploying a live web app to production and sharing a working URL with hundreds of peers.', '{"dev-infinity": 5, "vimarsh": 1, "finance-entrepreneurship": 2, "robotics-club": 1, "cultural-club": 0}', 2),
    (q2, 'Hearing the entire auditorium erupt in applause after an electrifying performance.', '{"cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0}', 3),
    (q2, 'Watching a physical robot navigate an obstacle course autonomously without crashing.', '{"robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 4),
    (q2, 'Convincing a panel of judges that your business model is commercially viable and scalable.', '{"finance-entrepreneurship": 5, "cultural-club": 1, "dev-infinity": 1, "vimarsh": 0, "robotics-club": 0}', 5);

  -- Options for Q3
  INSERT INTO public.quiz_options (question_id, option_text, club_weights, order_index)
  VALUES
    (q3, 'Modern C++20 with STL algorithms and competitive debugging tooling.', '{"vimarsh": 5, "robotics-club": 2, "dev-infinity": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 1),
    (q3, 'React, Tailwind CSS, Node.js, Next.js, and cloud platforms.', '{"dev-infinity": 5, "finance-entrepreneurship": 2, "vimarsh": 1, "cultural-club": 0, "robotics-club": 1}', 2),
    (q3, 'Acoustic instruments, stage lighting rigs, audio interfaces, and digital recording DAWs.', '{"cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0}', 3),
    (q3, 'MicroPython, ROS (Robot Operating System), motor controllers, and 3D printing slicers.', '{"robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 4),
    (q3, 'Financial modeling spreadsheets, pitch deck design, and market valuation simulators.', '{"finance-entrepreneurship": 5, "dev-infinity": 1, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0}', 5);

  -- Options for Q4
  INSERT INTO public.quiz_options (question_id, option_text, club_weights, order_index)
  VALUES
    (q4, 'Speed coding tournaments with real-time scoreboards and algorithmic sprints.', '{"vimarsh": 5, "dev-infinity": 2, "robotics-club": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 1),
    (q4, '36-hour weekend hackathons building full-stack products from scratch.', '{"dev-infinity": 5, "finance-entrepreneurship": 2, "vimarsh": 2, "robotics-club": 1, "cultural-club": 0}', 2),
    (q4, 'Sunset acoustic open-mics, fine art galas, and theatre performances.', '{"cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 0, "vimarsh": 0, "robotics-club": 0}', 3),
    (q4, 'RoboWars combat tournaments and autonomous obstacle racing tracks.', '{"robotics-club": 5, "dev-infinity": 1, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 4),
    (q4, 'Shark-Tank style venture pitch nights with real angel investors.', '{"finance-entrepreneurship": 5, "dev-infinity": 2, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0}', 5);

  -- Options for Q5
  INSERT INTO public.quiz_options (question_id, option_text, club_weights, order_index)
  VALUES
    (q5, 'High-frequency trading engineer, quantitative analyst, or systems performance architect.', '{"vimarsh": 5, "finance-entrepreneurship": 2, "dev-infinity": 1, "robotics-club": 0, "cultural-club": 0}', 1),
    (q5, 'Lead full-stack engineer or CTO at a high-growth tech startup.', '{"dev-infinity": 5, "finance-entrepreneurship": 2, "vimarsh": 1, "robotics-club": 1, "cultural-club": 0}', 2),
    (q5, 'Creative director, event producer, digital media specialist, or designer.', '{"cultural-club": 5, "finance-entrepreneurship": 1, "dev-infinity": 1, "vimarsh": 0, "robotics-club": 0}', 3),
    (q5, 'Autonomous robotics engineer, embedded systems developer, or hardware architect.', '{"robotics-club": 5, "dev-infinity": 2, "vimarsh": 1, "cultural-club": 0, "finance-entrepreneurship": 0}', 4),
    (q5, 'Tech venture founder, product manager, or venture capital investment associate.', '{"finance-entrepreneurship": 5, "dev-infinity": 2, "cultural-club": 1, "vimarsh": 0, "robotics-club": 0}', 5);
END $$;

-- 4. SEED CAMPUS LOUNGE GALLERY POSTS (VALID HEXADECIMAL UUIDs: b1111111-...)
INSERT INTO public.lounge_posts (
  id, club_id, title, caption, image_url, category, academic_year, location, likes
) VALUES
(
  'b1111111-1111-1111-1111-111111111111',
  'c2222222-2222-2222-2222-222222222222',
  'HackMSU 36-Hour Midnight Coding Floor',
  '3:00 AM energy at CSE Lab 2 during the HackMSU sprint. Coffee cups, terminal splits, and relentless team synergy.',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80',
  'Competitions',
  '2025-26',
  'CSE Computer Center',
  142
),
(
  'b2222222-2222-2222-2222-222222222222',
  'c4444444-4444-4444-4444-444444444444',
  'RoboCombat 15kg Arena Inspection',
  'Safety testing spinning weapon bars in the enclosed combat arena before the tournament face-offs.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=1000&auto=format&fit=crop&q=80',
  'Competitions',
  '2025-26',
  'Mechanical Workshop Grounds',
  189
),
(
  'b3333333-3333-3333-3333-333333333333',
  'c3333333-3333-3333-3333-333333333333',
  'Acoustic Sunset Jam on Central Lawn',
  'Over 200 students gathered under the trees for an impromptu acoustic session featuring indie guitar chords and poetry.',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
  'Club Activities',
  '2025-26',
  'Central Lawns Amphitheatre',
  275
)
ON CONFLICT (id) DO NOTHING;
