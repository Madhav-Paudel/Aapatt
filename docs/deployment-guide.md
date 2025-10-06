# Deployment Guide - Free Tier

This guide shows how to deploy the Aapatt on completely free services and platforms.

## 🌐 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │     Render      │    │   Supabase      │
│                 │    │                 │    │                 │
│ Admin Dashboard │────│ Backend API     │────│ PostgreSQL DB   │
│ (Next.js/React) │    │ (Node.js)       │    │ + Realtime      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│   Firebase      │──────────────┘
                        │                 │
                        │ Auth + FCM      │
                        │ Storage         │
                        └─────────────────┘
```

## 📋 Prerequisites

### Required Accounts (All Free)
1. **GitHub** - Code hosting and CI/CD
2. **Supabase** - Database and real-time features
3. **Render** - Backend hosting  
4. **Vercel** - Frontend hosting
5. **Firebase** - Authentication and notifications
6. **Hugging Face** - AI models

### Required Tools
- Node.js 18+
- Git
- VS Code (optional)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
```bash
# 1. Go to https://supabase.com
# 2. Sign up with GitHub
# 3. Create new project
# 4. Copy connection details
```

### 2. Configure Database
```sql
-- Enable PostGIS extension for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable realtime for live updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE providers;
ALTER PUBLICATION supabase_realtime ADD TABLE location_updates;
```

### 3. Environment Variables
```bash
# Copy from Supabase dashboard
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔥 Firebase Setup

### 1. Create Firebase Project
```bash
# 1. Go to https://console.firebase.google.com
# 2. Create new project
# 3. Enable Authentication (Phone)
# 4. Enable Cloud Messaging (FCM)
# 5. Generate service account key
```

### 2. Configure Authentication
```javascript
// Enable Phone Sign-in method
// Set up reCAPTCHA for web
// Configure test phone numbers (optional)
```

### 3. Environment Variables
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

## 🤖 AI Setup (Hugging Face)

### 1. Create Account
```bash
# 1. Go to https://huggingface.co
# 2. Sign up for free account
# 3. Generate API token
```

### 2. Environment Variables
```bash
HUGGING_FACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxxxxxx
HUGGING_FACE_MODEL_URL=https://api-inference.huggingface.co/models/google/vit-base-patch16-224
```

## 🚀 Backend Deployment (Render)

### 1. Prepare Repository
```bash
# Push code to GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Render
```bash
# 1. Go to https://render.com
# 2. Connect GitHub account
# 3. Create new Web Service
# 4. Select repository: aapatt
# 5. Configure:
```

**Render Configuration:**
```yaml
Name: aapatt-backend
Environment: Node
Region: Singapore (closest to India)
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

**Environment Variables in Render:**
```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FIREBASE_PROJECT_ID=your-firebase-project-id
# ... add all other environment variables
```

### 3. Custom Domain (Optional)
```bash
# In Render dashboard:
# Settings > Custom Domains > Add api.yourdomain.com
```

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy Admin Dashboard
```bash
# 1. Go to https://vercel.com
# 2. Import GitHub repository
# 3. Configure:
```

**Vercel Configuration:**
```yaml
Framework Preset: Next.js (or React)
Root Directory: admin-dashboard
Build Command: npm run build
Output Directory: dist (or build)
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://aapatt-backend.onrender.com
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"...","authDomain":"..."}
```

### 2. Configure Custom Domain
```bash
# In Vercel dashboard:
# Settings > Domains > Add admin.yourdomain.com
```

## 📱 Mobile App Deployment

### 1. Expo Configuration
```json
// app.json
{
  "expo": {
    "name": "Aapatt",
    "slug": "aapatt-emergency",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "extra": {
      "apiUrl": "https://aapatt-backend.onrender.com",
      "firebaseConfig": {
        "apiKey": "your-api-key",
        "authDomain": "your-project.firebaseapp.com",
        "projectId": "your-project-id"
      }
    }
  }
}
```

