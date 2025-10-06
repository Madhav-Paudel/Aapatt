# 🚀 Aapatt Emergency Superapp - Deployment Guide

This guide covers deploying the Aapatt emergency response system to production environments.

## 📋 Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] Firebase project configured
- [ ] Supabase project configured (if using)
- [ ] Domain names registered
- [ ] SSL certificates obtained
- [ ] Monitoring tools configured

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │  Admin Dashboard│    │   Backend API   │
│                 │    │                 │    │                 │
│ • Citizen App   │◄──►│ • React Web App │◄──►│ • Node.js/Express│
│ • Provider App  │    │ • Vercel Hosted │    │ • Render Hosted │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │                 │
                    │ • PostgreSQL    │
                    │ • Supabase      │
                    └─────────────────┘
```

## 🔧 Backend Deployment (Render)

### 1. Prepare Backend for Production

```bash
cd backend

# Install production dependencies
npm install --production

# Build the application
npm run build

# Test the build
npm start
```

### 2. Deploy to Render

1. **Connect GitHub Repository:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend` folder

2. **Configure Build Settings:**
   ```
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-production-jwt-secret
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   HUGGING_FACE_API_KEY=your-hf-api-key
   CORS_ORIGIN=https://your-admin-domain.com,exp://your-expo-domain.com
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://aapatt-backend.onrender.com`)

### 3. Database Setup (Supabase)

1. **Create Supabase Project:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create new project
   - Note the project URL and API keys

2. **Run Migrations:**
   ```bash
   # Set production DATABASE_URL
   export DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   
   # Run migrations
   npx prisma migrate deploy
   ```

3. **Update Environment Variables:**
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   SUPABASE_URL=https://[project-ref].supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 💻 Admin Dashboard Deployment (Vercel)

### 1. Prepare Admin Dashboard

```bash
cd admin-dashboard

# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm run preview
```

### 2. Deploy to Vercel

1. **Connect GitHub Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `admin-dashboard` folder

2. **Configure Build Settings:**
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Set Environment Variables:**
   ```
   VITE_API_URL=https://aapatt-backend.onrender.com/api
   VITE_SOCKET_URL=https://aapatt-backend.onrender.com
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note the domain (e.g., `https://aapatt-admin.vercel.app`)

## 📱 Mobile Apps Deployment (Expo)

### 1. Prepare Mobile Apps

```bash
# Citizen App
cd citizen-app
npm install
npx expo install --fix

# Provider App
cd ../provider-app
npm install
npx expo install --fix
```

### 2. Configure for Production

Update `app.json` in both apps:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://aapatt-backend.onrender.com/api",
      "socketUrl": "https://aapatt-backend.onrender.com"
    }
  }
}
```

### 3. Build for Production

#### Android Builds

```bash
# Citizen App
cd citizen-app
npx expo build:android --type apk

# Provider App
cd ../provider-app
npx expo build:android --type apk
```

#### iOS Builds

```bash
# Citizen App
cd citizen-app
npx expo build:ios

# Provider App
cd ../provider-app
npx expo build:ios
```

### 4. Submit to App Stores

#### Google Play Store

```bash
# Upload APK to Google Play Console
# Follow Google Play Store guidelines
```

#### Apple App Store

```bash
# Submit to App Store Connect
npx expo submit:ios
```

## 🔥 Firebase Configuration

### 1. Production Firebase Project

1. **Create Production Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create new project for production
   - Enable Authentication with Phone provider

2. **Configure Authentication:**
   - Go to Authentication → Sign-in method
   - Enable Phone authentication
   - Configure reCAPTCHA settings

3. **Download Service Account Key:**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Save as JSON file

4. **Update Environment Variables:**
   ```
   FIREBASE_PROJECT_ID=your-production-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   ```

## 🤖 AI Configuration

### 1. Hugging Face Setup

1. **Create Production API Key:**
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Create new token with read permissions

2. **Update Environment Variables:**
   ```
   HUGGING_FACE_API_KEY=your-production-hf-api-key
   HUGGING_FACE_MODEL_URL=https://api-inference.huggingface.co/models/google/vit-base-patch16-224
   ```

## 🔒 Security Configuration

### 1. SSL Certificates

- **Backend (Render):** Automatically provided
- **Admin Dashboard (Vercel):** Automatically provided
- **Mobile Apps:** Handled by app stores

### 2. Environment Variables Security

- Use strong, unique secrets for production
- Rotate JWT secrets regularly
- Use environment-specific API keys
- Never commit secrets to version control

### 3. CORS Configuration

```javascript
// Backend CORS settings
const corsOptions = {
  origin: [
    'https://aapatt-admin.vercel.app',
    'exp://your-expo-domain.com'
  ],
  credentials: true
}
```

## 📊 Monitoring and Logging

### 1. Application Monitoring

- **Backend:** Use Render's built-in monitoring
- **Admin Dashboard:** Use Vercel Analytics
- **Mobile Apps:** Use Expo Analytics

### 2. Error Tracking

Consider integrating:
- **Sentry** for error tracking
- **LogRocket** for session replay
- **New Relic** for performance monitoring

### 3. Database Monitoring

- **Supabase:** Built-in monitoring dashboard
- Set up alerts for high CPU usage
- Monitor query performance

## 🚀 Deployment Commands

### Quick Deploy Script

```bash
# Build all applications
npm run build:all

# Deploy to production
npm run deploy
```

### Manual Deployment Steps

```bash
# 1. Backend
cd backend
npm run build
# Deploy to Render

# 2. Admin Dashboard
cd admin-dashboard
npm run build
# Deploy to Vercel

# 3. Mobile Apps
cd citizen-app
npx expo build:android
npx expo build:ios
# Submit to app stores

cd ../provider-app
npx expo build:android
npx expo build:ios
# Submit to app stores
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Add Render deployment steps

  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        # Add Vercel deployment steps
```

## 🧪 Testing in Production

### 1. Smoke Tests

- [ ] Backend API responds to health check
- [ ] Admin dashboard loads correctly
- [ ] Mobile apps can connect to backend
- [ ] Database connections work
- [ ] Socket.IO connections work

### 2. Integration Tests

- [ ] Emergency request flow works end-to-end
- [ ] Provider acceptance flow works
- [ ] Real-time updates work
- [ ] AI analysis works
- [ ] Push notifications work

### 3. Performance Tests

- [ ] API response times < 2 seconds
- [ ] Database queries optimized
- [ ] Mobile app performance acceptable
- [ ] Admin dashboard loads quickly

## 🚨 Rollback Plan

### 1. Backend Rollback

- Use Render's rollback feature
- Revert to previous deployment
- Check database migrations

### 2. Admin Dashboard Rollback

- Use Vercel's rollback feature
- Revert to previous deployment
- Update API endpoints if needed

### 3. Mobile App Rollback

- Submit previous version to app stores
- Use staged rollout for gradual deployment
- Monitor crash reports

## 📞 Support and Maintenance

### 1. Monitoring Alerts

Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- High CPU/memory usage

### 2. Regular Maintenance

- Update dependencies monthly
- Monitor security advisories
- Review and rotate secrets
- Backup database regularly

### 3. User Support

- Monitor app store reviews
- Track support tickets
- Maintain documentation
- Provide training materials

---

**🎉 Your Aapatt Emergency Superapp is now deployed and ready to save lives!**

For ongoing maintenance and updates, refer to the [Setup Guide](SETUP.md) and [API Documentation](API.md).