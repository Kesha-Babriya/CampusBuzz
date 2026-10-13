# CampusBuzz — Centralized Student Discovery & Event Platform

> **Faculty of Technology & Engineering, The Maharaja Sayajirao University of Baroda (MSU Baroda)**

CampusBuzz is a centralized platform designed to solve fragmented event announcements across scattered WhatsApp groups, dead Instagram links, and clunky Google Forms. Built with a dark campus cyber aesthetic, it allows students to discover hackathons, technical workshops, cultural nights, and club societies in one synchronized hub.

---

## Architecture Overview

```text
       React 19 (Vite + Tailwind CSS)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
Supabase Client (Direct RLS)    Express Backend (/api)
        │                           │
        │ - Public read queries     │ - Ownership verification
        │ - Auth session & tokens   │ - Event CRUD authorization
        │ - Saved events sync       │ - Deterministic quiz scoring
        │                           │ - Analytics aggregation
        └─────────────┬─────────────┘
                      ▼
        Supabase PostgreSQL Database
  (Row-Level Security, Triggers & Relations)
```

---

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v3.4, React Router DOM v7, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, CORS, `@supabase/supabase-js`, `dotenv`.
- **Database & Auth**: Supabase PostgreSQL, Supabase GoTrue Auth, Row Level Security (RLS) policies.

---

## User Roles & Permissions

| Role | Permissions | Authorization Enforcement |
| :--- | :--- | :--- |
| **Anonymous** | Browse active clubs, view published events, read lounge posts, take recommendation quiz. | PostgreSQL RLS (`events`, `clubs`, `lounge_posts` SELECT). |
| **Student** | Bookmark/save events, persist quiz match results, manage personal profile. | Supabase Auth JWT + RLS (`saved_events`, `quiz_results`). |
| **Organizer** | Manage & publish events **only for their assigned club**, view event analytics. | Express middleware `requireClubOwnership` + PostgreSQL RLS. |
| **Faculty Admin** | Oversee all clubs, audit/moderate any published event, view university-wide metrics. | Role check `requireRole('admin')` + RLS `is_admin()`. |

> **Immediate Publishing Model**: Authorized organizers publish events immediately without waiting in an administrative approval queue. Faculty admins moderate and revoke events asynchronously.

---

## Getting Started

### 1. Prerequisites
- Node.js v20+
- A Supabase Project ([supabase.com](https://supabase.com))

### 2. Environment Configuration
Create `.env.local` in the project root:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key

# Optional backend overrides (defaults to .env.local values)
PORT=5000
```

### 3. Database Setup (Supabase SQL Editor)
Run the master migration script located at [`supabase/schema.sql`](file:///c:/Users/01/OneDrive/Desktop/CampusBuzz/supabase/schema.sql) in your Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Click **New Query**.
3. Copy and paste the contents of `supabase/schema.sql`.
4. Click **Run**.

This script sets up:
- Core tables (`profiles`, `clubs`, `club_members`, `events`, `saved_events`, `quiz_questions`, `quiz_options`, `quiz_results`, `lounge_posts`, `event_analytics`).
- Automated user profile creation trigger (`handle_new_user` on `auth.users`).
- Row Level Security (RLS) policies and security functions (`is_admin()`, `is_club_organizer()`).
- Seed data for 5 MSU Baroda clubs (VIMARSH, Dev Infinity, Cultural Club, Robotics Club, Finance Club) and sample events.

### 4. Running the Application

**Run Frontend:**
```bash
npm install
npm run dev
```
The frontend is available at `http://localhost:5173/`.

**Run Backend API (optional for server-side endpoints):**
```bash
npm run server:dev
```
The API server is available at `http://localhost:5000/`.
Health check: `http://localhost:5000/api/health`.

---

## API Endpoints

### Events
- `GET /api/events` — Retrieve published events with optional filtering (`?category=...&club=...&search=...`).
- `GET /api/events/:id` — Retrieve single event details.
- `POST /api/events` — Publish new event (requires organizer/admin token, validated against assigned club).
- `PATCH /api/events/:id` — Update event (requires club ownership or admin).
- `DELETE /api/events/:id` — Delete event (requires club ownership or admin).

### Quiz Recommendation
- `POST /api/quiz/recommend` — Weighted scoring engine that maps student quiz answers to ranked clubs.

### Analytics
- `GET /api/analytics/events/:id` — Event views, registration clicks, and student save counts.
- `POST /api/analytics/events/:id/click` — Records registration link click.

---

## Security Highlights
- **Zero Exposed Secrets**: Service-role keys are never exposed in browser bundles.
- **RLS Guardrails**: An organizer belonging to VIMARSH cannot edit an event created by Dev Infinity even if they manipulate client parameters.
- **Fail-Safe Fallback**: When Supabase is offline or tables are being initialized, all services gracefully fallback to local demo data so the UI remains 100% interactive.
