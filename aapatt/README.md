# 🚨 Aapatt Emergency Superapp

> **आपत्ति** (Aapatt) - Emergency Services at Your Fingertips

A comprehensive emergency response superapp designed for developing countries, built with React Native, React, Node.js, and free-tier cloud services.

## 🌟 Features

### 🚑 **Citizen App** (React Native/Expo)
- **Emergency Buttons**: Large, accessible buttons for Ambulance, Fire Brigade, and Air Ambulance
- **Real-time Tracking**: Live GPS tracking of responding emergency vehicles
- **AI First-Aid Assistant**: Camera-based injury detection with step-by-step guidance
- **Offline Support**: Basic functionality works without internet connection
- **Emergency History**: Track past emergency requests and responses

### 🚒 **Provider App** (React Native/Expo)
- **Secure Authentication**: Phone number OTP verification
- **Request Management**: Accept/decline emergency requests with timeout handling
- **Live Navigation**: Turn-by-turn directions to emergency locations
- **Status Updates**: Real-time status broadcasting (En Route → Arrived → Completed)
- **Performance Tracking**: Job history and response time analytics

### 💻 **Admin Dashboard** (React Web)
- **Live Emergency Map**: Real-time visualization of all active emergencies
- **Provider Management**: Monitor and manage emergency service providers
- **Analytics & Reporting**: Response times, service breakdowns, and performance metrics
- **Manual Assignment**: Coordinator intervention for complex emergencies
- **System Health Monitoring**: Real-time system status and alerts

### 🔧 **Backend API** (Node.js/Express)
- **RESTful API**: Comprehensive endpoints for all applications
- **Socket.IO Integration**: Real-time communication between all apps
- **PostGIS Support**: Advanced geospatial queries for location-based services
- **Firebase Auth**: Secure phone number authentication
- **AI Integration**: Hugging Face models for first-aid assistance

## 🛠️ Tech Stack

### **Frontend**
- **Mobile Apps**: React Native with Expo (iOS/Android)
- **Admin Dashboard**: React with Next.js/Vite
- **UI Library**: React Native Elements + TailwindCSS
- **Maps**: React Native Maps with OpenStreetMap
- **Real-time**: Socket.IO client

### **Backend**
- **API Server**: Node.js with Express.js
- **Database**: PostgreSQL with PostGIS (Supabase free tier)
- **Authentication**: Firebase Auth (phone OTP)
- **Real-time**: Socket.IO server
- **AI Integration**: Hugging Face Inference API (free tier)

### **Infrastructure (Free Tier)**
- **Database**: Supabase (500MB free)
- **Backend Hosting**: Render (free tier)
- **Frontend Hosting**: Vercel (unlimited for hobby)
- **Mobile Distribution**: Expo builds (free tier)
- **Authentication**: Firebase Auth (free tier)

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Expo CLI**: `npm install -g @expo/cli`
- **Git** for version control

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd aapatt

# Install backend dependencies
cd backend
npm install

# Install citizen app dependencies
cd ../citizen-app
npm install

# Install provider app dependencies
cd ../provider-app
npm install

# Install admin dashboard dependencies
cd ../admin-dashboard
npm install

# Install shared utilities (if using)
cd ../shared
npm install
```

### 2. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/aapatt_db"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"

# Firebase
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"

# AI
HUGGING_FACE_API_KEY="hf_your_api_key"
```

#### Mobile Apps Configuration
```bash
cd citizen-app
cp .env.example .env
```

Edit `.env` with your configuration:
```env
API_URL=http://localhost:3000
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
```

### 3. Database Setup

#### Using Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Go to Settings > Database
   - Copy connection string

2. **Update Database Schema**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

#### Local PostgreSQL (Alternative)

```bash
# Install PostgreSQL locally
# Update DATABASE_URL in .env
# Run migrations
cd backend
npx prisma migrate dev
```

### 4. Start Development Servers

#### Terminal 1: Backend API
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

#### Terminal 2: Citizen App
```bash
cd citizen-app
npm start
# Scan QR code with Expo Go app
```

#### Terminal 3: Provider App
```bash
cd provider-app
npm start
# Scan QR code with Expo Go app
```

#### Terminal 4: Admin Dashboard
```bash
cd admin-dashboard
npm run dev
# Opens in browser at http://localhost:3001
```

## 📱 Mobile App Setup

### Install Expo Go App
- **iOS**: Download from App Store
- **Android**: Download from Google Play Store

### Development
1. Start the development server: `npm start`
2. Scan QR code with Expo Go camera
3. App loads on your device

### Production Build
```bash
# Build for production
npx expo build:ios    # iOS
npx expo build:android # Android

# Or use EAS Build (recommended)
npx eas build --platform ios
npx eas build --platform android
```

## 🔧 Firebase Setup

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com)
- Create new project
- Enable Authentication → Phone Number

### 2. Generate Service Account Key
- Go to Project Settings > Service Accounts
- Generate new private key
- Copy contents to `FIREBASE_PRIVATE_KEY` in `.env`

### 3. Update Configuration
```javascript
// In your mobile apps
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
};

const app = initializeApp(firebaseConfig);
```

## 🤖 AI Integration Setup

