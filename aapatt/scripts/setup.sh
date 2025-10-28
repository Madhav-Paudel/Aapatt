#!/bin/bash

# Aapatt Emergency Superapp Setup Script
# This script sets up the complete development environment

set -e

echo "🚨 Setting up Aapatt Emergency Superapp..."
echo "============================================="

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Please install npm"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git is required but not installed. Please install Git"; exit 1; }

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Clone repository if not exists
if [ ! -d ".git" ]; then
    echo "📥 Cloning Aapatt repository..."
    git clone <your-repo-url> .
fi

# Setup backend
echo "🔧 Setting up backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running the backend"
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗃️  Setting up database schema..."
echo "⚠️  Make sure your DATABASE_URL in .env is correct"
read -p "Continue with database setup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma db push
fi

cd ..

# Setup citizen app
echo "📱 Setting up citizen app..."
cd citizen-app

# Install dependencies
echo "📦 Installing citizen app dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API URL and Firebase config"
fi

cd ..

# Setup provider app
echo "🚑 Setting up provider app..."
cd provider-app

# Install dependencies
echo "📦 Installing provider app dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API URL and Firebase config"
fi

cd ..

# Setup admin dashboard
echo "💻 Setting up admin dashboard..."
cd admin-dashboard

# Install dependencies
echo "📦 Installing admin dashboard dependencies..."
npm install

# Copy environment file
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API URL"
fi

cd ..

# Setup shared utilities
echo "📦 Setting up shared utilities..."
cd shared

# Install dependencies
echo "📦 Installing shared utilities dependencies..."
npm install

cd ..

echo "============================================="
echo "✅ Setup completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Configure your environment files (.env) with proper values"
echo "2. Set up Supabase database and update DATABASE_URL"
echo "3. Configure Firebase authentication"
echo "4. Set up Hugging Face API key for AI features"
echo ""
echo "📖 See README.md for detailed configuration instructions"
echo ""
echo "🎯 Quick start:"
echo "   cd backend && npm run dev     # Start backend server"
echo "   cd citizen-app && npm start   # Start citizen app"
echo "   cd provider-app && npm start  # Start provider app"
echo "   cd admin-dashboard && npm run dev  # Start admin dashboard"
echo ""
echo "📱 Mobile apps: Install Expo Go app and scan QR codes"
echo "🌐 Admin dashboard: Opens at http://localhost:3001"
echo ""
echo "Happy coding! 🚨"