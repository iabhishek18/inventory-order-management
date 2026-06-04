# Inventory & Order Management System (IOMS)

A production-grade, full-stack inventory and order management application built to demonstrate clean architecture, type-safety end-to-end, and ship-ready DevOps.

| | |
|---|---|
| **Backend** | FastAPI (Python 3.12) + SQLAlchemy 2 + Alembic + JWT auth |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind + shadcn/ui + React Query + React Hook Form + Zod |
| **Database** | PostgreSQL 16 (with named-volume persistence) |
| **Infrastructure** | Docker (multi-stage, non-root) + Docker Compose + GitHub Actions CI |
| **Tests** | Pytest (23 backend tests) + Vitest + Testing Library (6 frontend tests) |

> **Note on language choice**: The brief specified "React (JavaScript)". This project uses **TypeScript** because (a) the brief also asks for shadcn/ui which is TypeScript-native, and (b) TypeScript compiles to JavaScript and is strictly a superset — it satisfies the spec while adding compile-time type safety appropriate for "production-ready, customer-shippable" work.

---

## Live URLs

Fill in after deployment (see [docs/DEPLOY.md](docs/DEPLOY.md)):

- **GitHub repository**: https://github.com/iabhishek18/inventory-order-management
- **Docker Hub backend image**: `<your-dockerhub-user>/ioms-backend:latest`
- **Backend API**: `https://<your-backend-host>/api/v1`
- **Frontend**: `https://<your-frontend-host>`

---

## Features

### Backend

- **Products CRUD** with unique SKU, non-negative price/quantity (enforced by Pydantic, SQLAlchemy `CHECK` constraints, and Postgres uniqueness).
- **Customers CRUD** with unique email and validated phone.
- **Orders** with multi-item support, server-side total calculation, atomic stock reservation using `SELECT ... FOR UPDATE`, automatic stock decrement on create, automatic stock restoration on cancel.
- **JWT authentication** (HS256, configurable expiry) with bcrypt password hashing.
- **Dashboard summary** endpoint returning totals + low-stock products under a configurable threshold.
- **OpenAPI docs** auto-generated at `/docs` and `/redoc`.
- **Health endpoint** at `/health`.
- **Migrations** via Alembic (initial schema versioned).
- **Seed script** with demo user, products, customers, and order.
- **Domain-correct HTTP codes**: 201 on create, 204 on delete, 409 on uniqueness conflicts and insufficient stock, 422 on validation errors, 404 on missing resources, 401 on auth failures.

### Frontend

- **Login & Registration** with React Hook Form + Zod validation.
- **Protected routes** with auto-redirect to login on 401.
- **Dashboard** showing totals and low-stock table with badge severity.
- **Products** page with search, create, edit, delete dialogs.
- **Customers** page with search, create, delete dialogs.
- **Orders** page with create-order dialog (multi-item), order detail view, server-side total banner, cancel flow.
- **Responsive layout** with mobile drawer navigation.
- **Toast notifications** (sonner) for success/error feedback.
- **Optimistic cache invalidation** via React Query.

### Business rules (server-enforced)

- Product SKU is unique (case-preserved, whitespace-trimmed).
- Customer email is unique (validated by `email-validator`).
- Product quantity may not go negative (`CHECK quantity_in_stock >= 0`).
- Order creation is blocked if any item exceeds available stock (HTTP 409, no partial commits).
- Order total is **always** calculated by the backend; any client-supplied total is ignored.
- Deleting a product or customer with referencing orders is blocked (HTTP 409).
- Cancelling an order restores stock for every item atomically.

---

## Repository layout

```
inventory-order-management/
├── backend/                     # FastAPI service
│   ├── app/
│   │   ├── main.py              # FastAPI app + error handlers + router mount
│   │   ├── config.py            # pydantic-settings
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── core/security.py     # JWT + bcrypt
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── services/            # Business logic (order placement, dashboards, etc.)
│   │   └── routers/             # HTTP route handlers
│   ├── alembic/                 # Migrations
│   ├── scripts/seed.py          # Demo data
│   ├── tests/                   # Pytest suite (23 tests)
│   ├── Dockerfile               # Multi-stage, non-root, healthcheck
│   ├── entrypoint.sh            # Runs migrations + optional seed
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── pyproject.toml           # pytest + ruff + coverage config
│
├── frontend/                    # React + TypeScript SPA
│   ├── src/
│   │   ├── api/                 # Typed API client
│   │   ├── components/          # Layout + shadcn/ui primitives
│   │   ├── hooks/use-auth.tsx   # Auth context
│   │   ├── lib/                 # axios instance, formatters, error helpers
│   │   ├── pages/               # Login, Register, Dashboard, Products, Customers, Orders
│   │   └── tests/               # Vitest tests
│   ├── Dockerfile               # Multi-stage build → nginx:alpine
│   ├── nginx.conf               # SPA fallback + gzip + security headers
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── deploy/
│   ├── render.yaml              # Render Blueprint (Postgres + backend)
│   ├── fly.toml                 # Fly.io app config
│   ├── vercel.json              # Vercel SPA + security headers
│   └── netlify.toml             # Netlify SPA + security headers
│
├── docs/
│   └── DEPLOY.md                # Step-by-step deployment guide
│
├── .github/workflows/ci.yml     # Backend + frontend lint/test/build + docker build
├── docker-compose.yml           # Local stack: db + backend + frontend
├── .env.example                 # Required env vars
├── .gitignore
└── LICENSE                      # MIT
```

---

