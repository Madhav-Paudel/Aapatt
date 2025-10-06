# 🛠️ Aapatt Setup Guide

Complete setup instructions for local development.

## Prerequisites

### Required Software
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git** for version control
- **PostgreSQL** 14+ (or Supabase account)
- **Expo CLI** for mobile development

### Optional Software
- **Docker** for containerized database
- **Postman** for API testing
- **VS Code** with recommended extensions

---

## 🚀 Step-by-Step Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd aapatt
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all

# Or install individually
cd backend && npm install
cd ../citizen-app && npm install
cd ../provider-app && npm install
cd ../admin-dashboard && npm install
cd ../shared && npm install
```

### 3. Database Setup

#### Option A: Using Supabase (Recommended for Free Tier)

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Enable PostGIS extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

#### Option B: Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib postgis
   
   # macOS
   brew install postgresql postgis
   ```

2. Create database:
   ```bash
   createdb aapatt
   psql aapatt -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

### 4. Environment Configuration

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aapatt?schema=public"
# Or Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Firebase (Optional - for phone authentication)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"

# Hugging Face (for AI features)
HUGGING_FACE_API_KEY="hf_your_api_key"

# Security
JWT_SECRET="generate-a-random-secret-key"
BCRYPT_ROUNDS=12

# Server
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000,http://localhost:19006"
```

### 5. Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npm run seed
```

### 6. Firebase Setup (Optional)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication → Phone authentication
4. Download service account key:
   - Project Settings → Service Accounts
   - Generate New Private Key
5. Copy credentials to `.env`

### 7. Hugging Face Setup (Optional)

1. Create account at [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with read access
4. Copy token to `HUGGING_FACE_API_KEY`

### 8. Mobile App Configuration

#### Citizen App

```bash
cd citizen-app
```

Edit `app.json` to set your API URL:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000"
    }
  }
}
```

For physical devices, use your computer's IP:
```json
"apiUrl": "http://192.168.1.100:3000"
```

#### Provider App

Same process as Citizen App - edit `provider-app/app.json`

### 9. Start Development Servers

Open 4 terminal windows:

```bash
# Terminal 1 - Backend API
npm run dev:backend

# Terminal 2 - Admin Dashboard
npm run dev:admin

# Terminal 3 - Citizen App
npm run dev:citizen

# Terminal 4 - Provider App
npm run dev:provider
```

---

## 📱 Mobile Development

### Install Expo Go

**iOS:**
- Download from App Store

**Android:**
- Download from Play Store

### Running on Device

1. Ensure phone and computer on same WiFi
2. Scan QR code from terminal with Expo Go
3. App will load on device

### Running on Emulator

**iOS Simulator (macOS only):**
```bash
cd citizen-app
npm run ios
```

**Android Emulator:**
```bash
cd citizen-app
npm run android
```

---

## 🧪 Testing

### API Testing

```bash
cd backend
npm test
```

### Using Postman

1. Import collection: `docs/postman/Aapatt.postman_collection.json`
2. Set environment variables
3. Test endpoints

### Manual Testing

1. Register as citizen via Citizen App
2. Register as provider via Provider App
3. Create emergency request
4. Accept request from Provider App
5. Monitor in Admin Dashboard

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Reset database
npx prisma migrate reset
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Expo Connection Issues

```bash
# Clear cache
expo start -c

# Reset Metro bundler
expo start --clear
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Socket.IO Documentation](https://socket.io/docs/)

---

## 🎯 Next Steps

1. ✅ Complete setup following this guide
2. 📖 Read [API Documentation](API.md)
3. 🚀 Follow [Deployment Guide](DEPLOYMENT.md)
4. 💻 Start development!

---

For issues, please open a GitHub issue or contact support.
