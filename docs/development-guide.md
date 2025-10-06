# Development Guide

## 🏗️ Project Overview

Aapatt is an emergency response system built with modern free-tier technologies:

- **Frontend**: React Native (Expo) for mobile apps, React for admin dashboard
- **Backend**: Node.js with Express, PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO and Supabase Realtime
- **Authentication**: Firebase Auth with phone number OTP
- **AI**: Hugging Face free APIs for first-aid analysis
- **Hosting**: Render (backend), Vercel (frontend), Supabase (database)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- VS Code (recommended)
- Expo CLI (for mobile development)

### Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd aapatt

# Run setup script
# Windows:
scripts\setup.bat

# macOS/Linux:
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:
npm install
npm run setup:workspaces
```

### Environment Configuration
1. Copy `backend/.env.example` to `backend/.env`
2. Update with your credentials:
   - Database URL (Supabase)
   - Firebase credentials
   - Hugging Face API key
   - JWT secrets

### Start Development
```bash
# Start all services
npm run dev:all

# Or individually:
npm run dev:backend    # Backend API on :3000
npm run dev:admin      # Admin dashboard on :3001
npm run dev:citizen    # Citizen mobile app (Expo)
npm run dev:provider   # Provider mobile app (Expo)
```

## 📁 Project Structure

```
aapatt/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── index.ts            # App entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
│
├── citizen-app/                # React Native (Expo) - Citizens
│   ├── src/
│   │   ├── screens/            # App screens
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API calls
│   │   ├── utils/              # Helper functions
│   │   └── navigation/         # Navigation setup
│   └── App.js
│
├── provider-app/               # React Native (Expo) - Providers
│   ├── src/
│   │   ├── screens/            # App screens
│   │   ├── components/         # Reusable components
│   │   └── services/           # API calls
│   └── App.js
│
├── admin-dashboard/            # React Admin Panel
│   ├── src/
│   │   ├── pages/              # Dashboard pages
│   │   ├── components/         # UI components
│   │   └── services/           # API calls
│   └── package.json
│
├── shared/                     # Shared types and utilities
│   ├── src/
│   │   ├── types.ts            # TypeScript types
│   │   ├── constants.ts        # App constants
│   │   └── utils.ts            # Utility functions
│   └── package.json
│
├── docs/                       # Documentation
│   ├── api-documentation.md    # API endpoints
│   ├── database-schema.md      # Database design
│   └── deployment-guide.md     # Deployment instructions
│
└── scripts/                    # Build and setup scripts
```

## 🛠️ Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test locally
npm run test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Database Changes

```bash
# Modify schema in prisma/schema.prisma

# Generate migration
cd backend
npx prisma migrate dev --name add_new_table

# Generate client
npx prisma generate

# Apply to production
npx prisma migrate deploy
```

### 3. API Development

```bash
# 1. Add types in shared/src/types.ts
# 2. Create controller in backend/src/controllers/
# 3. Add routes in backend/src/routes/
# 4. Update API documentation
# 5. Test with Postman or curl
```

### 4. Mobile App Development

```bash
# Start Expo development server
cd citizen-app
npm start

# Test on device
# - Install Expo Go app
# - Scan QR code

# Build for testing
expo build:android
expo build:ios
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### API Testing
```bash
# Manual testing with curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'

# Or use Postman collection (docs/postman-collection.json)
```

### Mobile Testing
```bash
# Unit tests
cd citizen-app
npm test

# E2E testing with Detox (optional)
npx detox test
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=your-secret
FIREBASE_PROJECT_ID=...

# External APIs
HUGGING_FACE_API_KEY=...

# Server
PORT=3000
NODE_ENV=development
```

#### Mobile Apps
```javascript
// app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      firebaseConfig: {
        // Firebase config
      }
    }
  }
};
```

### Firebase Setup
1. Create Firebase project
2. Enable Authentication (Phone)
3. Enable Cloud Messaging
4. Download service account key
5. Update environment variables

### Supabase Setup
1. Create Supabase project
2. Copy database URL
3. Enable PostGIS extension
4. Enable realtime for tables
5. Configure row-level security

