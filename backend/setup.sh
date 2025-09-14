#!/bin/bash

# Enterprise AI Hub Backend Setup Script
echo "🚀 Enterprise AI Hub Backend Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your configuration before proceeding"
    echo ""
    echo "Required configurations:"
    echo "  - EMAIL_USER: Your Gmail address"
    echo "  - EMAIL_PASS: Your Gmail app password"
    echo "  - JWT_SECRET: Change to a secure random string"
    echo "  - REFRESH_TOKEN_SECRET: Change to a secure random string"
    echo "  - ADMIN_EMAIL: Your admin email address"
    echo ""
    echo "Run 'nano .env' or 'code .env' to edit the configuration file"
    echo ""
    read -p "Press Enter after you've configured the .env file..."
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database
mkdir -p uploads/cv_batches
mkdir -p logs

echo "✅ Directories created"

# Initialize database
echo "🗄️  Initializing database..."
npm run init-db

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

echo "✅ Database initialized"

# Seed database
echo "🌱 Seeding database with initial data..."
npm run seed-db

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"

# Create a simple startup script
cat > start.sh << 'EOF'
#!/bin/bash
echo "Starting Enterprise AI Hub Backend..."
npm run dev
EOF

chmod +x start.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Review your .env configuration"
echo "2. Test email configuration (optional)"
echo "3. Start the development server:"
echo ""
echo "   ./start.sh"
echo "   # OR"
echo "   npm run dev"
echo ""
echo "🌐 Server will be available at:"
echo "   - API: http://localhost:5000"
echo "   - Health: http://localhost:5000/health"
echo "   - Documentation: http://localhost:5000/api"
echo ""
echo "👤 Admin Account:"
echo "   - Email: $(grep ADMIN_EMAIL .env | cut -d'=' -f2)"
echo "   - Password: TempPassword123! (⚠️ CHANGE IMMEDIATELY!)"
echo ""
echo "📧 Gmail Setup (if using Gmail):"
echo "   1. Enable 2FA on your Gmail account"
echo "   2. Generate an App Password"
echo "   3. Use the App Password in EMAIL_PASS"
echo ""
echo "✨ Happy coding!"
