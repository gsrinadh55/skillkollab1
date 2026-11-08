# SkillKollab Production Deployment Guide (Vercel & Railway)

This guide walks you through deploying **SkillKollab** using:
- **Railway** for the persistent Express + Socket.IO Backend and PostgreSQL Database
- **Vercel** for the high-performance Vite + React Frontend

---

## Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        Vercel (Frontend)        │           │        Railway (Backend)        │
│  React 19 + Vite 6 + Tailwind   │           │    Express 5 + Socket.IO Server  │
│  https://your-app.vercel.app    ├──────────►│ https://backend.up.railway.app  │
└────────────────┬────────────────┘  HTTP/WS  └────────────────┬────────────────┘
                 │                                             │
                 │ Auth & Storage                              │ Prisma ORM
                 ▼                                             ▼
       ┌───────────────────┐                         ┌───────────────────┐
       │ Firebase / Auth0  │                         │ PostgreSQL (Host) │
       └───────────────────┘                         └───────────────────┘
```

---

## Pre-Deployment Checklist (Already Prepared)

1. **Frontend SPA Routing**: Added `frontend/vercel.json` with route rewrites to prevent 404 errors on browser page reloads.
2. **Backend Prisma Build**: Added `"build": "prisma generate"` to `backend/package.json` so Railway automatically compiles the Prisma client on deploy.
3. **Environment Templates**: Created `frontend/.env.example` and updated `backend/.env.example`.

---

## Part 1: Deploy Backend & PostgreSQL on Railway

> **Why Railway?** Socket.IO real-time chat and workspace collaboration require a persistent server with WebSocket connections. Railway keeps your Node.js process alive and provides managed PostgreSQL in the same region.

### Step 1: Create a Railway Account & New Project
1. Go to [railway.app](https://railway.app) and sign in with GitHub.
2. Click **+ New Project**.

### Step 2: Add PostgreSQL Database
1. In your new project dashboard, click **+ Create** or **Add Service** -> choose **Database** -> **Add PostgreSQL**.
2. Railway instantly spins up a PostgreSQL database and automatically generates the `DATABASE_URL` environment variable.

### Step 3: Deploy the Backend Service
1. Click **+ Create** -> **GitHub Repo** -> select your `SkillKollab` repository.
2. Click on the newly created service tile and open its **Settings** tab:
   - **Root Directory**: Set to `/backend`
   - **Build Command**: `npm install && npm run build` (or leave default, as Railway detects `package.json`)
   - **Start Command**: `npm start` (runs `node src/server.js`)
3. Open the **Networking** tab:
   - Under **Public Networking**, click **Generate Domain**.
   - Note down this URL (e.g. `https://skillkollab-production.up.railway.app`).

### Step 4: Configure Backend Environment Variables
In your backend service, click on the **Variables** tab and add:

| Key | Value / Source |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `4000` (or leave default, Railway binds automatically) |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Select from Railway database) |
| `JWT_SECRET` | Generate a random 32+ character secret string |
| `CLIENT_ORIGIN` | `https://your-frontend.vercel.app` *(update after Part 2)* |
| `CORS_ORIGINS` | `https://your-frontend.vercel.app` *(update after Part 2)* |
| `GEMINI_API_KEY` | *(Optional)* Your Google Gemini API Key |
| `OPENAI_API_KEY` | *(Optional)* Your OpenAI API Key |

### Step 5: Run Database Migrations
In the Railway backend service, go to the **Settings** or click the **Deploy** menu / Railway CLI and run:
```bash
npx prisma db push
```
Or open the Railway PostgreSQL service and execute `backend/prisma/schema.prisma` migrations.

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Import Project in Vercel
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `SkillKollab` repository.

### Step 2: Configure Project Settings
In the Vercel deployment setup screen:
1. **Framework Preset**: Select `Vite` (usually auto-detected).
2. **Root Directory**: Click **Edit** and choose `frontend`.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Add Environment Variables
Under the **Environment Variables** section, copy the values from your `frontend/.env` file:

| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://your-railway-backend-url.up.railway.app/api` |
| `VITE_SOCKET_URL` | `https://your-railway-backend-url.up.railway.app` |
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET`| Your Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `VITE_SUPABASE_URL` | *(If using Supabase)* Your Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | *(If using Supabase)* Your Supabase Anon Key |

### Step 4: Deploy
Click **Deploy**. Vercel will install dependencies, build Vite, and issue an SSL HTTPS domain (e.g., `https://skillkollab.vercel.app`).

---

## Part 3: Final Link & Verification

1. **Update Backend CORS on Railway**:
   - Copy your newly generated Vercel domain (e.g. `https://skillkollab.vercel.app`).
   - Go to your Railway backend service -> **Variables**.
   - Set `CLIENT_ORIGIN` = `https://skillkollab.vercel.app`
   - Set `CORS_ORIGINS` = `https://skillkollab.vercel.app`
   - Railway will automatically redeploy with the updated CORS permissions.

2. **Verify Live Health Check**:
   - Open your browser to `https://your-railway-backend-url.up.railway.app/api/health`
   - You should see:
     ```json
     {
       "status": "ok",
       "environment": "production"
     }
     ```

3. **Verify Frontend**:
   - Open your Vercel URL.
   - Test login / registration, real-time Socket.IO chat, project creation, and route navigation.