## 📱 Mobile Development

### Key Libraries
- **Expo**: Development platform
- **React Navigation**: Navigation
- **React Native Maps**: Map integration
- **Expo Camera**: Camera access
- **Expo Location**: GPS tracking
- **Socket.IO Client**: Real-time updates

### Features Implementation

#### Emergency Request Flow
```javascript
// 1. Get user location
const location = await Location.getCurrentPositionAsync();

// 2. Create request
const request = await api.createEmergencyRequest({
  type: 'AMBULANCE',
  location: location.coords,
  description: 'Medical emergency'
});

// 3. Join real-time room
socket.emit('join_room', `request_${request.id}`);

// 4. Listen for updates
socket.on('request_assigned', (data) => {
  // Show assigned provider
});
```

#### Provider Location Tracking
```javascript
// Start location tracking
const subscription = await Location.watchPositionAsync(
  {
    accuracy: Location.Accuracy.High,
    timeInterval: 10000, // 10 seconds
    distanceInterval: 10, // 10 meters
  },
  (location) => {
    // Send to server
    socket.emit('provider_location_update', {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
  }
);
```

#### AI Camera Integration
```javascript
// Capture and analyze image
const captureAndAnalyze = async () => {
  const photo = await camera.takePictureAsync({
    base64: true,
    quality: 0.7
  });
  
  const analysis = await api.analyzeImage({
    imageBase64: photo.base64,
    location: currentLocation
  });
  
  // Show first aid guidance
  showFirstAidSteps(analysis.firstAidSteps);
};
```

## 🌐 API Development

### RESTful API Design
- **GET /api/requests** - List requests
- **POST /api/requests/create** - Create request
- **PUT /api/requests/:id** - Update request
- **DELETE /api/requests/:id** - Cancel request

### WebSocket Events
- **request_created** - New emergency request
- **request_assigned** - Provider assigned
- **provider_location_update** - Live tracking
- **request_status_update** - Status changes

### Error Handling
```javascript
// Consistent error format
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Phone number is required"
}
```

## 🚀 Performance Optimization

### Backend
- Database connection pooling
- Response caching with Redis
- Image compression
- API rate limiting
- Query optimization

### Mobile Apps
- Code splitting
- Image optimization
- Offline caching
- Bundle size optimization
- Lazy loading

### Database
- Proper indexing
- Query optimization
- Connection pooling
- Regular maintenance

## 🔒 Security Best Practices

### Authentication
- JWT tokens with expiration
- Phone number verification
- Rate limiting on auth endpoints
- Secure token storage

### Data Protection
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet security headers

### API Security
- Rate limiting
- Request size limits
- Authentication middleware
- Error message sanitization

## 🐛 Debugging

### Backend Debugging
```bash
# Debug mode
DEBUG=* npm run dev

# VS Code debugging
# Use launch.json configuration

# Logging
console.log('Debug info:', data);
```

### Mobile Debugging
```bash
# React Native Debugger
npm install -g react-native-debugger

# Expo debugging
expo start --tunnel
# Use browser debugger
```

### Database Debugging
```bash
# Prisma Studio
npx prisma studio

# Raw queries
npx prisma db seed
```

## 📊 Monitoring

### Development
- Console logging
- React DevTools
- Network monitoring
- Performance profiling

### Production
- Error tracking (Sentry)
- Performance monitoring
- Log aggregation
- Uptime monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Render
        # Auto-deployment configured
```

### Deployment Strategy
- **Development**: Auto-deploy on push to `develop`
- **Staging**: Auto-deploy on push to `staging`
- **Production**: Manual deployment with approval

## 📚 Resources

### Documentation
- [API Documentation](./api-documentation.md)
- [Database Schema](./database-schema.md)
- [Deployment Guide](./deployment-guide.md)

### External Resources
- [React Native Docs](https://reactnative.dev/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Express.js Guide](https://expressjs.com/en/guide)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Community
- GitHub Issues for bug reports
- Discord/Slack for discussions
- Code reviews for quality assurance