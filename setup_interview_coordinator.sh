#!/bin/bash

# Interview Coordinator - Quick Setup Script
# Run this script to set up the Interview Coordinator

echo "🎯 Interview Coordinator Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Please create .env file with required variables"
    echo ""
    echo "Required variables:"
    echo "  OPENAI_API_KEY=your_key_here"
    echo "  OUTLOOK_CLIENT_ID=your_client_id"
    echo "  OUTLOOK_CLIENT_SECRET=your_client_secret"
    exit 1
fi

echo "✅ Found .env file"
echo ""

# Check for required environment variables
if ! grep -q "OPENAI_API_KEY" .env; then
    echo "⚠️  Warning: OPENAI_API_KEY not found in .env"
    echo "   AI question generation will use fallback questions"
fi

if ! grep -q "OUTLOOK_CLIENT_ID" .env || ! grep -q "OUTLOOK_CLIENT_SECRET" .env; then
    echo "⚠️  Warning: Outlook OAuth credentials not found in .env"
    echo "   Email sending will not work"
fi

echo ""
echo "📦 Running database migration..."
echo ""

# Check if database exists
if [ ! -f database.db ]; then
    echo "❌ Error: database.db not found"
    echo "Please create database first"
    exit 1
fi

# Run migration
sqlite3 database.db < backend/migrations/migrate_interview_coordinator.sql

if [ $? -eq 0 ]; then
    echo "✅ Database migration completed successfully"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo ""
echo "🔍 Verifying tables..."
echo ""

# Verify tables were created
INTERVIEW_COUNT=$(sqlite3 database.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='interviews';")
REMINDER_COUNT=$(sqlite3 database.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='interview_reminders';")

if [ "$INTERVIEW_COUNT" -eq 1 ]; then
    echo "✅ interviews table exists"
else
    echo "❌ interviews table not found"
fi

if [ "$REMINDER_COUNT" -eq 1 ]; then
    echo "✅ interview_reminders table exists"
else
    echo "❌ interview_reminders table not found"
fi

echo ""
echo "📊 Database Statistics:"
echo ""

# Show table counts
sqlite3 database.db "SELECT 'Total interviews: ' || COUNT(*) FROM interviews;"
sqlite3 database.db "SELECT 'Total reminders: ' || COUNT(*) FROM interview_reminders;"

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure Azure OAuth (see docs/INTERVIEW_COORDINATOR_GUIDE.md)"
echo "2. Users need to connect their Outlook account in Profile Settings"
echo "3. Test with a sample interview"
echo ""
echo "To start the server:"
echo "  cd backend && npm start"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm run dev"
echo ""
echo "📚 Documentation:"
echo "  - INTERVIEW_COORDINATOR_FIXES.md - Detailed changes"
echo "  - docs/INTERVIEW_COORDINATOR_GUIDE.md - User guide"
echo "  - COMPLETION_SUMMARY.md - Summary and checklist"
echo ""
