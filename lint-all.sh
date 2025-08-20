#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 ChemFetch Linting Suite${NC}"
echo "================================="

# Function to run linting for a project
run_lint() {
    local project_name=$1
    local project_path=$2
    
    echo -e "\n${YELLOW}📂 Linting ${project_name}...${NC}"
    
    if [ -d "$project_path" ]; then
        cd "$project_path"
        
        if [ -f "package.json" ]; then
            echo "Running lint check..."
            if npm run lint; then
                echo -e "${GREEN}✅ ${project_name} linting passed${NC}"
            else
                echo -e "${RED}❌ ${project_name} linting failed${NC}"
            fi
            
            echo "Running format check..."
            if npm run format:check; then
                echo -e "${GREEN}✅ ${project_name} formatting is correct${NC}"
            else
                echo -e "${RED}❌ ${project_name} formatting issues found${NC}"
            fi
            
            echo "Running type check..."
            if npm run type-check; then
                echo -e "${GREEN}✅ ${project_name} type checking passed${NC}"
            else
                echo -e "${RED}❌ ${project_name} type checking failed${NC}"
            fi
        else
            echo -e "${RED}❌ No package.json found in ${project_name}${NC}"
        fi
        
        cd ..
    else
        echo -e "${RED}❌ Directory ${project_path} not found${NC}"
    fi
}

# Function to fix linting issues
run_fix() {
    local project_name=$1
    local project_path=$2
    
    echo -e "\n${YELLOW}🔧 Fixing ${project_name}...${NC}"
    
    if [ -d "$project_path" ]; then
        cd "$project_path"
        
        if [ -f "package.json" ]; then
            echo "Running lint fix..."
            npm run lint:fix
            
            echo "Running format fix..."
            npm run format
            
            echo -e "${GREEN}✅ ${project_name} fixes applied${NC}"
        else
            echo -e "${RED}❌ No package.json found in ${project_name}${NC}"
        fi
        
        cd ..
    else
        echo -e "${RED}❌ Directory ${project_path} not found${NC}"
    fi
}

# Check command line arguments
if [ "$1" = "--fix" ]; then
    echo -e "${BLUE}🔧 Running fixes for all projects${NC}"
    run_fix "Mobile App" "chemfetch-mobile-claude"
    run_fix "Client Hub" "chemfetch-client-hub-claude"
    run_fix "Backend" "chemfetch-backend-claude"
elif [ "$1" = "--help" ]; then
    echo "Usage: ./lint-all.sh [--fix] [--help]"
    echo ""
    echo "Options:"
    echo "  --fix    Automatically fix linting and formatting issues"
    echo "  --help   Show this help message"
else
    echo -e "${BLUE}🔍 Running checks for all projects${NC}"
    run_lint "Mobile App" "chemfetch-mobile-claude"
    run_lint "Client Hub" "chemfetch-client-hub-claude" 
    run_lint "Backend" "chemfetch-backend-claude"
fi

echo -e "\n${BLUE}🎉 Linting suite completed!${NC}"
