# Backend Progress (Seat Genie)

## Current Stage
Initial backend foundation created for the library management system.

## Latest Update (2026-02-06)
- Added shared list-query validation middleware so list endpoints parse and validate query params consistently with less route boilerplate.
- Updated list routes (books/authors/members/loans) to use the new middleware.
- Documented consistent list query examples in `backend/README.md`.
- Merge note: `dev` is checked out in another worktree, so merge into `dev` could not be completed in this run; the `ai/list-query-middleware` branch is preserved for manual merge.

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

## Schema Decisions
- Core tables: `authors`, `books`, `members`, `loans`.
- `books.status` supports: `available`, `checked_out`, `lost`.
- Foreign keys are enforced (SQLite pragma set in code).

## Assumptions
- SQLite is the first persistence target for local development.
- Migrations will be executed manually after automation completes.

## Next Recommended Step
Add basic integration tests (Supertest) for list endpoints and validation errors to guard the shared list-query middleware behavior.
