#!/bin/bash

# Aapatt Emergency Superapp Setup Script
echo "🚨 Setting up Aapatt Emergency Superapp..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install shared dependencies
echo "📦 Installing shared dependencies..."
cd shared
npm install
cd ..

# Install citizen app dependencies
echo "📱 Installing citizen app dependencies..."
cd citizen-app
npm install
cd ..

# Install provider app dependencies
echo "🚑 Installing provider app dependencies..."
cd provider-app
npm install
cd ..

# Install admin dashboard dependencies
echo "💻 Installing admin dashboard dependencies..."
cd admin-dashboard
npm install
cd ..

# Create environment files
echo "⚙️ Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from template"
    echo "⚠️  Please update backend/.env with your actual configuration"
fi

# Citizen app .env
if [ ! -f "citizen-app/.env" ]; then
    cat > citizen-app/.env << EOF
API_URL=http://localhost:3000
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=aapatt-emergency.firebaseapp.com
FIREBASE_PROJECT_ID=aapatt-emergency
FIREBASE_STORAGE_BUCKET=aapatt-emergency.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF
    echo "✅ Created citizen-app/.env from template"
    echo "⚠️  Please update citizen-app/.env with your actual Firebase configuration"
fi

# Provider app .env
if [ ! -f "provider-app/.env" ]; then
    cp citizen-app/.env provider-app/.env
    echo "✅ Created provider-app/.env from template"
fi

# Admin dashboard .env
if [ ! -f "admin-dashboard/.env" ]; then
    cat > admin-dashboard/.env << EOF
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Aapatt Admin
EOF
    echo "✅ Created admin-dashboard/.env from template"
fi

# Create database
echo "🗄️ Setting up database..."
cd backend
npx prisma generate
echo "✅ Generated Prisma client"
echo "⚠️  Please run 'npx prisma migrate dev' to create the database schema"
cd ..

# Create assets directory for citizen app
echo "🎨 Creating app assets..."
mkdir -p citizen-app/assets
mkdir -p provider-app/assets
mkdir -p admin-dashboard/public

# Create placeholder assets
echo "📱 Creating placeholder app icons..."

# Create a simple icon (you would replace this with actual icons)
cat > citizen-app/assets/icon.png << 'EOF'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
EOF

cp citizen-app/assets/icon.png provider-app/assets/icon.png
cp citizen-app/assets/icon.png admin-dashboard/public/favicon.ico

echo "✅ Created placeholder assets"

# Create README files
echo "📚 Creating documentation..."

cat > SETUP.md << 'EOF'
# Aapatt Emergency Superapp Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Expo CLI
- PostgreSQL database
- Firebase project
- Supabase account (for database hosting)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aapatt
   ```

2. **Run setup script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Configure environment variables**
   - Update `backend/.env` with your database and Firebase credentials
   - Update `citizen-app/.env` with your Firebase configuration
   - Update `provider-app/.env` with your Firebase configuration
   - Update `admin-dashboard/.env` with your API URL

4. **Set up database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start development servers**
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

## Services Setup

### Database (Supabase)
1. Create a new project on Supabase
2. Get your database URL and anon key
3. Update `backend/.env` with these values

### Firebase Authentication
1. Create a new Firebase project
2. Enable Phone Authentication
3. Get your Firebase config
4. Update app `.env` files with Firebase config

### AI Services (Hugging Face)
1. Create a Hugging Face account
2. Get your API key
3. Update `backend/.env` with your API key

## Testing

- **Citizen App**: Install Expo Go on your phone and scan the QR code
- **Provider App**: Install Expo Go on your phone and scan the QR code
- **Admin Dashboard**: Open http://localhost:3001 in your browser
- **Backend API**: Test endpoints at http://localhost:3000

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## Troubleshooting

- Make sure all environment variables are set correctly
- Check that all services are running on the correct ports
- Verify database connection and schema
- Check Firebase configuration and permissions
EOF

echo "✅ Created SETUP.md"

cat > DEPLOYMENT.md << 'EOF'
# Aapatt Emergency Superapp Deployment Guide

## Free Tier Deployment

This guide covers deploying Aapatt using free tier services to minimize costs.

## Services Used

- **Database**: Supabase (500MB free)
- **Backend**: Render (free tier)
- **Frontend**: Vercel (unlimited for hobby)
- **Mobile**: Expo (free tier)
- **Authentication**: Firebase (free tier)

## Step 1: Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy your database URL and anon key
5. Update `backend/.env` with these values

## Step 2: Backend Deployment (Render)

1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create a new Web Service
4. Use these settings:
   - Build Command: `cd backend && npm install && npx prisma generate`
   - Start Command: `cd backend && npm start`
   - Environment Variables:
     - `DATABASE_URL`: Your Supabase database URL
     - `JWT_SECRET`: Generate a secure random string
     - `NODE_ENV`: production
5. Deploy the service

## Step 3: Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set up the admin dashboard:
   - Root Directory: `admin-dashboard`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL
5. Deploy

## Step 4: Mobile App Deployment (Expo)

1. Install Expo CLI: `npm install -g @expo/cli`
2. Login to Expo: `expo login`
3. Build the apps:
   ```bash
   # Citizen App
   cd citizen-app
   expo build:android
   expo build:ios

   # Provider App
   cd provider-app
   expo build:android
   expo build:ios
   ```
4. Download the APK/IPA files
5. Distribute through app stores or direct download

## Step 5: Environment Configuration

Update all environment files with production URLs:

- Backend: Use Render URL
- Citizen App: Use Render URL for API
- Provider App: Use Render URL for API
- Admin Dashboard: Use Vercel URL

## Step 6: Database Migration

1. Connect to your production database
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Monitoring

- Use Render's built-in monitoring
- Set up UptimeRobot for uptime monitoring
- Monitor Supabase usage to stay within free tier

## Scaling

When you outgrow the free tier:
- Upgrade Supabase plan for more database storage
- Upgrade Render plan for better performance
- Consider using AWS or Google Cloud for production

## Security

- Use HTTPS for all communications
- Implement proper CORS policies
- Use environment variables for all secrets
- Regular security updates
- Monitor for suspicious activity

## Backup

- Supabase provides automatic backups
- Export data regularly
- Keep code in version control
- Document all configurations
EOF

echo "✅ Created DEPLOYMENT.md"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update environment files with your actual configuration"
echo "2. Set up your database: cd backend && npx prisma migrate dev"
echo "3. Start development: npm run dev:backend (in separate terminals)"
echo "4. Read SETUP.md for detailed instructions"
echo ""
echo "Happy coding! 🚨"