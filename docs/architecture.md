# CampusBuzz — System Architecture

## Architecture Diagram

```mermaid
graph TD
    Client["React 19 SPA (Vite + Tailwind)"]
    
    subgraph FrontendServices["Client Services Layer"]
        ClubService["clubService"]
        EventService["eventService"]
        SavedService["savedEventService"]
        QuizService["quizService"]
        LoungeService["loungeService"]
    end

    subgraph BackendAPI["Express Backend (Node.js)"]
        AuthMiddleware["requireAuth & requireClubOwnership"]
        EventController["eventController (CRUD)"]
        QuizController["quizController (Recommendation)"]
        AnalyticsController["analyticsController"]
    end

    subgraph SupabasePlatform["Supabase (GCP/AWS)"]
        GoTrue["Supabase Auth (JWT)"]
        PostgREST["PostgREST (Direct Public Reads)"]
        PostgresDB[("PostgreSQL Database + RLS")]
    end

    Client --> FrontendServices
    Client --> GoTrue
    FrontendServices --> PostgREST
    PostgREST --> PostgresDB

    Client --> BackendAPI
    BackendAPI --> AuthMiddleware
    AuthMiddleware --> PostgresDB
    EventController --> PostgresDB
    QuizController --> PostgresDB
    AnalyticsController --> PostgresDB
```

## Core Architectural Decisions

### 1. Hybrid Client/Server Query Pattern
- **Public & High-Frequency Reads**: Direct client queries to Supabase via `@supabase/supabase-js`. RLS ensures users only read what is published.
- **Protected Actions & Server Business Logic**: Channeled through Express routes (`/api/events`, `/api/quiz/recommend`, `/api/analytics`), ensuring input validation, ownership assertions, and safe rate limiting.

### 2. Immediate Publishing
In collegiate event discovery, rapid iteration is paramount. Organizers publish events immediately with no administrative approval queue. Faculty admins retain oversight via an asynchronous moderation console with full revocation privileges.

### 3. Graceful Progressive Enhancement
Every frontend service checks `isSupabaseConfigured` and catches errors gracefully, falling back to local dataset defaults if the live database tables have not yet been populated or the network drops.
