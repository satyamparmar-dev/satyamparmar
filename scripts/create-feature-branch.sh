#!/bin/bash

# Create Feature Branch Script
# This script helps create a new feature branch and set up the development workflow

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Feature Branch Creator${NC}"
echo "================================"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Check if we're on main branch
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're not on the main branch (currently on: $current_branch)${NC}"
    echo -e "${YELLOW}   It's recommended to start from main branch${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}💡 To switch to main: git checkout main${NC}"
        exit 1
    fi
fi

# Get branch name from user
echo -e "${BLUE}📝 Enter your feature branch name:${NC}"
echo -e "${YELLOW}   Examples: feature/user-authentication, fix/login-bug, chore/update-deps${NC}"
read -p "Branch name: " branch_name

# Validate branch name
if [ -z "$branch_name" ]; then
    echo -e "${RED}❌ Error: Branch name cannot be empty${NC}"
    exit 1
fi

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/"$branch_name"; then
    echo -e "${RED}❌ Error: Branch '$branch_name' already exists${NC}"
    echo -e "${YELLOW}   Available branches:${NC}"
    git branch | grep -v "main" | sed 's/^/   /'
    exit 1
fi

# Pull latest changes from main
echo -e "${BLUE}📥 Pulling latest changes from main...${NC}"
git checkout main
git pull origin main

# Create and checkout new branch
echo -e "${BLUE}🌿 Creating branch: $branch_name${NC}"
git checkout -b "$branch_name"

echo -e "${GREEN}✅ Feature branch created successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Make your changes"
echo "2. git add ."
echo "3. git commit -m 'feat: describe your changes'"
echo "4. git push origin $branch_name"
echo "5. Create a Pull Request on GitHub"
echo "6. Request review from team members"
echo "7. Get approval and merge through GitHub"
echo ""
echo -e "${YELLOW}💡 Tip: Use descriptive commit messages and PR titles${NC}"
echo -e "${YELLOW}   Example: 'feat: Add user authentication system'${NC}"
echo ""
echo -e "${GREEN}🎉 Happy coding!${NC}"
