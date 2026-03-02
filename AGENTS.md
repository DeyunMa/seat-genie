# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Seat Genie is a Library & Study Room Management System (图书馆/自习室综合管理系统). It is an npm workspaces monorepo with two packages: `frontend/` (React 19 + Vite) and `backend/` (Express + SQLite via better-sqlite3). See `README.md` for full feature list and API docs.

### Running services

- **Backend**: `cd backend && npm run dev` — starts Express on port 3001 with nodemon auto-restart. SQLite DB at `backend/data/library.db` is auto-created and seeded on first API request that touches the DB (lazy init — `/health` alone does NOT trigger DB creation).
- **Frontend**: `cd frontend && npx vite --host 0.0.0.0` — starts Vite dev server on port 5173.
- **Both at once**: `npm run dev` from root (uses `concurrently`).

### Key caveats

- **`.env.example` has wrong DB path**: The file says `DATABASE_FILE=backend/data/library.db` but since the config resolves this relative to the `backend/` directory, the correct value is `DATABASE_FILE=data/library.db`. When creating `backend/.env` from `.env.example`, fix this path.
- **Seed password hashes are invalid**: The `backend/sql/seed.sql` comments claim password `TempPass123!` but the bcrypt hashes in the SQL do not match. After the DB auto-seeds, update passwords manually:
  ```bash
  cd backend && node -e "
  const bcrypt = require('bcryptjs');
  const Database = require('better-sqlite3');
  const db = new Database('data/library.db');
  const hash = bcrypt.hashSync('TempPass123!', 10);
  db.prepare('UPDATE users SET password = ? WHERE username IN (?, ?, ?)').run(hash, 'admin', 'staff1', 'student1');
  db.close();
  "
  ```
- **DB lazy initialization**: The database schema + seed data are only applied when the first DB-touching endpoint is called (not on server start). After starting the backend, issue any API call (e.g., `curl http://localhost:3001/api/users/login -H 'Content-Type: application/json' -d '{"username":"x","password":"x"}'`) to trigger initialization before doing direct DB operations.
- **Password policy**: User creation requires passwords with 12+ chars, uppercase, lowercase, number, and special character (e.g., `TempPass123!`).

### Standard commands

| Task | Command |
|---|---|
| Install deps | `npm install` (from repo root; handles workspaces) |
| Backend tests | `npm run test:backend` (Jest, 128 tests) |
| Frontend tests | `cd frontend && npx vitest run` (18 tests) |
| Frontend lint | `cd frontend && npx eslint .` (0 errors, warnings only) |
| Frontend build | `npm run build:frontend` |
| Dev (both) | `npm run dev` |

### Demo accounts (after fixing seed passwords)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `TempPass123!` |
| Staff | `staff1` | `TempPass123!` |
| Student | `student1` | `TempPass123!` |
