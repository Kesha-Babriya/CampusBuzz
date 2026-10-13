# CampusBuzz — Database Schema & Relations

## Entity Relationship Overview

```text
auth.users
    │
    ▼
profiles (id, full_name, email, role, avatar_url)
    │
    ├───► club_members (club_id, user_id, role) ───► clubs
    │                                                  │
    ├───► quiz_results (user_id, top_club_id, scores)  │
    │                                                  │
    └──────────────────────────────────────────────┐   │
                                                   ▼   ▼
saved_events (user_id, event_id) ◄────────────── events
                                                   │
                                                   ▼
lounge_posts (club_id, event_id, image_url, caption)
```

## Tables Specification

### 1. `profiles`
Links directly to `auth.users(id)` via foreign key with `ON DELETE CASCADE`.
- `id` (UUID, Primary Key)
- `full_name` (TEXT)
- `email` (TEXT)
- `avatar_url` (TEXT)
- `role` (TEXT: `'student'`, `'organizer'`, `'admin'`, default: `'student'`)
- `created_at`, `updated_at` (TIMESTAMPTZ)

### 2. `clubs`
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `slug` (TEXT UNIQUE)
- `description` (TEXT)
- `category` (TEXT)
- `logo_url`, `cover_image_url`, `website_url`, `instagram_url`, `contact_email`
- `is_active` (BOOLEAN, default: true)

### 3. `club_members`
Normalizes the relationship between organizers and clubs.
- `id` (UUID, Primary Key)
- `club_id` (UUID REFERENCES clubs(id))
- `user_id` (UUID REFERENCES profiles(id))
- `role` (TEXT: `'lead'`, `'organizer'`)

### 4. `events`
- `id` (UUID, Primary Key)
- `club_id` (UUID REFERENCES clubs(id))
- `created_by` (UUID REFERENCES profiles(id))
- `title` (TEXT)
- `slug` (TEXT UNIQUE)
- `category` (TEXT)
- `event_date` (DATE)
- `start_time`, `end_time` (TEXT/TIME)
- `venue`, `eligibility`, `registration_deadline`, `registration_url`
- `poster_url`, `contact_email`, `official_url`
- `status` (`'published'`, `'cancelled'`, `'archived'`)

### 5. `saved_events`
- `id` (UUID, Primary Key)
- `user_id` (UUID REFERENCES profiles(id))
- `event_id` (UUID REFERENCES events(id))
- Unique constraint on `(user_id, event_id)` prevents duplicate bookmarks.

### 6. `quiz_questions` & `quiz_options`
- `quiz_questions` (id, question_text, order_index, category, is_active)
- `quiz_options` (id, question_id, option_text, club_weights JSONB, order_index)

### 7. `quiz_results`
- `id` (UUID, Primary Key)
- `user_id` (UUID REFERENCES profiles(id))
- `top_club_id` (UUID REFERENCES clubs(id))
- `scores` (JSONB)

### 8. `lounge_posts`
- `id` (UUID, Primary Key)
- `club_id` (UUID REFERENCES clubs(id))
- `image_url`, `caption`, `category`, `academic_year`

### 9. `event_analytics`
- `event_id` (UUID REFERENCES events(id) PRIMARY KEY)
- `views` (INTEGER)
- `registration_clicks` (INTEGER)
