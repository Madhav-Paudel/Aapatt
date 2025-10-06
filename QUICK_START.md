# 🚀 Aapatt - Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Fastest Way to Start

```bash
# 1. Clone and enter directory
git clone <repo-url>
cd aapatt

# 2. Run automated setup
node scripts/setup.js

# 3. Configure environment (just once)
nano backend/.env  # Add your database URL

# 4. Initialize database
cd backend && npx prisma migrate dev && cd ..

# 5. Start everything (4 terminals)
npm run dev:backend    # Terminal 1 → http://localhost:3000
npm run dev:admin      # Terminal 2 → http://localhost:5173
npm run dev:citizen    # Terminal 3 → Scan QR with Expo Go
npm run dev:provider   # Terminal 4 → Scan QR with Expo Go
```

## 📱 Test the App

### 1. On Your Phone:
1. Install **Expo Go** from App/Play Store
2. Scan QR code from Terminal 3 (Citizen App)
3. Scan QR code from Terminal 4 (Provider App)

### 2. Basic Test Flow:

**Citizen App:**
1. Register with phone number
2. Allow location permissions
3. Tap 🚑 Ambulance button
4. Watch real-time tracking

**Provider App:**
1. Login with provider account
2. Toggle status to "Online"
3. Accept incoming request
4. Navigate to emergency

**Admin Dashboard:**
1. Open http://localhost:5173
2. Login with admin credentials
3. Monitor live emergency requests

## 🔧 Minimum Requirements

- ✅ Node.js 18+
- ✅ PostgreSQL (or free Supabase account)
- ✅ Smartphone with Expo Go app

## 📚 Learn More

- [Full Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Summary](PROJECT_SUMMARY.md)

## 🆘 Quick Troubleshooting

**Port in use:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**
```bash
cd backend
npx prisma migrate reset
```

**Expo not connecting:**
```bash
expo start -c  # Clear cache
```

## 🎯 What You Get

✅ **3 Full Applications** (Citizen, Provider, Admin)  
✅ **Complete Backend API** with real-time features  
✅ **AI-Powered First Aid** guidance  
✅ **Live GPS Tracking** with ETA  
✅ **Admin Dashboard** for monitoring  
✅ **Production Ready** code  

---

**Ready to save lives? Let's go! 🚨**
