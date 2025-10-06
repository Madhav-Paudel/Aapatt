#!/usr/bin/env node

/**
 * Aapatt Setup Script
 * Automated setup for development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log(`
🚨 =====================================
   AAPATT EMERGENCY RESPONSE SYSTEM
   Setup Script
=====================================
`);

async function main() {
  try {
    // Check Node.js version
    console.log('\n📋 Checking prerequisites...');
    const nodeVersion = process.version;
    console.log(`✅ Node.js version: ${nodeVersion}`);

    if (parseInt(nodeVersion.split('.')[0].substring(1)) < 18) {
      console.error('❌ Node.js 18+ required. Please upgrade.');
      process.exit(1);
    }

    // Check if running from project root
    if (!fs.existsSync('package.json')) {
      console.error('❌ Please run this script from the project root directory');
      process.exit(1);
    }

    // Install root dependencies
    console.log('\n📦 Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Install workspace dependencies
    console.log('\n📦 Installing workspace dependencies...');
    const workspaces = ['backend', 'shared', 'citizen-app', 'provider-app', 'admin-dashboard'];
    
    for (const workspace of workspaces) {
      if (fs.existsSync(workspace)) {
        console.log(`\n  → Installing ${workspace}...`);
        execSync(`cd ${workspace} && npm install`, { stdio: 'inherit' });
      }
    }

    // Setup backend environment
    console.log('\n⚙️  Setting up backend environment...');
    const envExample = path.join('backend', '.env.example');
    const envFile = path.join('backend', '.env');

    if (!fs.existsSync(envFile)) {
      console.log('  → Creating .env file from template...');
      fs.copyFileSync(envExample, envFile);
      console.log('  ⚠️  Please edit backend/.env with your credentials');
    } else {
      console.log('  ℹ️  .env file already exists');
    }

    // Database setup
    const setupDB = await question('\n🗄️  Setup database now? (y/n): ');
    
    if (setupDB.toLowerCase() === 'y') {
      console.log('\n  → Generating Prisma client...');
      execSync('cd backend && npx prisma generate', { stdio: 'inherit' });
      
      const runMigrations = await question('  → Run database migrations? (y/n): ');
      if (runMigrations.toLowerCase() === 'y') {
        execSync('cd backend && npx prisma migrate dev --name init', { stdio: 'inherit' });
      }
    }

    // Create placeholder files
    console.log('\n📁 Creating placeholder files...');
    const placeholders = [
      'citizen-app/assets/icon.png',
      'citizen-app/assets/splash.png',
      'provider-app/assets/icon.png',
      'provider-app/assets/splash.png'
    ];

    for (const file of placeholders) {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, '');
        console.log(`  ✅ Created ${file}`);
      }
    }

    console.log(`
✨ =====================================
   SETUP COMPLETE!
=====================================

Next steps:

1. Configure environment variables:
   → Edit backend/.env with your credentials

2. Start development servers:
   → npm run dev:backend      (Terminal 1)
   → npm run dev:admin        (Terminal 2)
   → npm run dev:citizen      (Terminal 3)
   → npm run dev:provider     (Terminal 4)

3. Access applications:
   → Backend API: http://localhost:3000
   → Admin Dashboard: http://localhost:5173
   → Citizen App: Scan QR code with Expo Go
   → Provider App: Scan QR code with Expo Go

📚 Documentation:
   → API: docs/API.md
   → Setup: docs/SETUP.md
   → Deployment: docs/DEPLOYMENT.md

🆘 Need help? Open an issue on GitHub

Happy coding! 🚀
`);

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
