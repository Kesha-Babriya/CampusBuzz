# GEMINI.md — CampusBuzz Master Project Memory & Architecture Guide

> **CRITICAL DIRECTIVE FOR ANTIGRAVITY AGENTS:**
> This document is the permanent single source of truth for **CampusBuzz**.
> Whenever starting a new session or resuming development, **read this file first before modifying any code**.
> Do NOT redesign the architecture, do NOT rewrite existing working components, and do NOT remove features without explicit user instruction.
> **SECURITY RULE**: Never write real API keys, passwords, JWT secrets, or connection strings into this file or any tracked repository file.

---

## 1. PROJECT OVERVIEW

* **Project Name**: CampusBuzz
* **Tagline**: *"Every CSE Event. One Campus."*
* **Institution**: Faculty of Technology & Engineering (FTE), Maharaja Sayajirao University of Baroda (MSU Baroda), Vadodara, Gujarat, India.
* **Purpose**: A centralized, modern student event and club discovery platform built specifically for the student and faculty ecosystem of MSU Baroda.
* **Target Users**:
  1. **Students**: Discover upcoming hackathons, coding contests, technical workshops, cultural galas, and guest lectures across MSU clubs without searching fragmented group chats.
  2. **Club Organizers / Leads**: Publish, update, and manage official club events, track registration clicks and views, and manage their club presence.
  3. **Faculty / Administrators**: Verify and monitor campus activities, oversee club integrity, and maintain platform security.
* **Problem Solved**:
  * Prior to CampusBuzz, event announcements at MSU were scattered across unofficial WhatsApp groups, Instagram stories, temporary posters, and disparate club websites.
  * Students frequently missed registration deadlines or were unaware of inter-departmental workshops.
  * Clubs struggled with cross-department discovery and inconsistent engagement telemetry.
* **What CampusBuzz IS**:
  * A centralized discovery hub and calendar for campus events.
  * A club directory with profiles, lead contacts, and activity archives.
  * An interactive recommendation engine ("Club Fit Quiz") matching students to societies based on technical skills and interests.
  * A lightweight event publishing system for verified student organizers.
  * A visual gallery ("Campus Lounge") showcasing real campus memories and past event highlights.
* **What CampusBuzz is NOT**:
  * It is **NOT** a generic, bureaucratic college management ERP or LMS (like Moodle/Canvas).
  * It is **NOT** an attendance tracking or student grading system.
  * It is **NOT** an internal payment gateway (event registration redirects to external platforms like Unstop, Devfolio, Google Forms, or official club portals).
  * It is **NOT** a replacement for existing club websites or Instagram handles; it links out to them.

---

## 2. FINALIZED SCOPE & CONSTRAINTS

1. **CSE-Focused Core Scope**:
   * Initial focus is centered around the Faculty of Technology & Engineering, particularly the Department of Computer Science & Engineering and allied branches.
2. **Lightweight Event Publishing**:
   * Organizers submit event details (title, dates, venue, eligibility, poster, external registration link).
   * Events can be in `published`, `past`, `cancelled`, or `archived` states.
3. **Five (5) Core Clubs Defined for Scope**:
   * **VIMARSH** (`vimarsh`): Competitive Programming, Data Structures & Algorithms, ICPC training.
   * **Dev Infinity** (`dev-infinity`): Full-Stack Web, Mobile, Open Source, Hackathons (HackMSU).
   * **Cultural & Arts Committee** (`cultural-club`): Music, theatre, performing arts, annual cultural nights.
   * **Robotics & Automation Society** (`robotics-club`): Combat robotics (RoboWars), Arduino/ESP32, ROS, embedded systems.
   * **Finance & Entrepreneurship Cell** (`finance-entrepreneurship`): E-Cell, angel pitch summits, venture modeling, stock market simulations.
4. **External Registrations**:
   * Platform does not capture credit cards or process tickets; it records registration clicks and directs students to external registration URLs (Unstop, Devfolio, Google Forms).
5. **Autonomous Mock/Live Dual Mode**:
   * Because student club cooperation during development can vary, the application is built with a **graceful dual-mode architecture**:
     * If Supabase is connected and configured, the app reads and writes to live PostgreSQL via Supabase.
     * If Supabase is not configured or offline, the app seamlessly falls back to high-fidelity mock data without throwing UI crashes.

---

