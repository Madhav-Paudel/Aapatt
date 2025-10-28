# 🚨 Aapatt Emergency Superapp

> **Aapatt** (आपत्ति - meaning "emergency" in Sanskrit) is a comprehensive emergency response superapp designed for developing countries.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)

## 🧩 System Overview

Aapatt consists of three connected applications plus a robust backend infrastructure:

- **🚨 Citizen App** - For citizens requesting emergency services
- **🚑 Provider App** - For emergency service providers (ambulance, fire, air rescue)
- **💻 Admin Dashboard** - For emergency service coordinators and officials
- **🔧 Backend API** - Core infrastructure powering all applications

## 🛠️ Tech Stack

- **Frontend**: React Native (Expo) + React + Material-UI
- **Backend**: Node.js + Express.js + PostgreSQL + PostGIS
- **Authentication**: Firebase Auth
- **Real-time**: Socket.IO
- **AI Integration**: Hugging Face APIs
- **Maps**: React Native Maps + OpenStreetMap
- **Hosting**: Supabase + Render + Vercel (Free Tiers)

## 🚀 Quick Start

```bash
# 1. Clone and setup
git clone <repo-url>
cd aapatt
chmod +x scripts/setup.sh
./scripts/setup.sh

# 2. Configure environment variables
# Update backend/.env, citizen-app/.env, provider-app/.env, admin-dashboard/.env

# 3. Set up database
cd backend
npx prisma migrate dev
npx prisma generate

# 4. Start development (run in separate terminals)
npm run dev:backend      # Backend API (port 3000)
npm run dev:admin        # Admin dashboard (port 3001)
npm run dev:citizen      # Citizen mobile app
npm run dev:provider     # Provider mobile app

# 5. Test on mobile
# Install Expo Go app and scan QR code
```

## 📱 Features

### 🚨 Citizen App
- **Emergency Request Buttons**: Large, accessible buttons for Ambulance, Fire Brigade, Air Ambulance, Police
- **Auto Location Detection**: GPS with manual override capability
- **Real-time Tracking**: Live tracking of responding units with ETA calculations
- **AI First-Aid Assistant**: Camera-based injury detection and step-by-step guidance
- **Live Status Updates**: Real-time updates via Socket.IO
- **Request History**: View past emergency requests
- **Emergency Contacts**: Quick access to emergency numbers

### 🚑 Provider App  
- **Secure Authentication**: Phone number OTP verification
- **Status Management**: Online/offline and available/unavailable toggles
- **Emergency Alerts**: Sound and vibration notifications for new requests
- **Request Details**: Distance, description, and location information
- **Accept/Decline Workflow**: Simple interface for responding to requests
- **Navigation Integration**: Turn-by-turn directions to emergency location
- **Live GPS Tracking**: Broadcast location to citizens
- **Job History**: Track completed and ongoing jobs

### 💻 Admin Dashboard
- **Live Emergency Map**: Real-time view of all active requests and providers
- **Real-time Dashboard**: Key metrics and statistics
- **Provider Management**: Registration, verification, and performance tracking
- **Manual Assignment**: Override automatic provider matching when needed
- **Analytics & Reporting**: Response times, service breakdowns, heat maps
- **System Health Monitoring**: Database status, API performance, error tracking

## 🎨 Branding

- **App Name**: Aapatt (आपत्ति)
- **Tagline**: "Saving lives through intelligent technology"
- **Primary Color**: #E53935 (Emergency Red)
- **Secondary Color**: #1565C0 (Trust Blue)
- **Accent Color**: #FFEB3B (Alert Yellow)
- **Success Color**: #43A047 (Safe Green)

## 📁 Project Structure

