# Backend Progress (Seat Genie)

## Current Stage
Initial backend foundation created for the library management system.

## What Exists
- Express server skeleton under `backend/` with logging, security middleware, and error handling.
- Health check route: `GET /health`.
- Books API routes: CRUD under `GET/POST/PUT/DELETE /api/books`.
- Authors API routes: CRUD under `GET/POST/PUT/DELETE /api/authors`.
- Members API routes: CRUD under `GET/POST/PUT/DELETE /api/members` with active-loan guard on delete.
- Loans API routes: CRUD under `GET/POST/PUT/DELETE /api/loans` with book availability checks.
- Reports API route: `GET /api/reports/overdue-loans` with optional `asOf` query.
- SQLite access layer using `better-sqlite3` (expects a local DB file).
- Initial database schema defined in `backend/sql/schema.sql`.
- Backend API usage documented in `backend/README.md`.

## Schema Decisions
- Core tables: `authors`, `books`, `members`, `loans`.
- `books.status` supports: `available`, `checked_out`, `lost`.
- Foreign keys are enforced (SQLite pragma set in code).

## Assumptions
- SQLite is the first persistence target for local development.
- Migrations will be executed manually after automation completes.

## Next Recommended Step
Add lightweight analytics endpoints (e.g., most active members) and consider pagination for list endpoints.
