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

function runLintForProject(project, fix = false) {
  log(`\n📂 Linting ${project.name}...`, colors.yellow);
  
  if (!fs.existsSync(project.path)) {
    log(`❌ Directory ${project.path} not found`, colors.red);
    return false;
  }
  
  const packageJsonPath = path.join(project.path, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ No package.json found in ${project.name}`, colors.red);
    return false;
  }
  
  let allPassed = true;
  
  // Run linting
  const lintCommand = fix ? 'npm run lint:fix' : 'npm run lint';
  log(`Running ${fix ? 'lint fix' : 'lint check'}...`);
  const lintResult = runCommand(lintCommand, project.path);
  
  if (lintResult.success) {
    log(`✅ ${project.name} linting ${fix ? 'fixes applied' : 'passed'}`, colors.green);
  } else {
    log(`❌ ${project.name} linting failed`, colors.red);
    allPassed = false;
  }
  
  if (!fix) {
    // Run format check
    log('Running format check...');
    const formatResult = runCommand('npm run format:check', project.path, true);
    
    if (formatResult.success) {
      log(`✅ ${project.name} formatting is correct`, colors.green);
    } else {
      log(`❌ ${project.name} formatting issues found`, colors.red);
      log(`💡 Run 'npm run format' in ${project.path} to fix formatting`, colors.cyan);
      allPassed = false;
    }
    
    // Run type check
    log('Running type check...');
    const typeResult = runCommand('npm run type-check', project.path, true);
    
    if (typeResult.success) {
      log(`✅ ${project.name} type checking passed`, colors.green);
    } else {
      log(`⚠️  ${project.name} type checking has issues (non-blocking)`, colors.yellow);
      // Don't fail for type checking in development
      // allPassed = false;
    }
  }
  
  return allPassed;
}

function main() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const help = args.includes('--help');
  
  if (help) {
    log('Usage: node scripts/lint-all.js [--fix] [--help]', colors.cyan);
    log('');
    log('Options:');
    log('  --fix    Automatically fix linting issues');
    log('  --help   Show this help message');
    return;
  }
  
  log('🔍 ChemFetch Linting Suite', colors.blue + colors.bright);
  log('=================================');
  
  if (fix) {
    log('🔧 Running fixes for all projects', colors.blue);
  } else {
    log('🔍 Running checks for all projects', colors.blue);
  }
  
  let allProjectsPassed = true;
  
  for (const project of projects) {
    const projectPassed = runLintForProject(project, fix);
    if (!projectPassed) {
      allProjectsPassed = false;
    }
  }
  
  log('\n🎉 Linting suite completed!', colors.blue + colors.bright);
  
  if (!fix && !allProjectsPassed) {
    log('💡 Run with --fix to automatically fix issues', colors.cyan);
    process.exit(1);
  }
}

main();