### 2. Build and Deploy
```bash
# Install Expo CLI
npm install -g @expo/cli

# Build for Android (APK)
cd citizen-app
expo build:android

# Build for iOS (requires Apple Developer account)
expo build:ios

# Publish updates (free)
expo publish
```

### 3. App Store Distribution
```bash
# For testing (free):
# - Share APK file directly
# - Use Expo Go app for testing
# - TestFlight for iOS testing

# For production (paid):
# - Google Play Console ($25 one-time)
# - Apple App Store ($99/year)
```

## 🔄 CI/CD Setup (GitHub Actions)

### 1. Create Workflow File
```yaml
# .github/workflows/deploy.yml
name: Deploy Aapatt

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Deploy to Render
        # Render auto-deploys on git push
        run: echo "Backend deployed via Render auto-deploy"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Deploy to Vercel
        # Vercel auto-deploys on git push
        run: echo "Frontend deployed via Vercel auto-deploy"
```

## 📊 Monitoring Setup

### 1. UptimeRobot (Free)
```bash
# 1. Go to https://uptimerobot.com
# 2. Add monitors:
#    - https://aapatt-backend.onrender.com/health
#    - https://admin.yourdomain.com
# 3. Set up email alerts
```

### 2. Render Logs
```bash
# View logs in Render dashboard
# Set up log retention (7 days free)
```

### 3. Supabase Monitoring
```bash
# Monitor in Supabase dashboard:
# - Database usage
# - API requests
# - Real-time connections
```

## 🔒 Security Configuration

### 1. Environment Variables
```bash
# Never commit .env files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. CORS Configuration
```javascript
// backend/src/index.ts
app.use(cors({
  origin: [
    'https://admin.yourdomain.com',
    'https://aapatt-admin.vercel.app',
    'exp://192.168.1.100:19000', // Expo development
  ],
  credentials: true
}));
```

### 3. Rate Limiting
```javascript
// Already configured in backend
// 100 requests per 15 minutes per user
```

## 📈 Scaling Considerations

### Free Tier Limits
| Service | Limit | Upgrade Cost |
|---------|-------|--------------|
| Render | 512MB RAM, sleeps after 15min | $7/month |
| Supabase | 500MB DB, 2GB bandwidth | $25/month |
| Vercel | 100GB bandwidth | $20/month |
| Firebase | 10K phone auths, 1GB storage | $25/month |

### Performance Optimization
```javascript
// Backend optimizations:
// 1. Database connection pooling
// 2. Response caching
// 3. Image compression
// 4. CDN for static assets

// Mobile optimizations:
// 1. Code splitting
// 2. Image optimization
// 3. Offline caching
// 4. Bundle size optimization
```

## 🚨 Production Checklist

### Before Going Live
- [ ] All environment variables configured
- [ ] Database migrations run
- [ ] Firebase authentication tested
- [ ] Push notifications working
- [ ] AI analysis functional
- [ ] Real-time features tested
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Domain names configured
- [ ] App store accounts ready

### Post-Launch
- [ ] Monitor error rates
- [ ] Check API response times
- [ ] Monitor database usage
- [ ] Track user registrations
- [ ] Monitor notification delivery
- [ ] Check AI analysis accuracy
- [ ] Review security logs
- [ ] Backup verification
- [ ] Performance optimization
- [ ] User feedback collection

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs in Render dashboard
# Verify environment variables
# Check database connection
```

**Real-time not working:**
```bash
# Verify Supabase realtime enabled
# Check WebSocket connections
# Verify authentication
```

**Push notifications failing:**
```bash
# Check Firebase configuration
# Verify FCM tokens
# Check message format
```

**AI analysis errors:**
```bash
# Check Hugging Face API key
# Verify model availability
# Check image format/size
```

### Support Resources
- **Render:** [docs.render.com](https://docs.render.com)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)
- **Firebase:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **Expo:** [docs.expo.dev](https://docs.expo.dev)