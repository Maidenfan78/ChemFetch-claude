#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const projects = [
  { name: 'Mobile App', path: 'chemfetch-mobile-claude' },
  { name: 'Client Hub', path: 'chemfetch-client-hub-claude' },
  { name: 'Backend', path: 'chemfetch-backend-claude' },
];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, cwd, silent = false) {
  try {
    const result = execSync(command, {
      cwd,
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8',
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function runFormatForProject(project, check = false) {
  log(`\n📂 ${check ? 'Checking' : 'Formatting'} ${project.name}...`, colors.yellow);
  
  if (!fs.existsSync(project.path)) {
    log(`❌ Directory ${project.path} not found`, colors.red);
    return false;
  }
  
  const packageJsonPath = path.join(project.path, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ No package.json found in ${project.name}`, colors.red);
    return false;
  }
  
  const command = check ? 'npm run format:check' : 'npm run format';
  const result = runCommand(command, project.path);
  
  if (result.success) {
    log(`✅ ${project.name} formatting ${check ? 'is correct' : 'completed'}`, colors.green);
    return true;
  } else {
    log(`❌ ${project.name} formatting ${check ? 'issues found' : 'failed'}`, colors.red);
    if (check) {
      log(`💡 Run 'npm run format' in ${project.path} to fix formatting`, colors.cyan);
    }
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const help = args.includes('--help');
  
  if (help) {
    log('Usage: node scripts/format-all.js [--check] [--help]', colors.cyan);
    log('');
    log('Options:');
    log('  --check  Check formatting without making changes');
    log('  --help   Show this help message');
    return;
  }
  
  log('🎨 ChemFetch Formatting Suite', colors.blue + colors.bright);
  log('=================================');
  
  if (check) {
    log('🔍 Checking formatting for all projects', colors.blue);
  } else {
    log('🎨 Formatting all projects', colors.blue);
  }
  
  let allProjectsPassed = true;
  
  for (const project of projects) {
    const projectPassed = runFormatForProject(project, check);
    if (!projectPassed) {
      allProjectsPassed = false;
    }
  }
  
  log('\n🎉 Formatting suite completed!', colors.blue + colors.bright);
  
  if (check && !allProjectsPassed) {
    log('💡 Run without --check to automatically fix formatting', colors.cyan);
    process.exit(1);
  }
}

main();