## 3. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.2.8` | Core UI library |
| **Vite** | `8.3.0` | Frontend build tool & HMR dev server |
| **React Router DOM** | `7.18.4` | Client-side routing with nested layouts |
| **Tailwind CSS** | `3.4.x` | Utility-first styling with custom dark theme tokens |
| **Framer Motion** | `14.0.0` | Micro-animations, page transitions, modal reveals |
| **Lucide React** | `1.52.0` | Consistent iconography |
| **Canvas Confetti** | `1.9.4` | Quiz completion celebration effect |
| **clsx / tailwind-merge**| `2.1.1 / 3.7.0` | Dynamic className composition |
| **Oxlint** | `1.81.0` | High-performance linter |

### Backend API Server
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `20+` (ES Modules) | Runtime environment |
| **Express** | `4.21.2` | REST API routing and middleware pipeline |
| **@supabase/supabase-js** | `2.49.1` (server) / `2.109.0` (client) | Supabase client SDK |
| **cors** | `2.8.5` | Cross-Origin Resource Sharing |
| **dotenv** | `16.4.7` | Environment variable loader |
| **ws** | `8.22.0` | WebSocket transport support for realtime connections |

### Database & Security
| Technology | Implementation |
| :--- | :--- |
| **Database** | PostgreSQL 15+ hosted on Supabase |
| **Authentication** | Supabase Auth (JWT bearer tokens, email/password) |
| **Authorization** | PostgreSQL Row Level Security (RLS) with strict policies |
| **Integrity** | `BEFORE UPDATE` triggers preventing role and club reassignment |
| **Recursion Prevention** | `SECURITY DEFINER` helper functions (`get_my_role()`, `is_admin()`) |

---

## 4. CURRENT PROJECT STRUCTURE

