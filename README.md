# Seat Genie

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite 7">
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white" alt="Express 4">
  <img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" alt="SQLite 3">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white" alt="Node.js">
</p>

<p align="center">
  <b>Library & Study Room Management System</b><br>
  <sub>图书馆 / 自习室综合管理系统</sub>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [API Reference](#api-reference)
- [Permissions](#permissions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Overview

**Seat Genie** is a full-stack library and study room management system with seat reservation, book lending, user management, notifications, and analytics — all in one unified workflow.

### Features

| Category | Capabilities |
|----------|--------------|
| **Seat Reservation** | Time-slot booking, conflict detection, grid-based seat map |
| **Book Management** | Lending, returns, overdue tracking, ISBN, batch Excel import |
| **Access Control** | Admin, Staff, Student roles with RBAC |
| **Multi-Campus** | Campus and room hierarchy for multi-site deployments |
| **Analytics** | Recharts dashboards, usage reports, trends |
| **Notifications** | Announcements, read tracking, optional email/SMTP |
| **Data Export** | Excel export for books, users, reservations, loans |
| **PWA** | Installable, offline-capable web app |

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Clone and install
git clone <repository-url>
cd seat-genie
npm install

# Configure backend (optional; defaults work for dev)
cp backend/.env.example backend/.env

# Start frontend + backend
npm run dev
```

- **Frontend**: http://localhost:5173  
- **Backend API**: http://localhost:3001  

### First Run

The SQLite database is created lazily on the first DB-touching API call. Trigger it with:

```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"TempPass123!"}'
```

### Commands

| Task | Command |
|------|---------|
| Install | `npm install` |
| Dev (both) | `npm run dev` |
| Backend tests | `npm run test:backend` |
| Frontend tests | `cd frontend && npx vitest run` |
| Frontend build | `npm run build:frontend` |
| Frontend lint | `cd frontend && npx eslint .` |

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails with demo accounts | Delete `backend/data/library.db` and restart backend |
| DB not created | Call any API that uses DB (e.g. login); `/health` does not trigger init |
| Password policy | New users need 12+ chars, upper, lower, number, special (e.g. `TempPass123!`) |
| Email notifications | Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` in `backend/.env` |

---

## Demo Accounts

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `TempPass123!` |
| Staff | `staff1` | `TempPass123!` |
| Student | `student1` | `TempPass123!` |

---

## Project Structure

```
seat-genie/
├── frontend/          # React 19 + Vite + TypeScript
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── stores/
│       └── ...
├── backend/           # Express + SQLite + TypeScript
│   ├── src/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── services/
│   ├── sql/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── data/          # library.db (auto-created)
├── package.json       # Workspaces root
└── AGENTS.md          # Dev environment notes
```

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 19, React Router 7, Vite 7, Zustand, Recharts |
| **Backend** | Express 4, better-sqlite3, JWT, bcryptjs, Zod, Helmet, Pino |
| **Database** | SQLite 3 (`backend/data/library.db`) |

---

## API Reference

- **Base URL**: `http://localhost:3001`
- **Auth**: JWT Bearer (`Authorization: Bearer <token>`)
- **Format**: JSON, UTF-8

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/users/login` | Login (returns JWT) |
| GET/POST | `/api/users` | List / create users |
| GET/PUT/DELETE | `/api/users/:id` | User CRUD |
| GET/POST | `/api/campuses` | Campus list / create |
| GET/PUT/DELETE | `/api/campuses/:id` | Campus CRUD |
| GET/POST | `/api/rooms` | Room list / create |
| GET/PUT/DELETE | `/api/rooms/:id` | Room CRUD |
| GET/POST | `/api/seats` | Seat list / create |
| PUT/DELETE | `/api/seats/:id` | Seat update / delete |
| GET/POST | `/api/reservations` | Reservations |
| POST | `/api/reservations/:id/cancel` | Cancel reservation |
| GET/POST | `/api/books` | Books |
| GET/POST | `/api/loans` | Loans |
| POST | `/api/loans/:id/return` | Return book |
| GET/POST | `/api/notifications` | Notifications |
| POST | `/api/notifications/:id/read` | Mark read |
| GET | `/api/reports/*` | Reports (seat-usage, book-circulation, overdue-loans, etc.) |
| GET | `/api/export/books` | Export books (Excel) |
| GET | `/api/export/users` | Export users |
| GET | `/api/export/reservations` | Export reservations |
| GET | `/api/export/loans` | Export loans |
| POST | `/api/export/books/import` | Import books (Excel) |
| POST | `/api/scheduler/run` | Run scheduler (admin) |

### Query Params (list endpoints)

| Param | Type | Default |
|-------|------|---------|
| `limit` | number | 25 |
| `offset` | number | 0 |
| `sortBy` | string | id |
| `sortOrder` | asc/desc | asc |
| `q` | string | - |

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": { "total": 100, "limit": 25, "offset": 0 }
}
```

---

## Permissions

| Module | Admin | Staff | Student |
|--------|-------|-------|---------|
| Users, Campuses | Full | — | — |
| Rooms, Seats | Full | Full | Read + reserve |
| Books, Loans | Full | Full | Read own |
| Reservations | — | — | Full |
| Reports, Export | Full | Full | — |
| Notifications | Publish | Publish | Read |

---

## Testing

```bash
# Backend (Jest, ~191 tests)
npm run test:backend

# Frontend (Vitest, ~49 tests)
cd frontend && npx vitest run
```

---

## Deployment

### Production Build

```bash
npm run build:frontend
cd backend && NODE_ENV=production npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DATABASE_FILE` | SQLite path (relative to backend) | data/library.db |
| `LOG_LEVEL` | Log level | info |
| `JWT_SECRET` | JWT secret (required in prod) | - |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Email (optional) | - |

---

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b feature/your-feature`)
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/)
4. Push and open a Pull Request

**Issue prefixes**: `[Bug]` for bugs, `[Feature]` for feature requests.

---

## License

This project is for **learning and demonstration** purposes. For commercial use, please review and comply with applicable requirements.

---

<p align="center">
  <sub>Last updated: 2026-03-04</sub>
</p>