```
aapatt/
├── 📱 citizen-app/          # React Native (Expo) - Citizens
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API and utility services
│   │   └── navigation/      # Navigation setup
│   └── App.js
├── 🚑 provider-app/         # React Native (Expo) - Providers
│   ├── src/
│   │   ├── screens/         # Provider screens
│   │   ├── components/      # Provider components
│   │   └── services/        # Provider services
│   └── App.js
├── 💻 admin-dashboard/      # React Web Dashboard
│   ├── src/
│   │   ├── pages/           # Dashboard pages
│   │   ├── components/      # Dashboard components
│   │   └── services/        # Admin services
│   └── index.html
├── 🔧 backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, etc.
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── services/        # Business logic
│   └── prisma/              # Database schema
├── 📦 shared/               # Shared utilities and types
│   └── src/
│       ├── constants.js     # App constants
│       └── utils.js         # Utility functions
├── 📚 docs/                 # Documentation
│   ├── API.md              # API documentation
│   ├── SETUP.md            # Setup instructions
│   └── DEPLOYMENT.md       # Deployment guide
└── 🛠️ scripts/              # Setup scripts
    └── setup.sh            # Automated setup
```

## 🔧 Environment Setup

### Required Services

1. **Supabase** (Database)
   - Create project at [supabase.com](https://supabase.com)
   - Get database URL and anon key
   - Update `backend/.env`

2. **Firebase** (Authentication)
   - Create project at [firebase.google.com](https://firebase.google.com)
   - Enable Phone Authentication
   - Get Firebase config
   - Update app `.env` files

3. **Hugging Face** (AI)
   - Create account at [huggingface.co](https://huggingface.co)
   - Get API key
   - Update `backend/.env`

4. **Render** (Backend hosting)
   - Create account at [render.com](https://render.com)
   - Connect GitHub repository

5. **Vercel** (Frontend hosting)
   - Create account at [vercel.com](https://vercel.com)
   - Connect GitHub repository

### Environment Files

Copy and configure these files:
```bash
cp backend/.env.example backend/.env
cp citizen-app/.env.example citizen-app/.env
cp provider-app/.env.example provider-app/.env
cp admin-dashboard/.env.example admin-dashboard/.env
```

## 📖 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference
- **[Setup Instructions](docs/SETUP.md)** - Detailed setup guide
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment

## 🧪 Testing

### Mobile Apps
1. Install Expo Go on your phone
2. Run `npm run dev:citizen` or `npm run dev:provider`
3. Scan QR code with Expo Go

### Web Dashboard
1. Run `npm run dev:admin`
2. Open http://localhost:3001

### Backend API
1. Run `npm run dev:backend`
2. Test endpoints at http://localhost:3000
3. Use Postman or curl for API testing

## 🚀 Deployment

### Free Tier Deployment
- **Database**: Supabase (500MB free)
- **Backend**: Render (free tier)
- **Frontend**: Vercel (unlimited for hobby)
- **Mobile**: Expo builds (free tier)

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass

## 📊 Performance

- **Response Time**: < 2 seconds for emergency requests
- **Real-time Updates**: < 1 second latency
- **Database Queries**: Optimized with proper indexing
- **Mobile Performance**: 60fps animations, smooth scrolling

## 🔒 Security

- JWT-based authentication
- Input validation and sanitization
- Rate limiting on API endpoints
- HTTPS for all communications
- Secure environment variable handling

## 🌍 Internationalization

Currently supports:
- English (primary)
- Hindi (आपत्ति branding)
- Planned: Spanish, French, Arabic

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic emergency request system
- ✅ Real-time tracking
- ✅ Provider management
- ✅ Admin dashboard

### Phase 2 (Planned)
- 🔄 Multi-language support
- 🔄 Voice commands
- 🔄 Offline mode
- 🔄 Advanced analytics

### Phase 3 (Future)
- 🔄 Machine learning optimization
- 🔄 Integration with government systems
- 🔄 IoT device integration
- 🔄 Advanced AI features

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@aapatt.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Emergency services personnel worldwide
- Open source community
- React Native and Expo teams
- Firebase and Supabase teams
- All contributors and testers

---

**Built with ❤️ for emergency response in developing countries**

*Saving lives through intelligent technology*