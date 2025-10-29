@echo off
REM Create Feature Branch Script for Windows
REM This script helps create a new feature branch and set up the development workflow

echo 🚀 Feature Branch Creator
echo ================================

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Not in a git repository
    exit /b 1
)

REM Check if we're on main branch
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if not "%current_branch%"=="main" (
    echo ⚠️  Warning: You're not on the main branch (currently on: %current_branch%)
    echo    It's recommended to start from main branch
    set /p continue="Continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo 💡 To switch to main: git checkout main
        exit /b 1
    )
)

REM Get branch name from user
echo 📝 Enter your feature branch name:
echo    Examples: feature/user-authentication, fix/login-bug, chore/update-deps
set /p branch_name="Branch name: "

REM Validate branch name
if "%branch_name%"=="" (
    echo ❌ Error: Branch name cannot be empty
    exit /b 1
)

REM Check if branch already exists
git show-ref --verify --quiet refs/heads/%branch_name%
if %errorlevel% equ 0 (
    echo ❌ Error: Branch '%branch_name%' already exists
    echo    Available branches:
    git branch | findstr /v "main" | findstr /v "remotes"
    exit /b 1
)

REM Pull latest changes from main
echo 📥 Pulling latest changes from main...
git checkout main
git pull origin main

REM Create and checkout new branch
echo 🌿 Creating branch: %branch_name%
git checkout -b %branch_name%

echo ✅ Feature branch created successfully!
echo.
echo 📋 Next steps:
echo 1. Make your changes
echo 2. git add .
echo 3. git commit -m "feat: describe your changes"
echo 4. git push origin %branch_name%
echo 5. Create a Pull Request on GitHub
echo 6. Request review from team members
echo 7. Get approval and merge through GitHub
echo.
echo 💡 Tip: Use descriptive commit messages and PR titles
echo    Example: "feat: Add user authentication system"
echo.
echo 🎉 Happy coding!