```text
CampusBuzz/
├── .env.example                     # Environment template (NO secrets)
├── .env.local                       # Local config (git-ignored, contains Supabase URL/keys)
├── .gitignore                       # Git ignore rules (node_modules, dist, *.local)
├── index.html                       # HTML5 entrypoint with Google Fonts (Inter, Plus Jakarta Sans)
├── package.json                     # Root npm configuration & scripts
├── postcss.config.js                # PostCSS config (Tailwind + Autoprefixer)
├── tailwind.config.js               # Theme colors (campus-950 to campus-700, cyan, blue, purple)
├── vite.config.js                   # Vite configuration
│
├── src/                             # Frontend Source Code
│   ├── main.jsx                     # React root DOM mount
│   ├── App.jsx                      # Router root, AuthProvider & SavedEventsProvider
│   ├── App.css                      # Global component styles
│   ├── index.css                    # Tailwind directives, dark scrollbar, glassmorphism utilities
│   │
│   ├── lib/
│   │   └── supabaseClient.js        # Supabase client instantiation with fallback detection
│   │
│   ├── context/
│   │   ├── AuthContext.jsx          # Auth state, session sync, mock user switcher (Student/Org/Admin)
│   │   └── SavedEventsContext.jsx   # Bookmark state management with localStorage & Supabase sync
│   │
│   ├── services/                    # Dual-mode data access layer (Supabase -> Mock fallback)
│   │   ├── clubService.js           # Club listing, detail by slug, member retrieval
│   │   ├── eventService.js          # Event filtering, search, detail, view increment, CRUD
│   │   ├── loungeService.js         # Campus lounge gallery posts, likes
│   │   ├── quizService.js           # Quiz questions, options, result persistence
│   │   └── savedEventService.js     # User saved bookmarks service
│   │
│   ├── data/                        # High-fidelity mock/seed fallback datasets
│   │   ├── mockClubs.js             # 5 core clubs data
│   │   ├── mockEvents.js            # 16 comprehensive events (published & past)
│   │   ├── mockLounge.js            # Campus lounge images and metadata
│   │   └── mockQuiz.js              # 5-step quiz questions with club weight vectors
│   │
│   ├── components/
│   │   ├── common/                  # Reusable UI primitives
│   │   │   ├── Badge.jsx            # Category & status pills
│   │   │   ├── Button.jsx           # Variant buttons (primary, secondary, outline, danger)
│   │   │   ├── EmptyState.jsx       # Zero-result placeholder with icon and CTA
│   │   │   ├── LoadingSkeleton.jsx  # Card & text shimmer skeletons
│   │   │   └── Logo.jsx             # Gradient logo mark with typography
│   │   ├── layout/                  # Page scaffolding
│   │   │   ├── Layout.jsx           # Master shell with sticky Navbar and Footer
│   │   │   ├── Navbar.jsx           # Glassmorphism navigation, links, role badge, demo switcher
│   │   │   └── Footer.jsx           # Department branding, links, disclaimer
│   │   ├── events/
│   │   │   └── EventCard.jsx        # Rich event card (poster, date, tags, bookmark button, views)
│   │   └── clubs/
│   │       └── ClubCard.jsx         # Club preview card with category, member count, statement
│   │
│   └── pages/                       # Application Views
│       ├── Home/HomePage.jsx        # Landing hero, live stats, featured events, quiz CTA, clubs
│       ├── Events/
│       │   ├── EventsPage.jsx       # Event discovery with search, category tabs, past/upcoming filter
│       │   └── EventDetailPage.jsx  # Event deep-dive, venue, deadline, view counter, registration
│       ├── Calendar/
│       │   └── CalendarPage.jsx     # Full interactive month view with day event pills and modal
│       ├── Clubs/
│       │   ├── ClubsPage.jsx        # Club directory with domain filters
│       │   └── ClubDetailPage.jsx   # Club profile, leads, what we do tags, club events
│       ├── Quiz/
│       │   └── QuizPage.jsx         # 5-step interactive recommendation quiz with scoring & confetti
│       ├── Saved/
│       │   └── SavedEventsPage.jsx  # Bookmarked events collection with clear/remove options
│       ├── Lounge/
│       │   └── LoungePage.jsx       # Campus photo gallery with category filter and modal preview
│       ├── Auth/
│       │   ├── LoginPage.jsx        # Email/password login with demo account auto-fillers
│       │   └── SignupPage.jsx       # Registration form with department and graduation batch
│       ├── Organizer/
│       │   ├── OrganizerDashboardPage.jsx # Club stats, event management table, status toggles
│       │   └── CreateEventPage.jsx  # Multi-step event creation and editing form with validation
│       ├── Admin/
│       │   └── AdminDashboardPage.jsx     # Master admin portal for all clubs, events, and metrics
│       └── NotFoundPage.jsx         # 404 error page with navigation back to Home
│
├── server/                          # Optional Node.js + Express Backend API
│   ├── package.json                 # Backend dependencies (express, cors, dotenv, @supabase/supabase-js)
│   └── src/
│       ├── server.js                # Port 5000 listener
│       ├── app.js                   # Express app with CORS and route mounting
│       ├── config/
│       │   └── supabase.js          # Server-side Supabase client initialization
│       ├── middleware/
│       │   └── auth.js              # requireAuth, requireRole, requireClubOrganizer middlewares
│       ├── routes/
│       │   ├── eventRoutes.js       # GET /api/events, POST /api/events, PATCH /api/events/:id
│       │   ├── quizRoutes.js        # GET /api/quiz/questions, POST /api/quiz/submit
│       │   └── analyticsRoutes.js   # POST /api/analytics/view, POST /api/analytics/click
│       ├── controllers/
│       │   ├── eventController.js   # Event CRUD logic
│       │   ├── quizController.js    # Quiz question retrieval & score processing
│       │   └── analyticsController.js # View and registration click increments
│       └── validators/
│           └── eventValidator.js    # Input sanitization and payload validation
│
└── supabase/                        # Database Assets
    ├── schema.sql                   # MASTER PRODUCTION SQL (Schema + Functions + Triggers + RLS + Seed)
    └── migrations/
        ├── 001_initial_schema.sql   # Tables and constraints
        ├── 002_rls_policies.sql     # RLS policies and helper functions
        └── 003_seed_data.sql        # 5 clubs, 16 events, quiz, lounge seed data
```

---

## 5. DATABASE ARCHITECTURE

