# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Seat Genie is a Library & Study Room Management System (图书馆/自习室综合管理系统). It is an npm workspaces monorepo with two packages: `frontend/` (React 19 + Vite + TypeScript) and `backend/` (Express + SQLite via better-sqlite3 + TypeScript). Both packages are fully TypeScript — no `.js`/`.jsx` source files remain under `src/`. See `README.md` for full feature list and API docs.

### Running services

- **Backend**: `cd backend && npm run dev` — starts Express on port 3001 via `nodemon --exec tsx src/index.ts` (auto-restart on changes). SQLite DB at `backend/data/library.db` is auto-created and seeded on first API request that touches the DB (lazy init — `/health` alone does NOT trigger DB creation).
- **Frontend**: `cd frontend && npx vite --host 0.0.0.0` — starts Vite dev server on port 5173.
- **Both at once**: `npm run dev` from root (uses `concurrently`).

### Key caveats

- **DB lazy initialization**: The database schema + seed data are only applied when the first DB-touching endpoint is called (not on server start). After starting the backend, issue any API call (e.g., `curl http://localhost:3001/api/users/login -H 'Content-Type: application/json' -d '{"username":"x","password":"x"}'`) to trigger initialization before doing direct DB operations.
- **Password policy**: User creation requires passwords with 12+ chars, uppercase, lowercase, number, and special character (e.g., `TempPass123!`).
- **Backend `.env` setup**: Copy `backend/.env.example` to `backend/.env` before starting. The defaults work correctly out of the box.
- **Stale committed DB**: The `backend/data/library.db` checked into git may contain password hashes that do NOT match the seed passwords (`TempPass123!`). If login fails with demo accounts, delete the DB file (`rm backend/data/library.db`) and restart the backend — the DB will be re-created from `sql/schema.sql` + `sql/seed.sql` on the next DB-touching request.

### Standard commands

| Task | Command |
|---|---|
| Install deps | `npm install` (from repo root; handles workspaces) |
| Backend tests | `npm run test:backend` (Jest, 191 tests) |
| Frontend tests | `cd frontend && npx vitest run` (49 tests) |
| Frontend lint | `cd frontend && npx eslint .` (0 errors, warnings only) |
| Frontend build | `npm run build:frontend` |
| Dev (both) | `npm run dev` |

### Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `TempPass123!` |
| Staff | `staff1` | `TempPass123!` |
| Student | `student1` | `TempPass123!` |
