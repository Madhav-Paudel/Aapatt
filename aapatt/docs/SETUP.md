# Setup

## Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI: `npm i -g expo`
- PostgreSQL 14+ (or Supabase project)
- Firebase project (Auth + FCM)

## Environment
Copy `.env.example` to `.env` in `backend/` and fill values. For apps, use `app.json`/`.env` where applicable.

## Install
```bash
npm install
```

## Develop
Run in separate terminals:
```bash
npm run dev:backend
npm run dev:admin
npm run dev:citizen
npm run dev:provider
```

## Database
If using Supabase, set `DATABASE_URL` accordingly and ensure PostGIS is enabled.

## Deploy
- Backend: Render free tier
- Admin: Vercel
- Mobile: Expo build
