# JOAP Hardware Supplier Management with Accounting

Monorepo full-stack TypeScript app:
- `client/`: React + Vite + Tailwind dashboard
- `server/`: Express + TypeScript + MongoDB + Mongoose

## Run locally
1. `npm install`
2. `npm run install:all`
3. `npm run seed -w server`
4. `npm run dev`

- API: `http://localhost:4000/api`
- UI: `http://localhost:5173`

Seed admin credentials:
- username: `admin`
- password: `admin123`

## Deployment (Railway)
- Set project root to repo root.
- Build command: `npm install && npm run install:all && npm run build`
- Start command: `npm run start`
- Mongo URI is configured in `server/src/config/key_db.ts`.

## Modules
Security, Search, Inventory, Orders, Billing/Payments, Accounting, Reports, Maintenance, Settings, Help, About.
Append-only enforcement for InventoryLog and GeneralLedgerEntry.

## Admin Users / Account Management
- UI route: `/admin/users` (visible and accessible only by `ADMIN`).
- Non-admin users are blocked from route access and redirected with an Unauthorized toast.
- Supports search/filter/pagination, create user, activate/deactivate, change role, and password reset.
- No delete action is provided.

### Admin User API Endpoints
- `GET /api/admin/users?search=&role=&status=&page=&pageSize=`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id/status`
- `PATCH /api/admin/users/:id/role`
- `POST /api/admin/users/:id/reset-password`

All endpoints are ADMIN-only and auditable via SystemLog events:
- `USER_CREATED`
- `USER_STATUS_CHANGED`
- `USER_ROLE_CHANGED`
- `USER_PASSWORD_RESET`
