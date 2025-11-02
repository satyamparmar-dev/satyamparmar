@echo off
REM Apache Bench Load Test Script (Windows)
REM
REM This script uses Apache Bench (ab) to test your website with concurrent users.
REM
REM Prerequisites:
REM   - Apache Bench (ab) must be installed
REM     - Install Apache HTTP Server or use WSL
REM     - Or download Apache binaries
REM
REM Usage:
REM   loadtest-ab.bat
REM
REM Customize:
REM   - Change URL below
REM   - Adjust -n (total requests) and -c (concurrent users)

echo ========================================
echo Apache Bench Load Test
echo ========================================
echo.

REM Configuration - CHANGE THESE
set TARGET_URL=https://satyamparmar-dev.github.io/satyamparmar
set TOTAL_REQUESTS=1000
set CONCURRENT_USERS=50

echo Target URL: %TARGET_URL%
echo Total Requests: %TOTAL_REQUESTS%
echo Concurrent Users: %CONCURRENT_USERS%
echo.

REM Check if ab is installed
where ab >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Apache Bench (ab) is not installed.
    echo.
    echo Installation options:
    echo   1. Install Apache HTTP Server
    echo   2. Use WSL (Windows Subsystem for Linux)
    echo   3. Download Apache binaries
    echo.
    pause
    exit /b 1
)

REM Test homepage
echo Testing: %TARGET_URL%/
echo ----------------------------------------
ab -n %TOTAL_REQUESTS% -c %CONCURRENT_USERS% "%TARGET_URL%/"
echo.

REM Test blog listing
echo Testing: %TARGET_URL%/blog
echo ----------------------------------------
ab -n %TOTAL_REQUESTS% -c %CONCURRENT_USERS% "%TARGET_URL%/blog"
echo.

REM Test blog post
echo Testing: %TARGET_URL%/blog/incident-playbook-for-beginners
echo ----------------------------------------
ab -n %TOTAL_REQUESTS% -c %CONCURRENT_USERS% "%TARGET_URL%/blog/incident-playbook-for-beginners"
echo.

REM Test category page
echo Testing: %TARGET_URL%/category/backend-engineering
echo ----------------------------------------
ab -n %TOTAL_REQUESTS% -c %CONCURRENT_USERS% "%TARGET_URL%/category/backend-engineering"
echo.

echo ========================================
echo All tests completed!
echo ========================================
echo.
pause

