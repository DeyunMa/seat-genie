# Backend Progress (Seat Genie)

## Current Stage
Initial backend foundation created for the library management system.

## What Exists
- Express server skeleton under `backend/` with logging, security middleware, and error handling.
- Health check route: `GET /health`.
- Books API routes: CRUD under `GET/POST/PUT/DELETE /api/books`.
- SQLite access layer using `better-sqlite3` (expects a local DB file).
- Initial database schema defined in `backend/sql/schema.sql`.

## Schema Decisions
- Core tables: `authors`, `books`, `members`, `loans`.
- `books.status` supports: `available`, `checked_out`, `lost`.
- Foreign keys are enforced (SQLite pragma set in code).

## Assumptions
- SQLite is the first persistence target for local development.
- Migrations will be executed manually after automation completes.

## Next Recommended Step
Implement members and loans endpoints (including validation + services), and document API usage in a backend README.
