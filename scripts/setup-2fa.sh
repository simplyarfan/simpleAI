#!/bin/bash

# 2FA Setup Script
# This script installs dependencies and verifies the setup

echo "🔐 Setting up Two-Factor Authentication..."
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

# Install nodemailer
echo "📦 Installing nodemailer..."
npm install nodemailer

if [ $? -eq 0 ]; then
    echo "✅ nodemailer installed successfully"
else
    echo "❌ Failed to install nodemailer"
    exit 1
fi

echo ""
echo "✅ 2FA setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. (Optional) Add email credentials to backend/.env:"
echo "   EMAIL_HOST=smtp.gmail.com"
echo "   EMAIL_PORT=587"
echo "   EMAIL_USER=your_email@securemaxtech.com"
echo "   EMAIL_PASS=your_gmail_app_password"
echo ""
echo "2. Restart your backend server"
echo "   cd backend && npm run dev"
echo ""
echo "3. Enable 2FA for a test user:"
echo "   UPDATE users SET two_factor_enabled = true WHERE email = 'test@securemaxtech.com';"
echo ""
echo "4. Test login and verification flow"
echo ""
echo "📖 For detailed documentation, see: docs/2FA_IMPLEMENTATION.md"
