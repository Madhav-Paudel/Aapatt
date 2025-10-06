# 🚨 Aapatt Emergency Superapp

> **Aapatt** (आपत्ति - meaning "emergency" in Sanskrit) is a comprehensive emergency response superapp designed for developing countries.

## 🧩 System Architecture

### 📱 **Citizen App** (React Native/Expo)
- Emergency request buttons (Ambulance, Fire Brigade, Air Ambulance)
- Real-time tracking of responding units
- AI-powered first-aid assistant with camera detection
- Auto location detection with manual override

### 🚑 **Provider App** (React Native/Expo)  
- Secure login with phone OTP verification
- Emergency request alerts and acceptance workflow
- Live GPS tracking and navigation integration
- Status updates and job history

### 💻 **Admin Dashboard** (React Web)
- Live emergency map with real-time monitoring
- Provider management and performance tracking
- Analytics and reporting dashboard
- Manual assignment capabilities

### 🔧 **Backend API** (Node.js/Express)
- RESTful API with PostgreSQL database
- Socket.IO real-time communication
- Firebase Auth integration
- AI service integration with Hugging Face

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repo-url>
cd aapatt
npm run setup

# 2. Start development (run in separate terminals)
npm run dev:backend      # Backend API
npm run dev:admin        # Admin dashboard  
npm run dev:citizen      # Citizen mobile app
npm run dev:provider     # Provider mobile app

# 3. Test on mobile device
# Install Expo Go app and scan QR code
```

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo), React, TailwindCSS
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: PostgreSQL with PostGIS (Supabase)
- **Auth**: Firebase Authentication
- **AI**: Hugging Face Inference API
- **Maps**: OpenStreetMap + OSRM
- **Hosting**: Render (backend), Vercel (frontend)

## 📁 Project Structure

```
aapatt/
├── 📱 citizen-app/             # React Native - Citizens
├── 🚑 provider-app/            # React Native - Providers  
├── 💻 admin-dashboard/         # React Web Dashboard
├── 🔧 backend/                 # Node.js Express API
├── 📦 shared/                  # Shared utilities
├── 📚 docs/                    # Documentation
└── 🛠️ scripts/                # Setup scripts
```

## 🎨 Branding

- **App Name**: Aapatt (आपत्ति)
- **Primary Color**: #E53935 (Emergency Red)
- **Secondary Color**: #1565C0 (Trust Blue)
- **Tagline**: "Saving lives through intelligent technology"

## 📖 Documentation

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

This is an MVP built for emergency response in developing countries. Contributions are welcome!

## 📄 License

MIT License - see LICENSE file for details.