#!/bin/bash

# Aapatt Setup Script
# This script sets up the development environment for the Aapatt project

echo "🚀 Setting up Aapatt Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."

# Shared package
echo "  📦 Installing shared package dependencies..."
cd shared && npm install && cd ..

# Backend
echo "  📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Citizen app
echo "  📦 Installing citizen app dependencies..."
cd citizen-app && npm install && cd ..

# Provider app  
echo "  📦 Installing provider app dependencies..."
cd provider-app && npm install && cd ..

# Admin dashboard
echo "  📦 Installing admin dashboard dependencies..."
cd admin-dashboard && npm install && cd ..

# Create environment files
echo "🔧 Creating environment files..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "  ✅ Created backend/.env from example"
    echo "  ⚠️  Please update backend/.env with your actual credentials"
fi

# Build shared package
echo "🔨 Building shared package..."
cd shared && npm run build && cd ..

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
cd backend && npx prisma generate && cd ..

echo "✅ Setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Update backend/.env with your database and API credentials"
echo "2. Run database migrations: cd backend && npx prisma migrate dev"
echo "3. Start development: npm run dev:all"
echo ""
echo "📚 Useful commands:"
echo "  npm run dev:all       - Start backend and admin dashboard"
echo "  npm run dev:backend   - Start backend only"
echo "  npm run dev:admin     - Start admin dashboard only"
echo "  npm run dev:citizen   - Start citizen app (Expo)"
echo "  npm run dev:provider  - Start provider app (Expo)"
echo ""
echo "🌐 Development URLs:"
echo "  Backend API:     http://localhost:3000"
echo "  Admin Dashboard: http://localhost:3001"
echo "  Citizen App:     expo://localhost:19000"
echo "  Provider App:    expo://localhost:19001"