## Quick start (Docker Compose, recommended)

Prerequisites: Docker 20+ and Docker Compose v2.

```bash
# 1. Copy env file (edit secrets if desired; defaults work for local dev)
cp .env.example .env

# 2. Bring up the full stack
docker compose up --build

# 3. (Optional, one-time) Load demo data
docker compose exec backend python scripts/seed.py
```

Then open:

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/v1 |
| API docs (Swagger) | http://localhost:8000/docs |
| API docs (ReDoc) | http://localhost:8000/redoc |

**Demo credentials after seeding:**

- Email: `admin@ioms.local`
- Password: `Admin12345!`

To tear down:

```bash
docker compose down            # keep data
docker compose down -v         # also delete named volume (resets DB)
```

---

## Local development (without Docker)

### Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

# Point DATABASE_URL at a running Postgres, or use SQLite for quick dev:
export DATABASE_URL="sqlite+pysqlite:///./dev.db"
export JWT_SECRET_KEY="dev-secret"
export BACKEND_CORS_ORIGINS="http://localhost:5173"

alembic upgrade head            # apply migrations
python scripts/seed.py          # optional: load demo data
uvicorn app.main:app --reload   # dev server on :8000
```

### Frontend

```bash
cd frontend
npm install
echo 'VITE_API_BASE_URL=http://localhost:8000/api/v1' > .env.local
npm run dev                     # dev server on :5173
```

---

## Tests

```bash
# Backend (23 tests)
cd backend
pytest                          # all
pytest --cov=app                # with coverage

# Frontend (6 tests)
cd frontend
npm test                        # all
npm run test:coverage           # with coverage
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs all of these on every push/PR:

- `ruff` lint + `pytest` against a real Postgres service container.
- `eslint` + `tsc -b` + `vitest` + `vite build`.
- Docker image builds for backend and frontend (push only).

---

## API reference

All routes are under `/api/v1`. JSON in, JSON out. All non-auth routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create user `{full_name, email, password}` |
| `POST` | `/auth/login` | OAuth2 form-encoded login |
| `POST` | `/auth/login/json` | JSON login `{email, password}` |
| `GET` | `/auth/me` | Current user |

### Products

| Method | Path | Description |
|---|---|---|
| `POST` | `/products` | Create — 201, 409 on duplicate SKU |
| `GET` | `/products` | List |
| `GET` | `/products/{id}` | Detail — 404 if missing |
| `PUT` | `/products/{id}` | Update |
| `DELETE` | `/products/{id}` | Delete — 409 if referenced by orders |

### Customers

| Method | Path | Description |
|---|---|---|
| `POST` | `/customers` | Create — 409 on duplicate email |
| `GET` | `/customers` | List |
| `GET` | `/customers/{id}` | Detail |
| `DELETE` | `/customers/{id}` | Delete — 409 if has orders |

### Orders

| Method | Path | Description |
|---|---|---|
| `POST` | `/orders` | Create. Body: `{customer_id, items: [{product_id, quantity}]}`. Server calculates total. 409 if insufficient stock. |
| `GET` | `/orders` | List with item counts |
| `GET` | `/orders/{id}` | Detail with line items |
| `DELETE` | `/orders/{id}` | Cancel — restores stock |

### Dashboard

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/summary` | `{total_products, total_customers, total_orders, low_stock_threshold, low_stock_products: [...]}` |

Interactive documentation: http://localhost:8000/docs

---

## Configuration

All configuration is via environment variables. See [`.env.example`](.env.example) for the full list.

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy URL | `postgresql+psycopg2://ioms:ioms@db:5432/ioms` |
| `JWT_SECRET_KEY` | HMAC secret for tokens | random 32-byte hex |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_EXPIRE_MINUTES` | Token TTL | `60` |
| `BACKEND_CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173,https://app.example.com` |
| `APP_ENV` | `development` \| `production` \| `test` | |
| `LOW_STOCK_THRESHOLD` | Dashboard low-stock cutoff | `10` |
| `RUN_SEED` | If `true`, run `scripts/seed.py` on container start | `false` |
| `VITE_API_BASE_URL` | Frontend → backend URL (build-time) | `http://localhost:8000/api/v1` |

No credentials are baked into images. The backend Docker image runs as a non-root user.

---

## Architecture notes

- **Atomic stock reservation**: `services.create_order` consolidates duplicate `product_id`s in a single request, then locks every referenced product row with `SELECT ... FOR UPDATE` before validating stock. Total is computed server-side from the locked rows. Any client-supplied `total_amount` is discarded.
- **Cancellation safety**: `services.delete_order` restores stock per-item within the same transaction as the order delete.
- **Migration strategy**: Alembic owns schema. The Docker entrypoint runs `alembic upgrade head` before launching uvicorn — no manual step.
- **Token storage**: Frontend stores the JWT in `localStorage` (key `ioms_access_token`). A global axios interceptor injects the `Authorization` header and clears the token on 401, triggering a redirect to `/login`.
- **State management**: React Query for server state, React Hook Form + Zod for form state, React Context for auth. No Redux — the surface is small enough that Query + Context is the right call.
- **Error contract**: Backend returns `{detail: "..."}` on plain errors and `{detail, errors: [...]}` on validation failures (422). Frontend's `extractApiError` normalizes both shapes.

---

## Deployment

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for end-to-end steps:

- Backend → Render (Blueprint) or Fly.io
- Frontend → Vercel or Netlify
- Image → Docker Hub

---

## License

MIT — see [`LICENSE`](LICENSE).
