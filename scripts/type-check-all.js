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

function runTypeCheckForProject(project) {
  log(`\n📂 Type checking ${project.name}...`, colors.yellow);
  
  if (!fs.existsSync(project.path)) {
    log(`❌ Directory ${project.path} not found`, colors.red);
    return false;
  }
  
  const packageJsonPath = path.join(project.path, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ No package.json found in ${project.name}`, colors.red);
    return false;
  }
  
  const result = runCommand('npm run type-check', project.path);
  
  if (result.success) {
    log(`✅ ${project.name} type checking passed`, colors.green);
    return true;
  } else {
    log(`❌ ${project.name} type checking failed`, colors.red);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  const help = args.includes('--help');
  
  if (help) {
    log('Usage: node scripts/type-check-all.js [--help]', colors.cyan);
    log('');
    log('Options:');
    log('  --help   Show this help message');
    return;
  }
  
  log('🔍 ChemFetch Type Checking Suite', colors.blue + colors.bright);
  log('=================================');
  log('🔍 Running type checks for all projects', colors.blue);
  
  let allProjectsPassed = true;
  
  for (const project of projects) {
    const projectPassed = runTypeCheckForProject(project);
    if (!projectPassed) {
      allProjectsPassed = false;
    }
  }
  
  log('\n🎉 Type checking suite completed!', colors.blue + colors.bright);
  
  if (!allProjectsPassed) {
    log('💡 Fix TypeScript errors in the failing projects', colors.cyan);
    process.exit(1);
  }
}

main();
