# CampusBuzz — API Specification

The Express backend serves RESTful routes at `/api`.

## 1. Events API

### `GET /api/events`
Returns list of published events with optional filtering.
- **Query Parameters**:
  - `category` (optional, string) — Filter by event category
  - `club` (optional, string) — Filter by club slug or ID
  - `search` (optional, string) — Case-insensitive title search
  - `limit` (optional, integer) — Maximum records (default: 50)
- **Response**:
```json
{
  "success": true,
  "count": 6,
  "data": [ ... ]
}
```

### `GET /api/events/:id`
Returns single event record with expanded club details.

### `POST /api/events`
Publishes a new event.
- **Headers**: `Authorization: Bearer <token>`
- **Authorization**: User must have role `organizer` or `admin`, and be assigned to the event's club in `club_members`.
- **Response**: `201 Created` with published event object.

### `PATCH /api/events/:id`
Updates an existing event.
- **Headers**: `Authorization: Bearer <token>`
- **Authorization**: User must be the organizer of the event's club or `admin`.

### `DELETE /api/events/:id`
Deletes/revokes an event.
- **Headers**: `Authorization: Bearer <token>`
- **Authorization**: User must be the organizer of the event's club or `admin`.

---

## 2. Quiz Recommendation API

### `POST /api/quiz/recommend`
Calculates deterministic weighted scores for clubs matching the student's answers.
- **Body**:
```json
{
  "answers": {
    "q-1": 0,
    "q-2": 1,
    "q-3": 2
  },
  "userId": "optional-uuid"
}
```
- **Response**:
```json
{
  "success": true,
  "data": {
    "topMatch": {
      "clubId": "...",
      "clubName": "Dev Infinity",
      "slug": "dev-infinity",
      "score": 18
    },
    "rankings": [ ... ],
    "allScores": { "dev-infinity": 18, "vimarsh": 14, ... }
  }
}
```

---

## 3. Analytics API

### `GET /api/analytics/events/:id`
Returns real-time views, registration link clicks, and total bookmark count for the specified event.

### `POST /api/analytics/events/:id/click`
Atomically records a registration link click.
