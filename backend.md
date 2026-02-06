# Backend Progress (Seat Genie)

## Current Stage
Initial backend foundation created for the library management system.

## Latest Update (2026-02-06)
- Added report query validation helpers for ISO datetime params (with empty-string handling) and unified report limit/offset validation by merging report schemas, keeping `VALIDATION_ERROR` responses consistent.

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
Add query validation for list endpoints (books, authors, members, loans) so invalid sort/pagination parameters return standardized `VALIDATION_ERROR` responses without ad-hoc checks.
