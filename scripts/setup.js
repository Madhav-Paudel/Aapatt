#!/usr/bin/env node

/**
 * Aapatt Emergency Superapp - Setup Script
 * Automated setup for development environment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚑 Setting up Aapatt Emergency Superapp...\n');

// Check Node.js version
const nodeVersion = process.version;
const requiredVersion = 'v18.0.0';
if (nodeVersion < requiredVersion) {
  console.error(`❌ Node.js ${requiredVersion} or higher is required. Current: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  fs.copyFileSync(envExamplePath, envPath);
  console.log('✅ .env file created. Please configure your environment variables.');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  console.log('✅ Root dependencies installed');

  // Install backend dependencies
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'backend') });
  console.log('✅ Backend dependencies installed');

  // Install shared dependencies
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'shared') });
  console.log('✅ Shared dependencies installed');

  // Install citizen app dependencies
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'citizen-app') });
  console.log('✅ Citizen app dependencies installed');

} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Setup complete
console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Configure your .env file with database and API keys');
console.log('2. Run database migrations: cd backend && npm run db:migrate');
console.log('3. Start development servers:');
console.log('   - Backend: npm run dev:backend');
console.log('   - Citizen App: npm run dev:citizen');
console.log('   - Admin Dashboard: npm run dev:admin');
console.log('\n🚨 Ready to save lives with Aapatt Emergency Superapp!');