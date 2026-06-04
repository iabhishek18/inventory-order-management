# Deployment Guide

This guide covers deploying the **Inventory & Order Management System** to free-tier cloud providers, plus publishing the backend image to Docker Hub.

The application is split into three components:

| Component | Recommended Provider | Alternative |
|---|---|---|
| Backend (FastAPI + Postgres) | Render | Fly.io / Railway |
| Frontend (React + Vite) | Vercel | Netlify |
| Postgres database | Render managed Postgres | Fly Postgres / Neon / Supabase |

---

## 1. Backend on Render (recommended)

Render supports Docker-based services with free Postgres and one-click `render.yaml` provisioning.

### 1.1 Prerequisites

- GitHub repo pushed (see "Push to GitHub" below).
- Render account (free): https://render.com.

### 1.2 Deploy via Blueprint

1. In Render dashboard click **New +** → **Blueprint**.
2. Connect this GitHub repo.
3. Render auto-detects `deploy/render.yaml` and provisions:
   - `ioms-postgres` (free Postgres database).
   - `ioms-backend` web service (Docker, built from `backend/Dockerfile`).
4. After provisioning, set the **`BACKEND_CORS_ORIGINS`** env var on the `ioms-backend` service to your frontend URL once Vercel/Netlify is deployed (e.g. `https://ioms.vercel.app`). Multiple origins are comma-separated.
5. Trigger a manual deploy. Render runs `alembic upgrade head` automatically via the container `entrypoint.sh`.
6. After the first successful deploy, optional one-time seed:
   - In the service dashboard set `RUN_SEED=true`.
   - Trigger a redeploy.
   - **Immediately set `RUN_SEED=false`** to prevent re-seeding on future deploys.
7. Backend URL will be `https://ioms-backend.onrender.com` (replace with the URL Render assigns).
8. Health check: `GET https://ioms-backend.onrender.com/health` should return `{"status":"ok"}`.

### 1.3 Manual Render setup (no Blueprint)

1. **Create database**: New + → PostgreSQL → free plan → name `ioms-postgres`. Copy the internal connection string.
2. **Create web service**: New + → Web Service → Docker → connect repo → root directory `backend`.
3. Set env vars (see `.env.example`). `DATABASE_URL` should use the **internal** Postgres connection string from step 1, replacing the `postgresql://` prefix with `postgresql+psycopg2://`.
4. Deploy.

---

## 2. Backend on Fly.io (alternative)

1. Install `flyctl`: https://fly.io/docs/hands-on/install-flyctl/
2. `fly auth login`
3. From repo root:
   ```bash
   fly launch --copy-config --config deploy/fly.toml --no-deploy
   ```
4. Provision Postgres:
   ```bash
   fly postgres create --name ioms-pg --region iad --vm-size shared-cpu-1x --volume-size 1
   fly postgres attach ioms-pg --app ioms-backend
   ```
   This sets `DATABASE_URL` automatically on the backend app (but uses the `postgres://` scheme — see note below).
5. Set additional secrets:
   ```bash
   fly secrets set \
     JWT_SECRET_KEY="$(openssl rand -hex 32)" \
     BACKEND_CORS_ORIGINS="https://ioms.vercel.app" \
     --app ioms-backend
   ```
6. **Note on Postgres URL scheme**: SQLAlchemy needs `postgresql+psycopg2://`. If Fly sets `DATABASE_URL=postgres://...`, override it:
   ```bash
   fly secrets set DATABASE_URL="postgresql+psycopg2://<rest>" --app ioms-backend
   ```
7. Deploy:
   ```bash
   fly deploy --config deploy/fly.toml
   ```
8. Backend URL: `https://ioms-backend.fly.dev`

---

## 3. Frontend on Vercel (recommended)

1. Create Vercel account: https://vercel.com
2. **Add New Project** → import this GitHub repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
4. **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://ioms-backend.onrender.com/api/v1` (your backend URL + `/api/v1`)
5. Deploy.
6. Frontend URL: `https://ioms.vercel.app` (or whatever Vercel assigns).
7. **Back-fill CORS**: copy the frontend URL into the backend's `BACKEND_CORS_ORIGINS` env var on Render/Fly and redeploy the backend.

The `deploy/vercel.json` adds SPA fallback rewrites and security headers — copy it to repo root or set "Root Directory = `frontend`" with the config kept in `deploy/`.

---

## 4. Frontend on Netlify (alternative)

1. Create Netlify account: https://netlify.com
2. **Add new site** → import from Git → choose this repo.
3. The `deploy/netlify.toml` configures base directory, build command, publish path, and SPA rewrites. Copy it to repo root, or set **Base directory: `frontend`** and **Publish directory: `frontend/dist`** in the UI.
4. Set env var `VITE_API_BASE_URL=https://<your-backend-url>/api/v1`.
5. Deploy.

---

## 5. Publish backend image to Docker Hub

1. Create a Docker Hub account: https://hub.docker.com
2. Log in locally:
   ```bash
   docker login
   ```
3. Build the backend image for `linux/amd64` (most cloud hosts):
   ```bash
   docker buildx build \
     --platform linux/amd64 \
     -t <your-dockerhub-user>/ioms-backend:1.0.0 \
     -t <your-dockerhub-user>/ioms-backend:latest \
     --push \
     ./backend
   ```
4. Public URL: `https://hub.docker.com/r/<your-dockerhub-user>/ioms-backend`
5. To pull and run anywhere:
   ```bash
   docker run --rm -p 8000:8000 \
     -e DATABASE_URL="postgresql+psycopg2://..." \
     -e JWT_SECRET_KEY="..." \
     -e BACKEND_CORS_ORIGINS="https://ioms.vercel.app" \
     <your-dockerhub-user>/ioms-backend:latest
   ```

---

## 6. Push the source to GitHub

The repository is already configured for `gh` CLI:

```bash
cd /path/to/inventory-order-management
git init
git add .
git commit -m "Initial commit: Inventory & Order Management System"
gh repo create inventory-order-management --public --source=. --push
```

If `gh` is not installed, create the repo manually on github.com, then:

```bash
git remote add origin https://github.com/<your-user>/inventory-order-management.git
git branch -M main
git push -u origin main
```

---

## 7. Post-deployment checklist

- [ ] Backend `/health` returns 200 OK.
- [ ] Frontend loads, login redirects to `/login`.
- [ ] `POST /api/v1/auth/register` accepts a new user.
- [ ] CORS allows the deployed frontend origin.
- [ ] Postgres data persists across backend redeploys (named volume / managed DB).
- [ ] `BACKEND_CORS_ORIGINS` includes the production frontend URL.
- [ ] `JWT_SECRET_KEY` is a strong random value (not the `.env.example` default).
- [ ] `RUN_SEED` is `false` after initial seed.

---

## 8. Required submission URLs

After successful deployment you should have four URLs:

| Item | Example |
|---|---|
| GitHub repository | `https://github.com/<user>/inventory-order-management` |
| Docker Hub backend image | `https://hub.docker.com/r/<user>/ioms-backend` |
| Live backend API | `https://ioms-backend.onrender.com/api/v1` |
| Live frontend | `https://ioms.vercel.app` |

Document them in the repo `README.md` (Live URLs section) before submitting.
