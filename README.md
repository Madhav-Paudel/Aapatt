# 🚨 Aapatt - Emergency Response Superapp

> **आपत्ति** (Aapatt - meaning "emergency" in Sanskrit)  
> *Saving lives through intelligent technology*

A comprehensive emergency response system designed for developing countries, connecting citizens with emergency services including ambulances, fire brigades, and air ambulances through intelligent technology.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Aapatt is a full-stack emergency response platform consisting of:

1. **Citizen App** - React Native mobile app for requesting emergency services
2. **Provider App** - React Native mobile app for emergency service providers
3. **Admin Dashboard** - React web dashboard for coordinators and officials
4. **Backend API** - Node.js/Express server with real-time Socket.IO

### Key Features

- 🚑 **Multi-Service Support**: Ambulance, Fire Brigade, and Air Ambulance
- 📍 **Real-time Tracking**: Live GPS tracking with ETA calculations
- 🤖 **AI First-Aid**: Camera-based injury detection and guidance
- ⚡ **Instant Matching**: Geospatial matching with nearest providers
- 💬 **Real-time Updates**: Socket.IO for live status updates
- 📊 **Analytics Dashboard**: Performance metrics and insights
- 🌍 **Offline Support**: Basic functionality without internet

## ✨ Features

### Citizen App
- Emergency request with one-tap buttons
- Auto-location detection with manual override
- Real-time tracking of responding units
- AI-powered first-aid guidance with camera
- Request history and emergency contacts
- Push notifications for status updates

### Provider App
- Online/offline status toggle
- Emergency request alerts with sound
- Accept/decline workflow
- Turn-by-turn navigation
- Live GPS tracking broadcast
- Job history and performance metrics

### Admin Dashboard
- Live emergency map
- Real-time statistics dashboard
- Provider management and verification
- Manual assignment capability
- Analytics and reporting
- System health monitoring

## 🛠 Tech Stack

### Frontend
- **Mobile Apps**: React Native with Expo
- **Web Dashboard**: React with Vite + TailwindCSS
- **Maps**: React Native Maps + OpenStreetMap
- **Real-time**: Socket.IO Client

### Backend
- **API**: Node.js + Express.js
- **Database**: PostgreSQL with PostGIS
- **Authentication**: Firebase Auth
- **Real-time**: Socket.IO Server
- **AI**: Hugging Face Inference API

### Infrastructure (Free Tier)
- **Database**: Supabase (500MB free)
- **Backend Hosting**: Render (free tier)
- **Frontend Hosting**: Vercel (unlimited)
- **Mobile**: Expo (free builds)

## 📁 Project Structure

```
aapatt/
├── backend/              # Node.js Express API
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Auth & validation
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── index.js     # Server entry
│   └── package.json
│
├── citizen-app/         # React Native (Expo)
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── context/     # State management
│   │   └── services/    # API & location
│   └── App.js
│
├── provider-app/        # React Native (Expo)
│   ├── src/
│   │   ├── screens/     # Provider screens
│   │   ├── components/  # UI components
│   │   ├── context/     # Auth & Socket
│   │   └── services/    # API services
│   └── App.js
│
├── admin-dashboard/     # React Web
│   ├── src/
│   │   ├── pages/       # Dashboard pages
│   │   ├── components/  # UI components
│   │   └── App.jsx
│   └── package.json
│
├── shared/             # Shared utilities
│   └── src/
│       ├── constants.js # App constants
│       ├── utils.js     # Helper functions
│       └── validation.js # Validators
│
└── docs/               # Documentation
    ├── API.md          # API documentation
    ├── SETUP.md        # Setup guide
    └── DEPLOYMENT.md   # Deployment guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL (or Supabase account)
- Expo CLI (for mobile apps)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aapatt
   ```

2. **Run automated setup**
   ```bash
   node scripts/setup.js
   ```

3. **Or manual installation**
   ```bash
   npm install
   npm run install:all
   ```

4. **Setup environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your credentials
   ```

5. **Initialize database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

6. **Start all services**
   ```bash
   # Terminal 1
   npm run dev:backend

   # Terminal 2
   npm run dev:admin

   # Terminal 3
   npm run dev:citizen

   # Terminal 4
   npm run dev:provider
   ```

## 💻 Development

### Backend API
```bash
cd backend
npm run dev          # Start dev server
npm run prisma:studio # Open Prisma Studio
```

### Mobile Apps
```bash
cd citizen-app
npm start           # Start Expo
npm run android     # Run on Android
npm run ios         # Run on iOS
```

### Admin Dashboard
```bash
cd admin-dashboard
npm run dev         # Start Vite dev server
npm run build       # Build for production
```

## 🌐 Deployment

### Backend (Render)
```bash
# Automatic deployment via GitHub integration
git push origin main
```

### Admin Dashboard (Vercel)
```bash
cd admin-dashboard
vercel --prod
```

### Mobile Apps (Expo)
```bash
cd citizen-app
eas build --platform all --profile production
```

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-api.onrender.com/api
```

### Key Endpoints

**Authentication:**
```
POST /auth/register     # Register user
POST /auth/login        # Login user
GET  /auth/profile      # Get profile
```

**Emergency Requests:**
```
POST   /requests        # Create request
GET    /requests/:id    # Get request
GET    /requests/user/me # Get user requests
POST   /requests/:id/cancel # Cancel request
```

**Providers:**
```
POST /providers/register    # Register provider
PUT  /providers/status      # Update status
POST /providers/accept      # Accept request
```

See [API.md](docs/API.md) for complete documentation.

## 🎨 Branding

- **App Name**: Aapatt (आपत्ति)
- **Tagline**: Saving lives through intelligent technology
- **Primary Color**: #E53935 (Emergency Red)
- **Secondary Color**: #1565C0 (Trust Blue)
- **Accent Color**: #FFEB3B (Alert Yellow)
- **Success Color**: #43A047 (Safe Green)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for free mapping services
- Hugging Face for AI models
- Supabase for free PostgreSQL hosting
- Expo for React Native development platform

## 📞 Support

For support:
- 📧 Email: support@aapatt.com
- 📖 Documentation: [docs/](docs/)
- 🐛 Issues: GitHub Issues
- 💬 Community: Join our Slack

---

**Built with ❤️ to save lives**

© 2024 Aapatt. All rights reserved.