The database schema is defined in [supabase/schema.sql](file:///c:/Users/01/OneDrive/Desktop/CampusBuzz/supabase/schema.sql). It contains exactly **10 tables**, hardened Row Level Security, triggers, and comprehensive seed data.

### 5.1 Tables Summary

1. `profiles`:
   * **Primary Key**: `id UUID REFERENCES auth.users(id) ON DELETE CASCADE`
   * **Columns**: `full_name TEXT`, `email TEXT`, `avatar_url TEXT`, `role TEXT DEFAULT 'student'`, `created_at`, `updated_at`.
   * **Constraint**: `role IN ('student', 'organizer', 'admin')`.
2. `clubs`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Columns**: `name`, `slug UNIQUE`, `description`, `category`, `domain`, `statement`, `logo_url`, `cover_image_url`, `website_url`, `instagram_url`, `github_url`, `contact_email`, `lead_name`, `established`, `member_count`, `what_we_do TEXT[]`, `is_active BOOLEAN DEFAULT true`, `created_at`, `updated_at`.
3. `club_members`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Keys**: `club_id REFERENCES clubs(id) ON DELETE CASCADE`, `user_id REFERENCES profiles(id) ON DELETE CASCADE`
   * **Constraint**: `UNIQUE(club_id, user_id)`, `role IN ('organizer', 'lead')`.
4. `events`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Keys**: `club_id REFERENCES clubs(id) ON DELETE CASCADE`, `created_by REFERENCES profiles(id) ON DELETE SET NULL`
   * **Columns**: `title`, `slug UNIQUE`, `short_description`, `description`, `poster_url`, `category`, `event_date DATE`, `day_of_week`, `start_time TIME`, `end_time TIME`, `venue`, `eligibility`, `registration_deadline TIMESTAMPTZ`, `registration_url`, `contact_email`, `official_url`, `tags TEXT[]`, `featured BOOLEAN DEFAULT false`, `status TEXT DEFAULT 'published'`, `views INTEGER DEFAULT 0`, `registration_clicks INTEGER DEFAULT 0`, `created_at`, `updated_at`.
   * **Constraint**: `status IN ('published', 'cancelled', 'archived', 'past')`.
5. `saved_events`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Keys**: `user_id REFERENCES profiles(id) ON DELETE CASCADE`, `event_id REFERENCES events(id) ON DELETE CASCADE`
   * **Constraint**: `UNIQUE(user_id, event_id)`.
6. `quiz_questions`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Columns**: `question_text`, `category`, `order_index`, `is_active`, `created_at`.
7. `quiz_options`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Key**: `question_id REFERENCES quiz_questions(id) ON DELETE CASCADE`
   * **Columns**: `option_text`, `club_weights JSONB DEFAULT '{}'`, `order_index`, `created_at`.
8. `quiz_results`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Keys**: `user_id REFERENCES profiles(id) ON DELETE CASCADE`, `top_club_id REFERENCES clubs(id) ON DELETE SET NULL`
   * **Columns**: `scores JSONB`, `created_at`.
9. `lounge_posts`:
   * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
   * **Foreign Keys**: `club_id REFERENCES clubs(id) ON DELETE CASCADE`, `event_id REFERENCES events(id) ON DELETE SET NULL`
   * **Columns**: `title`, `caption`, `image_url`, `category`, `academic_year`, `location`, `likes INTEGER DEFAULT 0`, `created_at`.
10. `event_analytics`:
    * **Primary Key**: `id UUID DEFAULT gen_random_uuid()`
    * **Foreign Key**: `event_id REFERENCES events(id) ON DELETE CASCADE UNIQUE`
    * **Columns**: `views INTEGER DEFAULT 0`, `registration_clicks INTEGER DEFAULT 0`, `updated_at`.

### 5.2 Security & Helper Functions

* `get_my_role()`:
  * Marked `SECURITY DEFINER`, `STABLE`, `SET search_path = public`.
  * Queries `profiles.role` for `auth.uid()` with elevated permissions.
  * **Solves RLS recursion** because policies can inspect user role without recursively evaluating policies on `profiles`.
* `is_admin()`:
  * Returns `(public.get_my_role() = 'admin')`.
* `is_club_organizer(target_club_id UUID)`:
  * Checks if `auth.uid()` has a record in `club_members` for `target_club_id` AND has `role IN ('organizer', 'admin')`.
* `increment_event_views(event_id UUID)` & `record_registration_click(event_id UUID)`:
  * Marked `SECURITY DEFINER`, `SET search_path = public`.
  * Verifies `EXISTS (SELECT 1 FROM events WHERE id = event_id AND status IN ('published', 'past'))` before updating `events` and upserting `event_analytics`.
  * Executable by `anon, authenticated`.

### 5.3 Database Triggers

1. `on_auth_user_created` on `auth.users`:
   * Automatically executes `handle_new_user()` on signup.
   * Creates profile with default `role = 'student'`. Non-admins can never self-assign `'organizer'` or `'admin'`.
2. `tr_protect_profile_role` on `public.profiles`:
   * Executes `BEFORE UPDATE`.
   * Checks `IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: only administrators can change user roles.'; END IF;`.
   * Memory comparison eliminates any SQL subquery recursion.
3. `tr_protect_event_club_assignment` on `public.events`:
   * Executes `BEFORE UPDATE`.
   * Checks `IF NEW.club_id IS DISTINCT FROM OLD.club_id AND NOT public.is_admin() THEN RAISE EXCEPTION 'Unauthorized: organizers cannot reassign an event to another club.'; END IF;`.
   * Prevents organizers from moving events across clubs.

### 5.4 Row Level Security (RLS) Rules

* **`profiles`**:
  * `SELECT`: `auth.uid() = id OR public.is_admin()` (Students view own profile; admins view all).
  * `UPDATE`: `auth.uid() = id OR public.is_admin()` (Protected by trigger against role alteration).
* **`club_members`**:
  * `SELECT`: `auth.uid() = user_id OR public.is_club_organizer(club_id) OR public.is_admin()`.
  * `ALL`: `public.is_admin()`.
* **`clubs`**:
  * `SELECT`: `is_active = true OR public.is_admin()`.
  * `UPDATE`: `public.is_club_organizer(id) OR public.is_admin()`.
  * `ALL`: `public.is_admin()`.
* **`events`**:
  * `SELECT`: `status IN ('published', 'past') OR public.is_admin() OR public.is_club_organizer(club_id)`.
  * `INSERT`: `auth.role() = 'authenticated' AND (public.is_admin() OR public.is_club_organizer(club_id))`.
  * `UPDATE`: `USING (...) WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id))`.
  * `DELETE`: `public.is_admin() OR public.is_club_organizer(club_id)`.
* **`saved_events`**:
  * `SELECT / INSERT / DELETE`: strictly `auth.uid() = user_id`.
* **`quiz_questions` & `quiz_options`**:
  * `SELECT`: public (questions where `is_active = true`).
  * `ALL`: `public.is_admin()`.
* **`quiz_results`**:
  * `SELECT`: `auth.uid() = user_id OR public.is_admin()`.
  * `INSERT`: `auth.uid() = user_id`.
* **`lounge_posts`**:
  * `SELECT`: public `true`.
  * `ALL`: `public.is_admin() OR public.is_club_organizer(club_id)`.
* **`event_analytics`**:
  * `SELECT`: `public.is_admin() OR public.is_club_organizer(event.club_id)`.

---

## 6. AUTHENTICATION & AUTHORIZATION

* **Client Context**: [src/context/AuthContext.jsx](file:///c:/Users/01/OneDrive/Desktop/CampusBuzz/src/context/AuthContext.jsx)
  * Listens to `supabase.auth.onAuthStateChange`.
  * If Supabase is unconfigured, falls back to `DEFAULT_USERS` (`student`, `organizer`, `admin`) stored in `localStorage ('cb_user')`.
  * The top Navbar contains a **Demo Account Switcher** pill that enables immediate viva/demo switching between Student, Organizer (VIMARSH), and Admin roles.
* **Server Middleware**: [server/src/middleware/auth.js](file:///c:/Users/01/OneDrive/Desktop/CampusBuzz/server/src/middleware/auth.js)
  * `requireAuth`: Validates Supabase JWT from `Authorization: Bearer <token>`, fetches user profile, attaches `req.user`. In demo mode, accepts `x-demo-role` and `x-demo-club-id`.
  * `requireRole(...roles)`: Enforces role-based permissions (`student`, `organizer`, `admin`).
  * `requireClubOrganizer(paramName)`: Ensures caller is organizer for that specific club or platform admin.

---

## 7. FEATURES ALREADY BUILT & VERIFIED

1. **Homepage (`/`)**:
   * Hero section with animated gradient backdrop, real-time live metrics (16+ Events, 5 Clubs, 1,440+ Members).
   * Trending/Featured events carousel.
   * Category filter pills (Coding, Hackathons, Workshops, Cultural, Finance).
   * Recommendation Quiz banner CTA.
   * Clubs showcase grid.
2. **Events Discovery (`/events`)**:
   * Search input with debounce.
   * Multi-facet filters: Category, Status (All, Upcoming/Published, Past Archives), Date range.
   * View switcher: Grid Cards vs List View.
   * Bookmark action on card with immediate optimistic state update.
3. **Event Detail (`/events/:id`)**:
   * Dynamic slug and ID resolution.
   * Banner image with category badges.
   * Event date, time, venue, eligibility, and host club information.
   * "Register Now" button with external link redirection and registration click counter trigger (`record_registration_click`).
   * Real-time view increment on mount (`increment_event_views`).
   * "Save Event" bookmark toggle.
4. **Interactive Calendar (`/calendar`)**:
   * Clean month-view grid with day blocks.
   * Color-coded event pills for each club/category.
   * Previous/Next month navigation and "Today" button.
   * Modal drawer on clicking any event pill showing key details and direct registration link.
5. **Clubs Directory & Detail (`/clubs`, `/clubs/:id`)**:
   * All 5 core clubs with logos, covers, statements, established year, and member count.
   * Club detail view displaying:
     * Club lead name and batch.
     * Official links (Website, Instagram, GitHub, Contact Email).
     * "What We Do" tag pills.
     * Active upcoming events hosted by the club.
     * Past event archives.
6. **Club Fit Recommendation Quiz (`/quiz`)**:
   * 5-question multi-choice assessment with custom club weight vectors.
   * Step indicator and progress bar.
   * Real-time score calculation determining highest-scoring club match.
   * Completion celebration with `canvas-confetti`.
   * Result card showing matched club, description, why it fits, and "Explore Club" / "Retake Quiz" buttons.
7. **Saved Events / Bookmarks (`/saved`)**:
   * Personal bookmark collection.
   * Persisted locally and synced with Supabase `saved_events`.
   * Empty state with direct "Browse Events" link.
8. **Campus Lounge Gallery (`/lounge`)**:
   * Photo gallery displaying high-resolution campus and event photos.
   * Category filters (Competitions, Club Activities, Workshops).
   * Academic year tags (`2025-26`).
   * Likes counter with optimistic increment.
   * Image lightbox modal.
9. **Authentication (`/login`, `/signup`)**:
   * Form validation, password visibility toggle, error notifications.
   * One-click demo credential autofill for fast testing.
10. **Organizer Portal (`/organizer`, `/organizer/events/create`, `/organizer/events/:id/edit`)**:
    * Dashboard summarizing active events, total views, and registration clicks.
    * Event management table with status indicators and action buttons (Edit, Cancel, Archive).
    * Multi-step event creation form with validation (Date, Time, Venue, Category, External URLs).
11. **Admin Portal (`/admin`)**:
    * Global platform metrics.
    * Overview of all clubs and events.
    * Ability to review, publish, cancel, or delete any event across all clubs.

---

## 8. FEATURES STATUS MATRIX

| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Frontend UI & Components** | **Completed** | Production-ready, dark theme, responsive, zero placeholders |
| **Mock Data Layer** | **Completed** | Full seed data fallback for 5 clubs, 16 events, quiz, lounge |
| **Supabase SQL Schema** | **Completed** | All 10 tables, triggers, functions, and RLS verified |
| **Node.js Express Server** | **Completed** | Routes, controllers, and auth middleware implemented |
| **Dual-Mode Data Services** | **Completed** | Automatically uses Supabase if configured, mock data otherwise |
| **Supabase SQL Execution** | **Pending User Action**| Ready to paste into Supabase SQL Editor |
| **Real Live Auth & DB Connection**| **Pending User Action**| Requires pasting actual Supabase URL & Key into `.env.local` |
| **Image Upload to Supabase Storage**| **Planned (Phase 3)** | Currently uses validated external Unsplash URLs |
| **Automated Email Reminders**| **Planned (Phase 3)** | For registered/saved events |

---

## 9. CURRENT DATABASE/SCHEMA DECISIONS RECORD

The following architectural fixes were finalized in `supabase/schema.sql` and must be preserved:

1. **`events.status` constraint includes `'past'`**:
   * `CHECK (status IN ('published', 'cancelled', 'archived', 'past'))`.
   * Public SELECT policy allows `status IN ('published', 'past')` so past events render in history sections.
2. **Valid Hexadecimal UUIDs**:
   * All 48 UUIDs in seed data use valid hexadecimal characters `[0-9a-f]`.
   * Clubs: `c1111111-...` to `c5555555-...`
   * Events: `e1111111-...` to `efffffff-...` and `e0000000-...`
   * Quiz Questions: `d1111111-...` to `d5555555-...`
   * Lounge Posts: `b1111111-...` to `b3333333-...`
3. **Zero RLS Policy Recursion on `profiles`**:
   * `get_my_role()` is `SECURITY DEFINER` and `SET search_path = public`, bypassing RLS.
   * `is_admin()` checks `get_my_role() = 'admin'`.
   * `profiles` SELECT policy is simply `auth.uid() = id OR public.is_admin()`.
4. **Trigger-Based Role Protection**:
   * Trigger `tr_protect_profile_role` checks `NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin()` in memory, raising an exception if a non-admin attempts role escalation.
5. **Trigger-Based Event Club Boundary Protection**:
   * Trigger `tr_protect_event_club_assignment` prevents organizers from moving events to another club.
   * Event UPDATE policy includes `WITH CHECK (public.is_admin() OR public.is_club_organizer(club_id))`.
6. **Analytics RPC Hardening**:
   * `increment_event_views` and `record_registration_click` verify the event exists and has `status IN ('published', 'past')` before writing.

---

## 10. UI/UX DESIGN SYSTEM

* **Color Palette**:
  * Background: `#070a12` (deepest campus obsidian)
  * Surface Panels: `#0a0e1a` with subtle border `rgba(255, 255, 255, 0.07)`
  * Electric Blue: `#2563eb` / `#3b82f6` (primary brand accent)
  * Cyan: `#06b6d4` / `#22d3ee` (secondary tech highlight)
  * Purple: `#8b5cf6` / `#a855f7` (creative/quiz accent)
  * Text: `#f1f5f9` (primary headings), `#94a3b8` (body descriptions), `#64748b` (muted metadata)
* **Typography**:
  * Body: `Inter`, sans-serif
  * Headings: `Plus Jakarta Sans`, sans-serif
  * Codes / Timestamps / Badges: `JetBrains Mono`, monospace
* **Design Elements**:
  * Glassmorphism (`backdrop-filter: blur(12px)` with subtle border).
  * Rounded corners: `rounded-xl` and `rounded-2xl`.
  * Subtle hover lift: `translate-y-[-2px]` with glow shadow on cards.

---

## 11. CRITICAL CONSTRAINTS FOR FUTURE AGENTS

1. **DO NOT redesign the frontend or rewrite working components**: Phase 1 is complete and approved.
2. **DO NOT change database column names**: The frontend service layer (`eventService.js`, `clubService.js`) maps these specific names.
3. **DO NOT invent unofficial club contacts**: Use only the verified club data in `mockClubs.js` and `supabase/schema.sql`.
4. **DO NOT store or log real secrets in repository files**: `.env.local` is ignored by Git; `.env.example` must contain only dummy placeholders.
5. **DO NOT disable Row Level Security (RLS)**: Public tables must always be protected.

---

## 12. CURRENT STATE & EXACT STOPPING POINT

### Where We Stopped:
* **Completed**:
  1. Full review, hardening, and bug fix of `supabase/schema.sql`.
  2. Fixed profiles RLS recursion using `get_my_role()`.
  3. Added `'past'` status to `events.status` constraint.
  4. Converted all invalid UUIDs (`q111...`, `l111...`) to valid hex UUIDs (`d111...`, `b111...`).
  5. Hardened event UPDATE and analytics RPC functions.
  6. Verified all 48 UUIDs, constraints, and dependencies programmatically.
  7. Created this `GEMINI.md` master documentation.

### Remaining Tasks in Priority Order:
1. **User Action: Execute `supabase/schema.sql` in Supabase**:
   * Paste the contents of `supabase/schema.sql` into the Supabase Dashboard SQL Editor and click **Run**.
2. **Configure Real Supabase Credentials in `.env.local`**:
   * Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.local`.
   * Restart Vite dev server to verify live database connectivity.
3. **Test Real User Signup & Role Assignment**:
   * Test user signup via UI and verify row creation in `profiles` via trigger `handle_new_user`.
   * Test assigning a user as organizer in `club_members` and testing organizer event creation.
4. **Backend API Verification (Optional)**:
   * Run `npm run server:dev` to test Express API endpoints if user desires server-side routing alongside client SDK calls.

---

## 13. KNOWN ISSUES & LIMITATIONS

### Critical
* *None.* (The schema, triggers, RLS, and frontend are running without errors.)

### Medium
* **Supabase Connection**: Until the user executes `supabase/schema.sql` and sets `.env.local`, the frontend continues in mock mode (`isSupabaseConfigured = false`).

### Minor
* **Direct Client SDK vs Express API**: The frontend currently reads and writes to Supabase directly via `supabaseClient.js` in the services layer. The Express server in `server/` is fully functional and ready as an API gateway if the architecture shifts to a backend-mediated model.

---

## 14. INSTRUCTIONS FOR A NEW ANTIGRAVITY AGENT

When resuming work on CampusBuzz:
1. **Read this `GEMINI.md` file first.**
2. **Check the current status**: Inspect `git status` or active files to see if changes occurred since this write.
3. **Do not rebuild or redesign**: Work strictly from Section 12 ("Current State & Exact Stopping Point").
4. **Test non-destructively**: Check `npm run dev` (Vite) and browser console for errors before making edits.
5. **Ask before major structural changes**: If a proposed change affects table names, column names, or authentication architecture, confirm with the user first.

---

## 15. CHRONOLOGICAL CHANGE LOG

* **Phase 1 (Master Initialization & Frontend Design)**:
  * Designed full MSU Baroda dark-theme UI with Tailwind CSS.
  * Created Home, Events, Event Detail, Calendar, Clubs, Club Detail, Quiz, Saved Events, Lounge, Login, Signup, Organizer Dashboard, Create Event, and Admin Dashboard.
  * Built high-fidelity mock data for 5 clubs, 16 events, quiz recommendations, and lounge gallery.
* **Phase 2 (Supabase, Backend & Authentication)**:
  * Created `server/` with Node.js + Express, auth middlewares (`requireAuth`, `requireRole`, `requireClubOrganizer`), routes, and controllers.
  * Created `supabase/migrations/` (001_initial_schema, 002_rls_policies, 003_seed_data) and master `supabase/schema.sql`.
  * Implemented dual-mode services in `src/services/` (`eventService`, `clubService`, `quizService`, `loungeService`, `savedEventService`).
* **Schema Hardening & Verification**:
  * Resolved PostgreSQL RLS recursion on `profiles` by introducing `get_my_role()` (`SECURITY DEFINER`) and memory-based `tr_protect_profile_role` trigger.
  * Added `'past'` status to `events.status` constraint to eliminate seed INSERT failure.
  * Fixed invalid UUID literals (`q...`, `l...`) to valid hex format (`d...`, `b...`).
  * Hardened event update security against cross-club reassignment.
  * Hardened analytics RPC functions (`increment_event_views`, `record_registration_click`).
  * Created `GEMINI.md` as permanent project memory.
* **Phase 3 (Comprehensive Regression Fix & Supabase Live Data Restoration)**:
  * Resolved authentication infinite loading bug in `LoginPage.jsx` and `SignupPage.jsx` with `try ... finally` blocks and in-flight request deduplication with timeout safety in `AuthContext.jsx`.
  * Removed global Quiz promo banner and `useLocation` from `Footer.jsx` so it renders exclusively on `HomePage.jsx` without leaking across routes.
  * Fixed Events page initial 0-events bug: added searchParam listener, dual slug/UUID club matching (`event.clubId === selectedClub || event.clubDbId === selectedClub`), null-safe property searching and date sorting.
  * Fixed Calendar month view: normalized date slicing `e.date.slice(0, 10)` for ISO strings and enabled dual club slug/UUID filtering.
  * Fixed Club Detail Page upcoming events: aligned status filter with database schema constraint (`e.status === 'published' || e.status === 'upcoming'`), restoring all live club events.
  * Fixed Clubs directory & ClubCard: added null safety on `club.whatWeDo`, trimmed category matching, and linked cards to `club.slug || club.id`.
  * Fixed Campus Lounge: added loading skeleton and dual slug/UUID club matching for photo posts.
  * Verified live PostgreSQL data queries via Supabase REST API (16 events, 6 clubs, 3 lounge posts, 5 quiz questions) returning HTTP 200.
  * Validated production build (`npm run build`) and lint (`oxlint` with 0 errors across 56 files).

