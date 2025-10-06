# 🚨 Aapatt Emergency Superapp - Setup Guide

This guide will help you set up the complete Aapatt emergency response system on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Expo CLI** (for mobile apps) - `npm install -g @expo/cli`

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aapatt
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Admin Dashboard
   npm run dev:admin

   # Terminal 3 - Citizen App
   npm run dev:citizen

   # Terminal 4 - Provider App
   npm run dev:provider
   ```

## 🔧 Detailed Setup

### 1. Backend Setup

The backend is a Node.js/Express API with PostgreSQL database.

#### Environment Configuration

Create `backend/.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/aapatt"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Firebase Configuration
FIREBASE_PROJECT_ID="aapatt-emergency"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@aapatt-emergency.iam.gserviceaccount.com"

# AI Configuration
HUGGING_FACE_API_KEY="hf_your_api_key_here"
HUGGING_FACE_MODEL_URL="https://api-inference.huggingface.co/models/google/vit-base-patch16-224"

# Security
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
BCRYPT_ROUNDS=12

# App Configuration
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000,exp://192.168.1.100:19000"
```

#### Database Setup

1. **Create PostgreSQL database:**
   ```bash
   createdb aapatt
   ```

2. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Seed the database (optional):**
   ```bash
   npm run db:seed
   ```

#### Start Backend Server

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:3000`

### 2. Admin Dashboard Setup

The admin dashboard is a React web application.

#### Environment Configuration

Create `admin-dashboard/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

#### Start Admin Dashboard

```bash
cd admin-dashboard
npm run dev
```

The dashboard will be available at `http://localhost:3001`

**Default Login Credentials:**
- Username: `admin`
- Password: `admin123`

### 3. Citizen App Setup

The citizen app is a React Native/Expo mobile application.

#### Environment Configuration

Update `citizen-app/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000/api",
      "socketUrl": "http://localhost:3000"
    }
  }
}
```

#### Start Citizen App

```bash
cd citizen-app
npm start
```

Scan the QR code with Expo Go app on your mobile device.

### 4. Provider App Setup

The provider app is a React Native/Expo mobile application for emergency service providers.

#### Environment Configuration

Update `provider-app/app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:3000/api",
      "socketUrl": "http://localhost:3000"
    }
  }
}
```

#### Start Provider App

```bash
cd provider-app
npm start
```

Scan the QR code with Expo Go app on your mobile device.

## 🗄️ Database Configuration

### Using Supabase (Recommended)

1. **Create a Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Get your project URL and API keys

2. **Update environment variables:**
   ```env
   DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
   SUPABASE_URL="https://[project-ref].supabase.co"
   SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Using Local PostgreSQL

1. **Install PostgreSQL locally**
2. **Create database:**
   ```bash
   createdb aapatt
   ```
3. **Update DATABASE_URL in backend/.env**
4. **Run migrations:**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## 🔥 Firebase Configuration

1. **Create Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project
   - Enable Authentication with Phone provider

2. **Download service account key:**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as JSON file

3. **Update environment variables:**
   ```env
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   ```

## 🤖 AI Configuration

1. **Get Hugging Face API key:**
   - Go to [huggingface.co](https://huggingface.co)
   - Create account and get API key

2. **Update environment variables:**
   ```env
   HUGGING_FACE_API_KEY="hf_your_api_key_here"
   ```

## 📱 Mobile App Testing

### Using Expo Go (Recommended for Development)

1. **Install Expo Go:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the app:**
   ```bash
   cd citizen-app  # or provider-app
   npm start
   ```

3. **Scan QR code** with Expo Go app

### Using Physical Device

1. **Install Expo CLI:**
   ```bash
   npm install -g @expo/cli
   ```

2. **Build for device:**
   ```bash
   cd citizen-app
   expo build:android  # or expo build:ios
   ```

## 🚀 Production Deployment

### Backend (Render)

1. **Connect GitHub repository to Render**
2. **Set environment variables in Render dashboard**
3. **Deploy automatically on push to main branch**

### Admin Dashboard (Vercel)

1. **Connect GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Mobile Apps (Expo)

1. **Build for production:**
   ```bash
   cd citizen-app
   expo build:android
   expo build:ios
   ```

2. **Submit to app stores:**
   ```bash
   expo submit:android
   expo submit:ios
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Mobile app can't connect to backend:**
   - Check API_URL in app.json
   - Ensure backend is running
   - Check network connectivity

3. **Socket.IO connection failed:**
   - Check SOCKET_URL configuration
   - Ensure backend is running
   - Check firewall settings

4. **Firebase authentication failed:**
   - Verify Firebase configuration
   - Check service account key format
   - Ensure project ID is correct

### Getting Help

- Check the [API Documentation](API.md)
- Review the [Deployment Guide](DEPLOYMENT.md)
- Open an issue on GitHub
- Contact the development team

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Firebase Documentation](https://firebase.google.com/docs/)

---

**🎉 You're all set! The Aapatt Emergency Superapp is ready for development and testing.**