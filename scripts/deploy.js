#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying Aapatt Emergency Superapp...\n');

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

async function deployProject() {
  try {
    log('Building all applications...', 'blue');
    
    // Build backend
    log('\n🔧 Building backend...', 'blue');
    if (!runCommand('npm run build', './backend')) {
      throw new Error('Failed to build backend');
    }

    // Build admin dashboard
    log('\n💻 Building admin dashboard...', 'blue');
    if (!runCommand('npm run build', './admin-dashboard')) {
      throw new Error('Failed to build admin dashboard');
    }

    // Build citizen app
    log('\n📱 Building citizen app...', 'blue');
    if (!runCommand('npm run build', './citizen-app')) {
      throw new Error('Failed to build citizen app');
    }

    // Build provider app
    log('\n🚑 Building provider app...', 'blue');
    if (!runCommand('npm run build', './provider-app')) {
      throw new Error('Failed to build provider app');
    }

    log('\n✅ All applications built successfully!', 'green');
    
    log('\n📋 Deployment checklist:', 'bright');
    log('1. ✅ Backend built', 'green');
    log('2. ✅ Admin dashboard built', 'green');
    log('3. ✅ Citizen app built', 'green');
    log('4. ✅ Provider app built', 'green');
    
    log('\n🚀 Next steps for deployment:', 'blue');
    log('1. Deploy backend to Render or similar service', 'cyan');
    log('2. Deploy admin dashboard to Vercel or similar service', 'cyan');
    log('3. Deploy mobile apps to app stores via Expo', 'cyan');
    log('4. Configure production environment variables', 'cyan');
    log('5. Set up monitoring and logging', 'cyan');
    
    log('\n📚 See docs/DEPLOYMENT.md for detailed deployment instructions', 'blue');
    log('🎉 Build complete! Ready for deployment.', 'magenta');

  } catch (error) {
    log(`\n❌ Deployment failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run deployment
deployProject();