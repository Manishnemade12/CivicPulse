#!/bin/bash
# =============================================================================
# CivicPulse Supabase Setup Script
# =============================================================================
# Purpose: Automate environment configuration for Supabase migration
# Usage: bash scripts/setup-supabase.sh
# =============================================================================

set -e

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         CivicPulse Supabase Migration Setup Script               ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# Step 1: Verify we're in the right directory
# =============================================================================

if [ ! -f "package.json" ] && [ ! -d "backend/express-api" ]; then
  echo -e "${RED}❌ Error: Not in CivicPulse root directory${NC}"
  echo "Please run this script from the project root"
  exit 1
fi

echo -e "${BLUE}✓ Project directory verified${NC}"
echo ""

# =============================================================================
# Step 2: Navigate to backend directory
# =============================================================================

cd backend/express-api

# =============================================================================
# Step 3: Check if .env exists
# =============================================================================

if [ -f ".env" ]; then
  echo -e "${YELLOW}⚠ .env file already exists${NC}"
  read -p "Do you want to overwrite it? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping .env creation"
    ENV_CREATED=0
  else
    ENV_CREATED=1
  fi
else
  ENV_CREATED=1
fi

# =============================================================================
# Step 4: Create or update .env file
# =============================================================================

if [ $ENV_CREATED -eq 1 ]; then
  echo -e "${BLUE}📝 Setting up .env file...${NC}"
  
  cat > .env << EOF
# Server
PORT=8081

# ============================================================================
# DATABASE - Supabase
# ============================================================================

# Supabase API credentials
SUPABASE_URL=https://jzilwqjjaeqfkmtarefe.supabase.co
SUPABASE_ANON_KEY=sb_publishable_qeShdeXQDhcmRPpOIjpI7Q_Oyqr2mnc
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# ============================================================================
# AUTHENTICATION
# ============================================================================

JWT_SECRET=change-me-to-a-long-random-secret-minimum-32-characters-long-in-production
ADMIN_SECRET=change-me-in-production

# ============================================================================
# APPLICATION
# ============================================================================

APP_VERSION=0.0.1
NODE_ENV=development

# ============================================================================
# CORS
# ============================================================================

CORS_ORIGIN=http://localhost:3000
EOF

  echo -e "${GREEN}✅ .env file created${NC}"
  echo ""
else
  echo -e "${YELLOW}⏭ Skipped .env creation${NC}"
fi

# =============================================================================
# Step 5: Verify Node.js dependencies
# =============================================================================

echo ""
echo -e "${BLUE}📦 Checking Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
  else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
  fi
else
  echo -e "${RED}❌ package.json not found${NC}"
  exit 1
fi

# =============================================================================
# Step 6: Display summary and next steps
# =============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete! 🎉                             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1️⃣  Verify Supabase keys in .env:"
echo "   → Visit: https://app.supabase.com"
echo "   → Go to: Settings > API"
echo ""
echo "2️⃣  Ensure backend .env has these keys:"
echo "   → Edit: backend/express-api/.env"
echo "   → SUPABASE_URL"
echo "   → SUPABASE_ANON_KEY"
echo "   → SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "3️⃣  Run the database migration:"
echo "   → Visit: https://app.supabase.com"
echo "   → Go to: SQL Editor > New Query"
echo "   → Copy entire content from: docs/supabase-schema.sql"
echo "   → Click: Run"
echo ""
echo "4️⃣  Start the backend:"
echo "   → npm run dev"
echo ""
echo "5️⃣  Verify connection:"
echo "   → Look for: '[DB] Successfully connected to database'"
echo ""

echo -e "${BLUE}📚 Documentation:${NC}"
echo "   Full migration guide: docs/SUPABASE-MIGRATION.md"
echo "   Database schema: docs/supabase-schema.sql"
echo ""

echo -e "${GREEN}✅ Your CivicPulse project is ready for Supabase!${NC}"
echo ""
