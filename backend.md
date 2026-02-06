# Backend Progress (Seat Genie)

## Current Stage
Initial backend foundation created for the library management system.

## Latest Update (2026-02-06)

- Added integration tests (Jest + Supertest) for report endpoints, covering overdue loans, activity rankings, inventory health, and loan history responses.
- Added validation tests for report query parameters (invalid dates, limits, status filters, and since/until ordering).
- Merge note: `ai/report-tests` is ready to merge into `dev` now that `dev` is available.

## What Exists
- Express server skeleton under `backend/` with logging, security middleware, and error handling.
- Health check route: `GET /health`.
- Books API routes: CRUD under `GET/POST/PUT/DELETE /api/books` with pagination metadata on list, plus filtering/sorting for list.
- Authors API routes: CRUD under `GET/POST/PUT/DELETE /api/authors` with pagination metadata plus filtering/sorting on list.
- Members API routes: CRUD under `GET/POST/PUT/DELETE /api/members` with active-loan guard on delete and pagination metadata plus filtering/sorting on list.
- Loans API routes: CRUD under `GET/POST/PUT/DELETE /api/loans` with book availability checks and pagination metadata on list.
- Reports API route: `GET /api/reports/overdue-loans` with optional `asOf` query.
- Reports API route: `GET /api/reports/most-active-members` with optional `since` and `limit` query params.
- Reports API route: `GET /api/reports/most-borrowed-books` with optional `since` and `limit` query params.
- Reports API route: `GET /api/reports/inventory-health` with optional `asOf` query.
- Reports API route: `GET /api/reports/member-loan-history/:memberId` with optional `since`, `limit`, and `offset` query params.
- Reports API route: `GET /api/reports/book-loan-history/:bookId` with optional `since`, `limit`, and `offset` query params.
- SQLite access layer using `better-sqlite3` (expects a local DB file).
- Initial database schema defined in `backend/sql/schema.sql`.
- Backend API usage documented in `backend/README.md`.
- Integration tests for list-query middleware and report endpoints under `backend/tests/`.

## Schema Decisions
- Core tables: `authors`, `books`, `members`, `loans`.
- `books.status` supports: `available`, `checked_out`, `lost`.
- Foreign keys are enforced (SQLite pragma set in code).

## Assumptions
- SQLite is the first persistence target for local development.
- Migrations will be executed manually after automation completes.

## Next Recommended Step
Add integration tests for core CRUD error scenarios (not found, conflict states, and delete guards) to broaden coverage.
