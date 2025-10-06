# 🚀 Aapatt Deployment Guide

Complete deployment instructions for production environment using free-tier services.

## 📋 Deployment Checklist

- [ ] Set up Supabase database
- [ ] Configure Firebase authentication
- [ ] Deploy backend to Render
- [ ] Deploy admin dashboard to Vercel
- [ ] Build and distribute mobile apps
- [ ] Configure environment variables
- [ ] Set up monitoring
- [ ] Test production environment

---

## 🗄️ Database Deployment (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in details:
   - Name: `aapatt-production`
   - Database Password: (generate strong password)
   - Region: Choose closest to users

### 2. Enable PostGIS

```sql
-- Run in SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
```

### 3. Run Migrations

```bash
# Copy production database URL from Supabase
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

cd backend
npx prisma migrate deploy
```

### 4. Configure Backups

- Supabase automatically backs up daily (free tier: 7 days retention)
- For custom backups: Settings → Database → Scheduled Backups

---

## 🔧 Backend Deployment (Render)

### 1. Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2. Deploy Backend

1. Click "New +" → "Web Service"
2. Connect GitHub repository
3. Configure:
   - **Name**: `aapatt-api`
   - **Environment**: `Node`
   - **Region**: Choose closest to database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

### 3. Set Environment Variables

Add in Render dashboard:

```env
DATABASE_URL=<supabase-connection-string>
FIREBASE_PROJECT_ID=<your-firebase-project>
FIREBASE_PRIVATE_KEY=<your-private-key>
FIREBASE_CLIENT_EMAIL=<firebase-email>
HUGGING_FACE_API_KEY=<your-hf-key>
JWT_SECRET=<generate-secure-random-string>
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://admin.aapatt.com,https://aapatt.com
```

### 4. Deploy

- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Note your API URL: `https://aapatt-api.onrender.com`

### 5. Configure Free Tier

⚠️ **Important**: Render free tier sleeps after 15 minutes of inactivity

**Solutions:**
1. Use [UptimeRobot](https://uptimerobot.com) to ping every 14 minutes
2. Implement wake-up logic in mobile apps
3. Upgrade to paid tier for production ($7/month)

---

## 💻 Admin Dashboard Deployment (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Configure for Production

Edit `admin-dashboard/.env.production`:

```env
VITE_API_URL=https://aapatt-api.onrender.com/api
```

### 3. Deploy

```bash
cd admin-dashboard
vercel --prod
```

### 4. Configure Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add custom domain: `admin.aapatt.com`
3. Update DNS records as instructed

---

## 📱 Mobile App Distribution

### Option A: Expo Go (Development/Testing)

**Pros**: Quick testing, no build needed  
**Cons**: Not production-ready, requires Expo Go app

```bash
cd citizen-app
expo publish
```

Share link: `exp://exp.host/@yourname/citizen-app`

### Option B: Expo Application Services (Production)

#### 1. Create Expo Account

```bash
expo login
```

#### 2. Configure EAS

```bash
npm install -g eas-cli
eas login
```

#### 3. Build for Android

```bash
cd citizen-app
eas build --platform android --profile production

# Wait for build (20-30 minutes)
# Download .apk file
```

#### 4. Build for iOS

```bash
eas build --platform ios --profile production

# Requires Apple Developer account ($99/year)
```

#### 5. Distribute

**Android:**
- Upload to Google Play Console
- Internal testing → Beta → Production
- Review time: 1-3 days

**iOS:**
- Upload to App Store Connect
- TestFlight → App Store
- Review time: 1-3 days

### Option C: Self-hosted (Free)

**Android APK:**
```bash
cd citizen-app
expo build:android -t apk
```

Distribute APK directly:
- Host on your website
- Share via email/WhatsApp
- Users must enable "Install from Unknown Sources"

---

## 🔐 Security Checklist

### Before Production:

- [ ] Change all default passwords
- [ ] Rotate JWT secret
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] Remove console.logs
- [ ] Enable error logging
- [ ] Set up monitoring

### Environment Variables:

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Use strong database password
# Never commit .env files
# Use environment-specific configs
```

---

## 📊 Monitoring Setup

### 1. UptimeRobot (Free Monitoring)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://aapatt-api.onrender.com/health`
   - Interval: 5 minutes

### 2. Error Tracking (Optional)

**Sentry (Free tier: 5k errors/month):**

```bash
npm install @sentry/node @sentry/react

# Configure in backend/src/index.js and mobile apps
```

### 3. Analytics (Optional)

**Google Analytics:**
- Add to admin dashboard
- Track user behavior
- Monitor performance

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        run: curl https://api.render.com/deploy/...
        
  deploy-dashboard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 💰 Cost Breakdown (Free Tier)

| Service | Free Tier | Upgrade Cost |
|---------|-----------|--------------|
| Supabase | 500MB DB, 2GB storage | $25/month (8GB) |
| Render | 750 hours/month | $7/month (no sleep) |
| Vercel | Unlimited sites | $20/month (teams) |
| Expo | Free builds | $29/month (priority) |
| Firebase Auth | 10k/month | Pay as you go |
| Hugging Face | 30 req/min | $9/month (Pro) |
| **Total** | **$0/month** | **~$90/month** |

---

## 🧪 Post-Deployment Testing

### 1. API Health Check

```bash
curl https://aapatt-api.onrender.com/health
```

### 2. Test Authentication

```bash
curl -X POST https://aapatt-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### 3. Test Real-time Connection

Use Socket.IO client tester or Postman

### 4. Mobile App Testing

1. Install on test devices
2. Create test emergency request
3. Accept from provider app
4. Monitor in admin dashboard
5. Test all features end-to-end

---

## 🔄 Updates & Maintenance

### Rolling Updates

```bash
# Backend (automatic on Render with GitHub push)
git push origin main

# Admin Dashboard
cd admin-dashboard
vercel --prod

# Mobile Apps
cd citizen-app
eas build --platform all --profile production
```

### Database Migrations

```bash
# Test locally first
npx prisma migrate dev

# Deploy to production
DATABASE_URL=<production-url> npx prisma migrate deploy
```

---

## 🆘 Rollback Procedure

### Backend (Render)

1. Go to Render dashboard
2. Select service
3. Deploys → Select previous version
4. Click "Redeploy"

### Database

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>
```

### Mobile Apps

1. Remove from app stores temporarily
2. Upload previous version
3. Notify users to update

---

## 📞 Support

For deployment issues:
- Check [Render Status](https://status.render.com)
- Check [Vercel Status](https://www.vercel-status.com)
- Contact: support@aapatt.com

---

## ✅ Go Live Checklist

- [ ] All services deployed
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Mobile apps in stores
- [ ] Monitoring configured
- [ ] Backup strategy in place
- [ ] Documentation updated
- [ ] Team trained
- [ ] Marketing materials ready
- [ ] Support channels set up

---

**🎉 Congratulations! Your Aapatt instance is now live!**
