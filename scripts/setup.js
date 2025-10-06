#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 Setting up Aapatt Emergency Superapp...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd()) {
  try {
    log(`Running: ${command}`, 'cyan');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return true;
  } catch (error) {
    log(`Error running command: ${command}`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

function createEnvFile(templatePath, targetPath) {
  if (fs.existsSync(targetPath)) {
    log(`Environment file already exists: ${targetPath}`, 'yellow');
    return;
  }

  if (fs.existsSync(templatePath)) {
    fs.copyFileSync(templatePath, targetPath);
    log(`Created environment file: ${targetPath}`, 'green');
  } else {
    log(`Template not found: ${templatePath}`, 'yellow');
  }
}

async function setupProject() {
  try {
    // 1. Install root dependencies
    log('\n📦 Installing root dependencies...', 'blue');
    if (!runCommand('npm install')) {
      throw new Error('Failed to install root dependencies');
    }

    // 2. Setup Backend
    log('\n🔧 Setting up backend...', 'blue');
    if (!runCommand('npm install', './backend')) {
      throw new Error('Failed to install backend dependencies');
    }
    
    createEnvFile('./backend/.env.example', './backend/.env');
    
    log('Backend setup complete!', 'green');

    // 3. Setup Citizen App
    log('\n📱 Setting up citizen app...', 'blue');
    if (!runCommand('npm install', './citizen-app')) {
      throw new Error('Failed to install citizen app dependencies');
    }
    
    log('Citizen app setup complete!', 'green');

    // 4. Setup Provider App
    log('\n🚑 Setting up provider app...', 'blue');
    if (!runCommand('npm install', './provider-app')) {
      throw new Error('Failed to install provider app dependencies');
    }
    
    log('Provider app setup complete!', 'green');

    // 5. Setup Admin Dashboard
    log('\n💻 Setting up admin dashboard...', 'blue');
    if (!runCommand('npm install', './admin-dashboard')) {
      throw new Error('Failed to install admin dashboard dependencies');
    }
    
    log('Admin dashboard setup complete!', 'green');

    // 6. Setup Shared Package
    log('\n📦 Setting up shared package...', 'blue');
    if (!runCommand('npm install', './shared')) {
      throw new Error('Failed to install shared package dependencies');
    }
    
    log('Shared package setup complete!', 'green');

    // 7. Create database (if Prisma is available)
    log('\n🗄️ Setting up database...', 'blue');
    try {
      runCommand('npx prisma generate', './backend');
      log('Database schema generated!', 'green');
    } catch (error) {
      log('Database setup skipped (Prisma not configured)', 'yellow');
    }

    // 8. Success message
    log('\n🎉 Aapatt Emergency Superapp setup complete!', 'green');
    log('\nNext steps:', 'bright');
    log('1. Configure your environment variables in backend/.env', 'cyan');
    log('2. Set up your database (PostgreSQL with Supabase recommended)', 'cyan');
    log('3. Run "npm run dev:backend" to start the backend server', 'cyan');
    log('4. Run "npm run dev:admin" to start the admin dashboard', 'cyan');
    log('5. Run "npm run dev:citizen" to start the citizen app', 'cyan');
    log('6. Run "npm run dev:provider" to start the provider app', 'cyan');
    
    log('\n📚 For detailed setup instructions, see docs/SETUP.md', 'blue');
    log('🚀 Happy coding!', 'magenta');

  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run setup
setupProject();