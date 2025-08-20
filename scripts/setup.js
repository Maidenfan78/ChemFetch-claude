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
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, cwd = process.cwd(), silent = false) {
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

function checkNodeVersion() {
  log('🔍 Checking Node.js version...', colors.blue);
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} is compatible`, colors.green);
    return true;
  } else {
    log(`❌ Node.js ${nodeVersion} is too old. Please upgrade to Node.js 18+`, colors.red);
    return false;
  }
}

function setupGitHooks() {
  log('\n🔧 Setting up Git hooks...', colors.blue);
  
  // Check if we're in a git repository
  const gitCheck = runCommand('git rev-parse --git-dir', process.cwd(), true);
  if (!gitCheck.success) {
    log('❌ Not in a Git repository. Git hooks setup skipped.', colors.yellow);
    return false;
  }
  
  // Set hooks path
  const hooksPathResult = runCommand('git config core.hooksPath .githooks', process.cwd(), true);
  if (!hooksPathResult.success) {
    log('❌ Failed to set Git hooks path', colors.red);
    return false;
  }
  
  // Make hooks executable (Unix/Mac only)
  if (process.platform !== 'win32') {
    const chmodResult = runCommand('chmod +x .githooks/pre-commit', process.cwd(), true);
    if (!chmodResult.success) {
      log('⚠️  Could not make pre-commit hook executable', colors.yellow);
    }
  }
  
  log('✅ Git hooks configured successfully', colors.green);
  return true;
}

function installProjectDependencies(projectName, projectPath) {
  log(`\n📦 Installing dependencies for ${projectName}...`, colors.blue);
  
  if (!fs.existsSync(projectPath)) {
    log(`❌ Directory ${projectPath} not found`, colors.red);
    return false;
  }
  
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log(`❌ No package.json found in ${projectName}`, colors.red);
    return false;
  }
  
  const installResult = runCommand('npm install', projectPath);
  if (installResult.success) {
    log(`✅ ${projectName} dependencies installed`, colors.green);
    return true;
  } else {
    log(`❌ Failed to install ${projectName} dependencies`, colors.red);
    return false;
  }
}

function verifyLintingSetup(projectName, projectPath) {
  log(`\n🔍 Verifying linting setup for ${projectName}...`, colors.blue);
  
  const requiredFiles = ['.prettierrc'];
  const eslintConfigs = ['eslint.config.js', 'eslint.config.mjs', 'eslint.config.cjs'];
  let allFilesExist = true;
  
  // Check for .prettierrc
  for (const file of requiredFiles) {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      log(`✅ ${file} exists`, colors.green);
    } else {
      log(`❌ ${file} missing`, colors.red);
      allFilesExist = false;
    }
  }
  
  // Check for ESLint config (any of the supported extensions)
  let eslintConfigExists = false;
  for (const configFile of eslintConfigs) {
    const filePath = path.join(projectPath, configFile);
    if (fs.existsSync(filePath)) {
      log(`✅ ${configFile} exists`, colors.green);
      eslintConfigExists = true;
      break;
    }
  }
  
  if (!eslintConfigExists) {
    log(`❌ ESLint config missing (checked: ${eslintConfigs.join(', ')})`, colors.red);
    allFilesExist = false;
  }
  
  // Check if linting scripts exist in package.json
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
    const requiredScripts = ['lint', 'lint:fix', 'format', 'format:check', 'type-check'];
    
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log(`✅ ${script} script exists`, colors.green);
      } else {
        log(`❌ ${script} script missing`, colors.red);
        allFilesExist = false;
      }
    }
  } catch (error) {
    log(`❌ Could not read package.json for ${projectName}`, colors.red);
    allFilesExist = false;
  }
  
  return allFilesExist;
}

function runInitialLinting() {
  log('\n🧹 Running initial linting check...', colors.blue);
  
  const lintResult = runCommand('node scripts/lint-all.js', process.cwd(), false);
  if (lintResult.success) {
    log('✅ All projects pass linting checks', colors.green);
    return true;
  } else {
    log('⚠️  Some linting issues found. Run `npm run lint:fix` to fix them.', colors.yellow);
    return true; // Don't fail setup for linting issues
  }
}

function displaySummary() {
  log('\n' + '='.repeat(50), colors.cyan);
  log('🎉 ChemFetch Linting Setup Complete!', colors.green + colors.bright);
  log('='.repeat(50), colors.cyan);
  
  log('\n📋 Available Commands:', colors.blue);
  log('  npm run lint          - Check all projects for linting issues', colors.cyan);
  log('  npm run lint:fix      - Fix linting issues automatically', colors.cyan);
  log('  npm run format        - Format all code with Prettier', colors.cyan);
  log('  npm run format:check  - Check code formatting', colors.cyan);
  log('  npm run type-check    - Run TypeScript type checking', colors.cyan);
  log('  npm run install:all   - Install dependencies for all projects', colors.cyan);
  
  log('\n🚀 Development Commands:', colors.blue);
  log('  npm run dev:mobile    - Start mobile development server', colors.cyan);
  log('  npm run dev:client    - Start client development server', colors.cyan);
  log('  npm run dev:backend   - Start backend server', colors.cyan);
  
  log('\n📚 Documentation:', colors.blue);
  log('  See LINTING.md for detailed documentation', colors.cyan);
  log('  Check .vscode/settings.json for VSCode configuration', colors.cyan);
  
  log('\n💡 Next Steps:', colors.blue);
  log('  1. Install VSCode extensions (ESLint, Prettier)', colors.yellow);
  log('  2. Run `npm run lint` to check for any issues', colors.yellow);
  log('  3. Run `npm run lint:fix` to auto-fix issues', colors.yellow);
  log('  4. Start developing with confidence! 🚀', colors.yellow);
}

function main() {
  log('🚀 ChemFetch Linting Setup', colors.magenta + colors.bright);
  log('='.repeat(50), colors.magenta);
  
  // Check Node.js version
  if (!checkNodeVersion()) {
    process.exit(1);
  }
  
  // Install root dependencies
  log('\n📦 Installing root dependencies...', colors.blue);
  const rootInstall = runCommand('npm install', process.cwd());
  if (!rootInstall.success) {
    log('❌ Failed to install root dependencies', colors.red);
    process.exit(1);
  }
  log('✅ Root dependencies installed', colors.green);
  
  // Install project dependencies
  const projects = [
    { name: 'Mobile App', path: 'chemfetch-mobile-claude' },
    { name: 'Client Hub', path: 'chemfetch-client-hub-claude' },
    { name: 'Backend', path: 'chemfetch-backend-claude' },
  ];
  
  let allInstallsSuccessful = true;
  
  for (const project of projects) {
    const installSuccess = installProjectDependencies(project.name, project.path);
    if (!installSuccess) {
      allInstallsSuccessful = false;
    }
  }
  
  if (!allInstallsSuccessful) {
    log('\n❌ Some dependency installations failed. Please check the errors above.', colors.red);
    process.exit(1);
  }
  
  // Verify linting setup
  let allSetupsValid = true;
  
  for (const project of projects) {
    const setupValid = verifyLintingSetup(project.name, project.path);
    if (!setupValid) {
      allSetupsValid = false;
    }
  }
  
  if (!allSetupsValid) {
    log('\n❌ Some linting configurations are missing. Please check the setup.', colors.red);
    process.exit(1);
  }
  
  // Setup Git hooks
  setupGitHooks();
  
  // Run initial linting
  runInitialLinting();
  
  // Display summary
  displaySummary();
}

main();
