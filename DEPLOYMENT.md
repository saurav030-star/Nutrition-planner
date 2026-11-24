# NutriGraph AI – Production Deployment Guide

This guide covers 3 recommended deployment strategies for **NutriGraph AI**:
1. **[Recommended] Vercel (Frontend) + Render (Backend & PostgreSQL)** — Zero cost, fastest setup
2. **Render Blueprint (All-in-One)** — 1-click single platform setup
3. **Docker Compose (VPS / Cloud Server)** — Self-hosted on AWS EC2, DigitalOcean, Hetzner, etc.

---

## Strategy 1: Vercel (Frontend) + Render (Backend & Database) 🌟

### Step 1: Deploy Backend on Render
1. Sign up or log into [Render.com](https://render.com).
2. Click **New +** > **PostgreSQL**:
   * Name: `nutrigraph-db`
   * Plan: **Free**
   * Click **Create Database**.
   * Once created, copy the **Internal Database URL** (or External Database URL).
3. Click **New +** > **Web Service**:
   * Connect your GitHub repository (`Nutrition-planner`).
   * **Root Directory**: `backend`
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   * **Plan**: **Free**
4. Under **Environment Variables**, add:
   * `DATABASE_URL`: *(paste the PostgreSQL connection string from step 2)*
   * `SECRET_KEY`: *(paste any secure 32+ character random string)*
5. Click **Deploy Web Service**.
6. When deployment finishes, copy your backend URL (e.g. `https://nutrigraph-backend.onrender.com`). Verify by visiting `https://nutrigraph-backend.onrender.com/health` in your browser.

### Step 2: Deploy Frontend on Vercel
1. Log into [Vercel.com](https://vercel.com).
2. Click **Add New...** > **Project** and select your GitHub repository.
3. Configure project settings:
   * **Root Directory**: Click `Edit` and select `frontend`.
   * **Framework Preset**: `Next.js` (detected automatically).
4. Under **Environment Variables**, add:
   * Name: `NEXT_PUBLIC_API_URL`
   * Value: `https://nutrigraph-backend.onrender.com/api` *(make sure to include `/api`)*
5. Click **Deploy**.
6. Your application is live at `https://your-project.vercel.app`!

---

## Strategy 2: 1-Click Render Blueprint

We have included a `render.yaml` configuration in the repository root.

1. Push your repository to GitHub.
2. In Render, click **New +** > **Blueprint**.
3. Select your `Nutrition-planner` repository.
4. Render will read `render.yaml` and automatically configure:
   * `nutrigraph-db` (PostgreSQL Database)
   * `nutrigraph-backend` (FastAPI Web Service)
   * `nutrigraph-frontend` (Next.js Web Service)
5. Click **Apply** to deploy all services together.

---

## Strategy 3: Self-Hosted Docker Compose (VPS / Server)

If you have a Linux VPS (Ubuntu/Debian on AWS, DigitalOcean, Hetzner, etc.):

1. SSH into your VPS:
   ```bash
   ssh user@your-server-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/saurav030-star/Nutrition-planner.git
   cd Nutrition-planner
   ```
3. Run with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Access:
   * Frontend: `http://your-server-ip:3000`
   * Backend API: `http://your-server-ip:8000`
   * API Docs: `http://your-server-ip:8000/api/docs`

---

## Environment Variables Reference

### Backend (`backend/.env.production`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `SECRET_KEY` | Secret key for signing JWT tokens | `e83f...a29` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | (Optional) OpenAI API Key | `sk-...` |

### Frontend (`frontend/.env.production`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Live backend API URL | `https://api.yourdomain.com/api` |
