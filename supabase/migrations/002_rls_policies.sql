-- ==============================================================================
-- CAMPUSBUZZ — MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. ENABLE RLS ON ALL TABLES
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

-- 2. HELPER FUNCTIONS FOR ROLE CHECKING
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Check if current user is an assigned Organizer for a specific club
-- Crucial Security Guard: Verifies BOTH the club_members relationship AND the profile role!
CREATE OR REPLACE FUNCTION public.is_club_organizer(target_club_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- ==============================================================================
-- 3. PROFILES POLICIES
-- ==============================================================================
-- Restricted: Only the authenticated owner or admins can read profile data
CREATE POLICY "Users can view own profile or admins can view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Users can update only their own profile (cannot escalate their own role!)
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()) OR public.is_admin()
    )
  );

-- Admins can update any profile (e.g. promoting to organizer/admin)
CREATE POLICY "Admins can manage any profile"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- 4. CLUBS POLICIES
-- ==============================================================================
-- Everyone can view active clubs
CREATE POLICY "Clubs are viewable by everyone"
  ON public.clubs FOR SELECT
  USING (is_active = true OR public.is_admin());

-- Admins can create/update/delete clubs
CREATE POLICY "Admins can manage clubs"
  ON public.clubs FOR ALL
  USING (public.is_admin());

-- Club organizers can update their own club profile
CREATE POLICY "Organizers can update their own club"
  ON public.clubs FOR UPDATE
  USING (public.is_club_organizer(id));

-- ==============================================================================
-- 5. CLUB MEMBERS POLICIES (RESTRICTED ACCESS)
-- ==============================================================================
-- Only the assigned user, fellow club organizers, or admins can view club membership records
CREATE POLICY "Club members viewable by assigned user, club organizers, and admins"
  ON public.club_members FOR SELECT
  USING (auth.uid() = user_id OR public.is_club_organizer(club_id) OR public.is_admin());

-- Only Admins can assign or remove organizers
CREATE POLICY "Admins can manage club members"
  ON public.club_members FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. EVENTS POLICIES (CRITICAL SECURITY)
-- ==============================================================================
-- Everyone can read published events
CREATE POLICY "Published events are viewable by everyone"
  ON public.events FOR SELECT
  USING (status = 'published' OR public.is_admin() OR public.is_club_organizer(club_id));

-- Organizers can insert events ONLY for their assigned club
CREATE POLICY "Organizers can create events for their club"
  ON public.events FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      public.is_admin() OR 
      public.is_club_organizer(club_id)
    )
  );

-- Organizers can update ONLY their own club's events
CREATE POLICY "Organizers can update their own club's events"
  ON public.events FOR UPDATE
  USING (
    public.is_admin() OR 
    public.is_club_organizer(club_id)
  )
  WITH CHECK (
    public.is_admin() OR 
    public.is_club_organizer(club_id)
  );

-- Organizers can delete ONLY their own club's events; Admins can delete any
CREATE POLICY "Organizers can delete their own club's events"
  ON public.events FOR DELETE
  USING (
    public.is_admin() OR 
    public.is_club_organizer(club_id)
  );

-- ==============================================================================
-- 7. SAVED EVENTS POLICIES (Student Bookmarks)
-- ==============================================================================
-- Students can only view their own bookmarks
CREATE POLICY "Users can view their own saved events"
  ON public.saved_events FOR SELECT
  USING (auth.uid() = user_id);

-- Students can only save events for themselves
CREATE POLICY "Users can save events for themselves"
  ON public.saved_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Students can only remove their own bookmarks
CREATE POLICY "Users can remove their own saved events"
  ON public.saved_events FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. QUIZ POLICIES
-- ==============================================================================
-- Questions and Options are readable by everyone
CREATE POLICY "Quiz questions are viewable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Quiz options are viewable by everyone"
  ON public.quiz_options FOR SELECT
  USING (true);

-- Admins can manage quiz questions
CREATE POLICY "Admins can manage quiz questions"
  ON public.quiz_questions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can manage quiz options"
  ON public.quiz_options FOR ALL
  USING (public.is_admin());

-- Users can view and save their own quiz results
CREATE POLICY "Users can view their own quiz results"
  ON public.quiz_results FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can save their quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 9. CAMPUS LOUNGE POLICIES
-- ==============================================================================
-- Everyone can view lounge photos
CREATE POLICY "Lounge posts are viewable by everyone"
  ON public.lounge_posts FOR SELECT
  USING (true);

-- Admins and Organizers can publish lounge photos
CREATE POLICY "Organizers and Admins can manage lounge posts"
  ON public.lounge_posts FOR ALL
  USING (public.is_admin() OR public.is_club_organizer(club_id));

-- ==============================================================================
-- 10. EVENT ANALYTICS POLICIES
-- ==============================================================================
-- Viewable by organizers for their club or admins
CREATE POLICY "Analytics are viewable by organizers and admins"
  ON public.event_analytics FOR SELECT
  USING (
    public.is_admin() OR 
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND public.is_club_organizer(e.club_id)
    )
  );

-- Service/system can increment analytics
CREATE POLICY "Anyone can increment views or clicks via public RPC"
  ON public.event_analytics FOR ALL
  USING (true);
