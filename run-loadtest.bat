@echo off
REM Load Testing Script - Runs Artillery with npx
REM
REM This script runs the load test without needing to change PowerShell execution policy
REM
REM Usage:
REM   run-loadtest.bat
REM
REM Customize:
REM   - Edit loadtest-artillery.yml to change URL and user counts
REM   - Modify phases for different load patterns

echo ========================================
echo Running Load Test with Artillery
echo ========================================
echo.

REM Check if config file exists
if not exist "loadtest-artillery.yml" (
    echo ERROR: loadtest-artillery.yml not found!
    echo.
    echo Please ensure the config file exists in the current directory.
    pause
    exit /b 1
)

echo Configuration file: loadtest-artillery.yml
echo.
echo Starting load test...
echo.

REM Run Artillery with npx (doesn't require global install)
npx --yes artillery run loadtest-artillery.yml

echo.
echo ========================================
echo Load test completed!
echo ========================================
echo.
echo To save results to a file:
echo   npx --yes artillery run loadtest-artillery.yml --output results.json
echo.
echo To generate HTML report:
echo   npx --yes artillery report results.json
echo.
pause

