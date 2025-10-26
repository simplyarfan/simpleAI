#!/bin/bash

echo "🔍 Validating Enterprise AI Hub Implementation..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✅${NC} $1"
  else
    echo -e "${RED}❌${NC} $1 (missing)"
    ERRORS=$((ERRORS + 1))
  fi
}

# Function to check module loads
check_module() {
  cd backend
  if node -e "require('$1')" 2>/dev/null; then
    echo -e "${GREEN}✅${NC} $1 loads correctly"
  else
    echo -e "${RED}❌${NC} $1 fails to load"
    ERRORS=$((ERRORS + 1))
  fi
  cd ..
}

echo "📁 Checking Backend Files..."
check_file "backend/utils/twoFactorAuth.js"
check_file "backend/services/emailService.js"
check_file "backend/middleware/errorHandler.js"

echo ""
echo "📁 Checking Frontend Files..."
check_file "frontend/src/pages/auth/verify-2fa.js"
check_file "frontend/src/pages/auth/forgot-password.js"
check_file "frontend/src/pages/auth/reset-password.js"
check_file "frontend/src/components/shared/ErrorAlert.js"

echo ""
echo "🔌 Checking Module Imports..."
check_module "./utils/twoFactorAuth"
check_module "./services/emailService"
check_module "./middleware/errorHandler"

echo ""
echo "📦 Checking Dependencies..."
cd backend
if npm list nodemailer --depth=0 2>/dev/null | grep -q "nodemailer@"; then
  echo -e "${GREEN}✅${NC} nodemailer is installed"
else
  echo -e "${YELLOW}⚠️${NC} nodemailer is NOT installed"
  echo "   Run: cd backend && npm install nodemailer"
  WARNINGS=$((WARNINGS + 1))
fi
cd ..

echo ""
echo "📚 Checking Documentation..."
check_file "docs/2FA_IMPLEMENTATION.md"
check_file "docs/AUTH_FEATURES_COMPLETE.md"
check_file "docs/FINAL_IMPLEMENTATION_SUMMARY.md"
check_file "docs/TESTING_GUIDE.md"

echo ""
echo "🔧 Checking Routes..."
cd backend
if grep -q "resend2FACode" controllers/AuthController.js; then
  echo -e "${GREEN}✅${NC} resend2FACode method exists"
else
  echo -e "${RED}❌${NC} resend2FACode method missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "verify2FA" controllers/AuthController.js; then
  echo -e "${GREEN}✅${NC} verify2FA method exists"
else
  echo -e "${RED}❌${NC} verify2FA method missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "/resend-2fa" routes/auth.js; then
  echo -e "${GREEN}✅${NC} resend-2fa route exists"
else
  echo -e "${RED}❌${NC} resend-2fa route missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "/verify-2fa" routes/auth.js; then
  echo -e "${GREEN}✅${NC} verify-2fa route exists"
else
  echo -e "${RED}❌${NC} verify-2fa route missing"
  ERRORS=$((ERRORS + 1))
fi
cd ..

echo ""
echo "🎨 Checking Frontend Integration..."
cd frontend/src
if grep -q "enable2FA" utils/api.js; then
  echo -e "${GREEN}✅${NC} enable2FA API method exists"
else
  echo -e "${RED}❌${NC} enable2FA API method missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "disable2FA" utils/api.js; then
  echo -e "${GREEN}✅${NC} disable2FA API method exists"
else
  echo -e "${RED}❌${NC} disable2FA API method missing"
  ERRORS=$((ERRORS + 1))
fi

if grep -q "requires2FA" contexts/AuthContext.js; then
  echo -e "${GREEN}✅${NC} AuthContext handles 2FA redirect"
else
  echo -e "${YELLOW}⚠️${NC} AuthContext may not handle 2FA redirect"
  WARNINGS=$((WARNINGS + 1))
fi
cd ../..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Start backend: cd backend && npm run dev"
  echo "2. Start frontend: cd frontend && npm run dev"
  echo "3. Follow testing guide: docs/TESTING_GUIDE.md"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️ Validation complete with $WARNINGS warning(s)${NC}"
  echo ""
  echo "Implementation is functional but has minor issues."
  echo "Review warnings above and proceed with testing."
  exit 0
else
  echo -e "${RED}❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
  echo ""
  echo "Please fix the errors above before testing."
  exit 1
fi
