# 🚑 Aapatt Emergency Superapp

> **Aapatt** (आपत्ति - meaning "emergency" in Sanskrit) is a comprehensive emergency response superapp designed for developing countries. This system provides citizens with instant access to emergency services including ambulances, fire brigades, and air ambulances, powered by AI-driven first-aid assistance.

## 🌟 Features

### 🚨 **For Citizens**
- **One-Tap Emergency Requests** - Ambulance, Fire Brigade, Air Ambulance
- **Real-Time GPS Tracking** - Track responding units with live ETA updates
- **AI First-Aid Assistant** - Camera-based injury detection and step-by-step guidance
- **Automatic Location Detection** - Precise location sharing with manual override
- **Emergency Contact Management** - Quick access to personal emergency contacts
- **Request History** - Track all emergency requests and outcomes

### 🚑 **For Emergency Providers**
- **Real-Time Request Notifications** - Instant alerts for nearby emergencies
- **Smart Request Matching** - Distance-based automatic assignment
- **Live Navigation** - Turn-by-turn directions to emergency locations
- **Status Management** - Online/Offline availability toggle
- **Performance Tracking** - Job history and rating system

### 💻 **For Administrators**
- **Live Emergency Dashboard** - Real-time monitoring of all active requests
- **Provider Management** - Registration, verification, and performance tracking
- **Analytics & Reporting** - Response time analysis and service metrics
- **Geographic Heat Maps** - Emergency pattern analysis
- **System Health Monitoring** - API and service status tracking

## 🏗️ Architecture

### **Frontend Applications**
- **Citizen App**: React Native (Expo) for iOS/Android
- **Provider App**: React Native (Expo) for emergency service providers  
- **Admin Dashboard**: React web application for coordinators

### **Backend Infrastructure**
- **API Server**: Node.js with Express.js
- **Database**: PostgreSQL with PostGIS for geospatial queries
- **Real-time**: Socket.IO for live updates and tracking
- **Authentication**: Firebase Auth with JWT tokens
- **AI Services**: Hugging Face integration for injury detection

### **Free Tier Services**
- **Database**: Supabase (500MB free)
- **Backend Hosting**: Render (free tier)
- **Frontend Hosting**: Vercel (unlimited for hobby)
- **Authentication**: Firebase (free tier)
- **AI Processing**: Hugging Face (30 requests/min free)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g @expo/cli`)
- PostgreSQL database (or Supabase account)
- Firebase project for authentication

### 1. Clone and Setup
```bash
git clone https://github.com/your-username/aapatt-emergency-superapp.git
cd aapatt-emergency-superapp

# Install dependencies for all applications
npm run install:all
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
# - Database connection (Supabase or local PostgreSQL)
# - Firebase credentials
# - Hugging Face API key
# - JWT secrets
```

### 3. Database Setup
```bash
# Navigate to backend
cd backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Servers

**Terminal 1 - Backend API:**
```bash
npm run dev:backend
# Runs on http://localhost:3000
```

**Terminal 2 - Admin Dashboard:**
```bash
npm run dev:admin  
# Runs on http://localhost:3001
```

**Terminal 3 - Citizen Mobile App:**
```bash
npm run dev:citizen
# Scan QR code with Expo Go app
```

**Terminal 4 - Provider Mobile App:**
```bash
npm run dev:provider
# Scan QR code with Expo Go app
```

### 5. Test the System
1. **Register as Citizen** - Use the citizen app to create an account
2. **Create Emergency Request** - Test the emergency button functionality
3. **Register as Provider** - Use provider app to register emergency services
4. **Monitor Dashboard** - View real-time activity in admin dashboard

## 📱 Mobile App Installation

### **For Testing (Development)**
1. Install **Expo Go** from App Store/Play Store
2. Scan QR code from terminal when running `npm run dev:citizen`
3. App will load directly on your device

### **For Production (App Stores)**
```bash
# Build for Android
cd citizen-app
expo build:android

# Build for iOS  
expo build:ios
```

## 🔧 Configuration

### **Firebase Setup**
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication with Phone Number sign-in
3. Generate service account key
4. Add configuration to `.env` file

### **Supabase Setup** 
1. Create project at https://supabase.com
2. Get database URL and anon key
3. Enable PostGIS extension for geospatial queries
4. Add configuration to `.env` file

### **Hugging Face Setup**
1. Create account at https://huggingface.co
2. Generate API token
3. Add to `.env` as `HUGGING_FACE_API_KEY`

## 🌐 Deployment

### **Backend (Render)**
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy with automatic builds on push

### **Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Configure build settings for React app
3. Deploy with automatic previews

### **Mobile Apps (Expo)**
```bash
# Build and submit to app stores
expo build:android --release-channel production
expo build:ios --release-channel production
```

## 🧪 Testing

### **Backend API Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd citizen-app
npm test

cd ../admin-dashboard  
npm test
```

### **Manual Testing Checklist**
- [ ] User registration and OTP verification
- [ ] Emergency request creation and tracking
- [ ] Provider notification and acceptance
- [ ] Real-time location updates
- [ ] AI first-aid analysis
- [ ] Admin dashboard monitoring

## 📊 Monitoring & Analytics

### **Health Checks**
- API Health: `GET /health`
- Database Status: `GET /health/detailed`
- Service Monitoring: Built-in Winston logging

### **Performance Metrics**
- Response times for emergency requests
- Provider acceptance rates
- Geographic coverage analysis
- User engagement statistics

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** on sensitive endpoints
- **Input Validation** with Joi schemas
- **SQL Injection Protection** via Prisma ORM
- **CORS Configuration** for cross-origin requests
- **Helmet.js** for security headers

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Development Guidelines**
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Test on both iOS and Android devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### **Getting Help**
- **Documentation**: Check `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

### **Emergency Contacts**
- **Technical Support**: tech@aapatt.emergency
- **General Inquiries**: hello@aapatt.emergency

## 🙏 Acknowledgments

- **Hugging Face** for AI model infrastructure
- **Supabase** for database and backend services
- **Firebase** for authentication services
- **Expo** for mobile development platform
- **OpenStreetMap** for mapping services

---

**⚡ Built with ❤️ for saving lives through intelligent technology**

*Aapatt Emergency Superapp - Making emergency services accessible to everyone, everywhere.*