# Deployment Guide

## Backend (Render)
- Create new Web Service from Git repo
- Build: `npm i && npm run -w backend build`
- Start: `npm run -w backend start`
- Add environment variables

## Admin (Vercel)
- Import project, set root to `admin-dashboard`
- Install, build, and deploy automatically

## Mobile (Expo)
- Configure `app.json` with backend URL
- `npx expo prebuild` (optional), `npx expo build`

## Database (Supabase)
- Create project, enable PostGIS
- Set `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
