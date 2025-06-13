#!/bin/bash

# NeuralLog Integration Test Runner
# This script sets up the test environment and runs comprehensive integration tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 NeuralLog Integration Test Runner${NC}"
echo "========================================"

# Configuration
TEST_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$TEST_DIR/.." && pwd)"
INTEGRATION_DIR="$TEST_DIR/integration"

echo -e "${BLUE}📁 Test Directory: $TEST_DIR${NC}"
echo -e "${BLUE}📁 Root Directory: $ROOT_DIR${NC}"
echo -e "${BLUE}📁 Integration Directory: $INTEGRATION_DIR${NC}"

# Check if integration tests exist
if [[ ! -d "$INTEGRATION_DIR" ]]; then
  echo -e "${RED}❌ Integration test directory not found: $INTEGRATION_DIR${NC}"
  exit 1
fi

# Run the tests
echo -e "${YELLOW}🚀 Starting integration tests...${NC}"

cd "$INTEGRATION_DIR"

# Check if package.json exists
if [[ ! -f "package.json" ]]; then
  echo -e "${RED}❌ package.json not found in integration directory${NC}"
  exit 1
fi

# Install dependencies if node_modules doesn't exist
if [[ ! -d "node_modules" ]]; then
  echo -e "${BLUE}📦 Installing dependencies...${NC}"
  npm install
fi

# Run the tests
echo -e "${GREEN}🧪 Running integration tests...${NC}"
npm run test

echo -e "${GREEN}✅ Integration tests completed!${NC}"
