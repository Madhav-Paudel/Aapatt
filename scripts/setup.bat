@echo off
REM Aapatt Setup Script for Windows
REM This script sets up the development environment for the Aapatt project

echo 🚀 Setting up Aapatt Development Environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install workspace dependencies
echo 📦 Installing workspace dependencies...

REM Shared package
echo   📦 Installing shared package dependencies...
cd shared && npm install && cd ..

REM Backend
echo   📦 Installing backend dependencies...
cd backend && npm install && cd ..

REM Citizen app
echo   📦 Installing citizen app dependencies...
cd citizen-app && npm install && cd ..

REM Provider app
echo   📦 Installing provider app dependencies...
cd provider-app && npm install && cd ..

REM Admin dashboard
echo   📦 Installing admin dashboard dependencies...
cd admin-dashboard && npm install && cd ..

REM Create environment files
echo 🔧 Creating environment files...

if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo   ✅ Created backend\.env from example
    echo   ⚠️  Please update backend\.env with your actual credentials
)

REM Build shared package
echo 🔨 Building shared package...
cd shared && npm run build && cd ..

REM Generate Prisma client
echo 🗄️ Generating Prisma client...
cd backend && npx prisma generate && cd ..

echo ✅ Setup complete!
echo.
echo 🔧 Next steps:
echo 1. Update backend\.env with your database and API credentials
echo 2. Run database migrations: cd backend ^&^& npx prisma migrate dev
echo 3. Start development: npm run dev:all
echo.
echo 📚 Useful commands:
echo   npm run dev:all       - Start backend and admin dashboard
echo   npm run dev:backend   - Start backend only
echo   npm run dev:admin     - Start admin dashboard only
echo   npm run dev:citizen   - Start citizen app (Expo)
echo   npm run dev:provider  - Start provider app (Expo)
echo.
echo 🌐 Development URLs:
echo   Backend API:     http://localhost:3000
echo   Admin Dashboard: http://localhost:3001
echo   Citizen App:     expo://localhost:19000
echo   Provider App:    expo://localhost:19001

pause