### Hugging Face Setup
1. **Create Account**: [huggingface.co](https://huggingface.co)
2. **Get API Key**: Settings > Access Tokens
3. **Choose Model**: Use `google/vit-base-patch16-224` for image classification

### Update Environment
```env
HUGGING_FACE_API_KEY="hf_your_api_key_here"
HUGGING_FACE_MODEL_URL="https://api-inference.huggingface.co/models/google/vit-base-patch16-224"
```

## 📊 Deployment

### Backend (Render)
1. **Connect Repository**: Connect to GitHub
2. **Environment Variables**: Add all `.env` variables
3. **Build Command**: `npm install && npx prisma generate`
4. **Start Command**: `npm start`

### Frontend (Vercel)
1. **Import Project**: Connect to GitHub
2. **Build Settings**: Auto-detected for React apps
3. **Environment Variables**: Add API URLs

### Database (Supabase)
1. **Create Project**: [supabase.com](https://supabase.com)
2. **Import Schema**: Use provided SQL schema
3. **Configure RLS**: Enable Row Level Security policies

## 🗂️ Project Structure

```
aapatt/
├── 📱 citizen-app/          # React Native citizen app
│   ├── src/
│   │   ├── screens/         # App screens
│   │   ├── components/      # Reusable components
│   │   ├── services/        # API and utility services
│   │   └── navigation/      # Navigation configuration
│   └── App.js
├── 🚑 provider-app/         # React Native provider app
├── 💻 admin-dashboard/      # React web dashboard
├── 🔧 backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.js         # Server entry point
│   ├── prisma/              # Database schema
│   └── package.json
├── 📦 shared/               # Shared utilities
├── 📚 docs/                 # Documentation
└── 🛠️ scripts/             # Setup scripts
```

## 🔐 Authentication Flow

### Citizen/Provider Registration
1. **Phone Verification**: Enter phone number → Receive OTP
2. **OTP Verification**: Enter 6-digit code → JWT token issued
3. **Profile Creation**: Basic profile information stored

### Provider Registration
1. **Role Upgrade**: Citizens can register as providers
2. **Verification**: License number and vehicle information
3. **Approval**: Admin approval for provider status

## 🚨 Emergency Request Flow

### 1. Citizen Creates Request
- Select emergency type (Medical/Fire/Air)
- Auto-detect location with manual override
- Add description and priority level

### 2. Provider Notification
- Nearest available providers notified
- Request details with distance and ETA
- Accept/decline with timeout (30 seconds)

### 3. Real-time Tracking
- Provider location updates every 10 seconds
- Citizen sees live map with ETA
- Status updates: En Route → Arrived → Completed

### 4. Completion
- Provider marks request as completed
- Rating and feedback collection
- Request moved to history

## 🎨 Branding Guidelines

| Element | Value | Usage |
|---------|--------|-------|
| **App Name** | Aapatt (आपत्ति) | All headers and icons |
| **Tagline** | "Saving lives through intelligent technology" | Marketing materials |
| **Primary Color** | `#E53935` (Emergency Red) | Emergency buttons, alerts |
| **Secondary Color** | `#1565C0` (Trust Blue) | Provider app, admin dashboard |
| **Accent Color** | `#FFEB3B` (Alert Yellow) | Warnings, notifications |

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **Location Privacy**: User location only shared during emergencies
- **Data Encryption**: Sensitive data encrypted at rest

## 📈 Monitoring & Analytics

- **Real-time Metrics**: Active emergencies, provider availability
- **Performance Tracking**: Response times, completion rates
- **Geographic Analysis**: Emergency hotspots and trends
- **Provider Analytics**: Individual and team performance
- **System Health**: API uptime and error monitoring

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Mobile app tests
cd citizen-app
npm test

# E2E tests (if configured)
npm run test:e2e
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/send-otp` - Send verification code
- `POST /auth/verify-otp` - Verify code and login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile

### Emergency Endpoints
- `POST /requests` - Create emergency request
- `GET /requests/my-requests` - Get user's requests
- `POST /requests/:id/cancel` - Cancel request

### Provider Endpoints
- `POST /providers/availability` - Update availability
- `POST /providers/accept-request/:id` - Accept request
- `POST /providers/update-status/:id` - Update request status

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

### Code Style
- Use ESLint for JavaScript/React Native
- Follow React Native best practices
- Write comprehensive tests
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for free PostgreSQL hosting
- **Render** for free backend hosting
- **Vercel** for free frontend hosting
- **Firebase** for free authentication
- **Hugging Face** for free AI models
- **Expo** for cross-platform mobile development

## 📞 Support

For support and questions:
- **Email**: support@aapatt.app
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

## 🎯 Roadmap

### Phase 1 (MVP) ✅
- Basic emergency request system
- Real-time location tracking
- Provider notification system
- Admin dashboard

### Phase 2 (Enhancement)
- Advanced AI injury detection
- Multi-language support
- Offline first-aid guides
- Integration with local emergency services

### Phase 3 (Scale)
- Machine learning for emergency prediction
- Community emergency networks
- IoT device integration
- Advanced analytics and reporting

---

**Built with ❤️ for emergency responders and communities worldwide**