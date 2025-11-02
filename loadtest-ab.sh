#!/bin/bash
# Apache Bench Load Test Script
#
# This script uses Apache Bench (ab) to test your website with concurrent users.
#
# Prerequisites:
#   - Apache Bench (ab) must be installed
#     - macOS: Pre-installed
#     - Linux: sudo apt-get install apache2-utils
#     - Windows: Install Apache or use WSL
#
# Usage:
#   bash loadtest-ab.sh
#   or
#   chmod +x loadtest-ab.sh
#   ./loadtest-ab.sh
#
# Customize:
#   - Change URL below
#   - Adjust -n (total requests) and -c (concurrent users)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - CHANGE THESE
TARGET_URL="https://satyamparmar-dev.github.io/satyamparmar"
TOTAL_REQUESTS=1000
CONCURRENT_USERS=50

# Test endpoints
ENDPOINTS=(
    "/"
    "/blog"
    "/blog/incident-playbook-for-beginners"
    "/category/backend-engineering"
    "/about"
    "/contact"
)

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Apache Bench Load Test${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Target URL: $TARGET_URL"
echo "Total Requests: $TOTAL_REQUESTS"
echo "Concurrent Users: $CONCURRENT_USERS"
echo ""

# Check if ab is installed
if ! command -v ab &> /dev/null; then
    echo -e "${RED}Error: Apache Bench (ab) is not installed.${NC}"
    echo ""
    echo "Installation:"
    echo "  macOS: Already installed"
    echo "  Linux: sudo apt-get install apache2-utils"
    echo "  Windows: Install Apache or use WSL"
    exit 1
fi

# Test each endpoint
for endpoint in "${ENDPOINTS[@]}"; do
    full_url="${TARGET_URL}${endpoint}"
    echo -e "${YELLOW}Testing: ${full_url}${NC}"
    echo "----------------------------------------"
    
    ab -n $TOTAL_REQUESTS \
       -c $CONCURRENT_USERS \
       -g "ab-results-${endpoint//\//-}.tsv" \
       "$full_url"
    
    echo ""
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Results saved in ab-results-*.tsv files"
echo "You can plot these with gnuplot or view in Excel"

