# Seat Genie Backend (Express)

## Overview
Express + SQLite backend for the library management system. All backend code lives under `backend/`.

## Requirements
- Node.js 18+ recommended
- SQLite CLI (optional, for creating the DB)

## Setup
1. Install dependencies:

```bash
cd backend
npm install
```

2. Create the database schema locally (manual step):

```bash
sqlite3 backend/data/library.db < backend/sql/schema.sql
```

3. Configure environment (optional):

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3001` | HTTP port for the API server |
| `DATABASE_FILE` | `backend/data/library.db` | SQLite file path |
| `LOG_LEVEL` | `info` | Pino log level |

4. Run the server:

```bash
npm run dev
```

## API
All responses are JSON. Successful responses are wrapped as `{ "data": ... }`. Errors return `{ "error": "message" }`.

List endpoints support optional pagination query params:
- `limit` (default `25`, max `100`)
- `offset` (default `0`)

Paginated responses include `meta` with `total`, `limit`, and `offset`.

### Health
- `GET /health` → `{ status: "ok" }`

### Books
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`

Query params for `GET /api/books`:
- `status`: `available`, `checked_out`, `lost`
- `authorId`: numeric
- `title`: partial title match
- `isbn`: partial ISBN match
- `publishedYear`: numeric
- `sortBy`: `id`, `title`, `published_year`, `status`, `author_name`
- `sortOrder`: `asc`, `desc`
- `limit`, `offset` for pagination

Example body:

```json
{
  "title": "The Pragmatic Programmer",
  "isbn": "978-0201616224",
  "authorId": 1,
  "publishedYear": 1999,
  "status": "available"
}
```

### Members
- `GET /api/members`
- `GET /api/members/:id`
- `POST /api/members`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`

Query params for `GET /api/members`:
- `q`: partial match against name/email/phone
- `sortBy`: `id`, `name`, `email`, `created_at`
- `sortOrder`: `asc`, `desc`
- `limit`, `offset` for pagination

Example body:

```json
{
  "name": "Avery Chen",
  "email": "avery@example.com",
  "phone": "+1-555-0199"
}
```

Notes:
- Deleting a member with active loans returns `409`.

### Authors
- `GET /api/authors`
- `GET /api/authors/:id`
- `POST /api/authors`
- `PUT /api/authors/:id`
- `DELETE /api/authors/:id`

Query params for `GET /api/authors`:
- `q`: partial match against name/bio
- `sortBy`: `id`, `name`, `created_at`
- `sortOrder`: `asc`, `desc`
- `limit`, `offset` for pagination

Example body:

```json
{
  "name": "Andy Hunt",
  "bio": "Co-author of The Pragmatic Programmer."
}
```

### Loans
- `GET /api/loans`
- `GET /api/loans/:id`
- `POST /api/loans`
- `PUT /api/loans/:id`
- `DELETE /api/loans/:id`

Example body (create):

```json
{
  "bookId": 2,
  "memberId": 3,
  "dueAt": "2026-02-20T00:00:00.000Z"
}
```

Example body (update):

```json
{
  "returnedAt": "2026-02-12T18:30:00.000Z"
}
```

Notes:
- Loan creation checks that the book is available and the member exists.
- Returning a loan updates the book status back to `available`.

### Reports
- `GET /api/reports/overdue-loans`
- `GET /api/reports/most-active-members`
- `GET /api/reports/most-borrowed-books`
- `GET /api/reports/inventory-health`

Optional query params:
- `asOf` (ISO datetime) → Defaults to now.
- `since` (ISO datetime) → Filters loans for activity reports.
- `limit` → Limits the number of records returned (defaults to `25`).
