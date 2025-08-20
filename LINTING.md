# ChemFetch Linting Setup

This document outlines the comprehensive linting setup for all ChemFetch projects.

## 📋 Overview

The ChemFetch monorepo now includes robust linting and formatting configurations for:

- **chemfetch-mobile-claude**: React Native/Expo mobile application
- **chemfetch-client-hub-claude**: Next.js web application  
- **chemfetch-backend-claude**: Node.js/Express API server

## 🛠️ Tools Used

### ESLint
- **Mobile**: Expo ESLint config with React Native specific rules
- **Client Hub**: Next.js ESLint config with TypeScript support
- **Backend**: Modern JavaScript ESLint config with Node.js rules

### Prettier
- Consistent code formatting across all projects
- Integrated with Tailwind CSS for class sorting
- Configured for optimal readability

### TypeScript
- Type checking enabled for all projects
- Strict mode configuration for better code quality

## 🚀 Quick Start

### Install Dependencies

Navigate to each project directory and install dependencies:

```bash
# Mobile app
cd chemfetch-mobile-claude
npm install

# Client hub
cd ../chemfetch-client-hub-claude  
npm install

# Backend
cd ../chemfetch-backend-claude
npm install
```

### Run Linting for All Projects

From the root directory:

```bash
# Check all projects
./lint-all.sh

# Fix issues automatically
./lint-all.sh --fix

# Windows users
lint-all.bat
lint-all.bat --fix
```

### Run Linting for Individual Projects

Each project has the same set of scripts:

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Fix linting issues automatically
npm run format        # Format code with Prettier
npm run format:check  # Check if code is properly formatted
npm run type-check    # Run TypeScript type checking
```

## 📁 Project-Specific Configurations

### Mobile App (React Native/Expo)

**Key Features:**
- Expo ESLint configuration
- React Native specific rules
- Tailwind CSS integration
- TypeScript support

**Files:**
- `eslint.config.js`
- `.prettierrc`
- `.prettierignore`

**Notable Rules:**
- `react-native/no-unused-styles`: Prevents unused StyleSheet styles
- `react-native/no-inline-styles`: Warns against inline styles
- `react-native/no-raw-text`: Ensures proper Text component usage

### Client Hub (Next.js)

**Key Features:**
- Next.js ESLint configuration
- TypeScript strict mode
- Import ordering rules
- Tailwind CSS support

**Files:**
- `eslint.config.mjs`
- `.prettierrc`
- `.prettierignore`

**Notable Rules:**
- `@next/next/no-img-element`: Enforces Next.js Image component
- `@typescript-eslint/consistent-type-imports`: Consistent import types
- `import/order`: Organized import statements

### Backend (Node.js/Express)

**Key Features:**
- Modern JavaScript ESLint configuration
- Node.js specific rules
- TypeScript type checking
- ES2022 features support

**Files:**
- `eslint.config.js`
- `.prettierrc`
- `.prettierignore`
- `tsconfig.json`

**Notable Rules:**
- `handle-callback-err`: Proper error handling
- `no-path-concat`: Prevents path concatenation issues
- `prefer-const`: Modern JavaScript practices

## 🔧 VSCode Integration

The workspace includes VSCode settings for:
- Auto-formatting on save
- ESLint auto-fix on save
- Proper working directories for multi-project setup
- Recommended extensions

**Recommended Extensions:**
- ESLint
- Prettier
- TypeScript
- Tailwind CSS IntelliSense

## 🔄 Git Hooks

Pre-commit hooks are configured to:
- Run linting checks on changed files
- Verify code formatting
- Perform type checking
- Prevent commits with linting errors

**Setup Git Hooks:**
```bash
# Configure git to use custom hooks directory
git config core.hooksPath .githooks

# Make hooks executable (Unix/Mac)
chmod +x .githooks/pre-commit
```

## 📋 Common Commands

### Check Everything
```bash
./lint-all.sh
```

### Fix Everything
```bash
./lint-all.sh --fix
```

### Project-Specific Checks
```bash
cd chemfetch-mobile-claude
npm run lint && npm run format:check && npm run type-check
```

### Project-Specific Fixes
```bash
cd chemfetch-mobile-claude
npm run lint:fix && npm run format
```

## 🚨 Troubleshooting

### ESLint Errors
1. Check the specific error message
2. Run `npm run lint:fix` to auto-fix issues
3. Manually fix remaining issues
4. Consider adding ESLint disable comments for legitimate exceptions

### Prettier Formatting Issues
1. Run `npm run format` to fix formatting
2. Check `.prettierrc` configuration if issues persist
3. Ensure consistent line endings (LF vs CRLF)

### TypeScript Errors
1. Check `tsconfig.json` configuration
2. Update type definitions if needed
3. Add proper type annotations
4. Use `// @ts-ignore` sparingly for legitimate cases

### Git Hook Issues
1. Ensure hooks are executable: `chmod +x .githooks/pre-commit`
2. Check git hooks path: `git config core.hooksPath`
3. Verify all dependencies are installed

## 🎯 Best Practices

### Code Style
- Use consistent naming conventions
- Prefer const over let, avoid var
- Use meaningful variable names
- Keep functions small and focused

### Type Safety
- Enable strict TypeScript mode
- Add proper type annotations
- Avoid `any` type when possible
- Use type guards for runtime checks

### React/React Native
- Use functional components with hooks
- Implement proper error boundaries
- Follow React Native performance best practices
- Use TypeScript for prop definitions

### Node.js/Express
- Handle errors properly
- Use async/await over callbacks
- Implement proper logging
- Follow security best practices

## 📈 Metrics and Reporting

The linting setup provides:
- Code quality metrics through ESLint rules
- Consistent formatting enforcement
- Type safety verification
- Pre-commit quality gates

## 🔄 Maintenance

### Updating Dependencies
```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update ESLint configs
npm install eslint@latest @eslint/js@latest
```

### Adding New Rules
1. Update appropriate `eslint.config.js` file
2. Test with existing codebase
3. Run `npm run lint:fix` to apply fixes
4. Update documentation if needed

## 🤝 Contributing

When contributing to ChemFetch:
1. Ensure all linting checks pass
2. Format code with Prettier
3. Add appropriate type annotations
4. Follow existing code style
5. Test changes thoroughly

## 📞 Support

For linting setup issues:
1. Check this documentation first
2. Review project-specific configurations
3. Check for dependency conflicts
4. Ensure all tools are properly installed
