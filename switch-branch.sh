#!/bin/bash

# Branch Switcher Script
# Usage: ./switch-branch.sh [test|main]

echo "🌿 Branch Switcher"
echo "=================="
echo ""

# Show current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# If no argument provided, show menu
if [ -z "$1" ]; then
    echo "Which branch do you want to switch to?"
    echo "1) test (development)"
    echo "2) main (production)"
    echo "3) Cancel"
    echo ""
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1) TARGET_BRANCH="test" ;;
        2) TARGET_BRANCH="main" ;;
        3) echo "Cancelled."; exit 0 ;;
        *) echo "Invalid choice."; exit 1 ;;
    esac
else
    TARGET_BRANCH=$1
fi

# Validate branch name
if [ "$TARGET_BRANCH" != "test" ] && [ "$TARGET_BRANCH" != "main" ]; then
    echo "❌ Invalid branch name. Use 'test' or 'main'"
    exit 1
fi

# Check if already on target branch
if [ "$CURRENT_BRANCH" = "$TARGET_BRANCH" ]; then
    echo "✅ Already on $TARGET_BRANCH branch"
    exit 0
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  You have uncommitted changes!"
    echo ""
    git status --short
    echo ""
    read -p "Do you want to commit these changes first? [y/n]: " commit_choice
    
    if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
        read -p "Enter commit message: " commit_msg
        git add .
        git commit -m "$commit_msg"
        git push origin $CURRENT_BRANCH
        echo "✅ Changes committed and pushed to $CURRENT_BRANCH"
    else
        read -p "Stash changes instead? [y/n]: " stash_choice
        if [ "$stash_choice" = "y" ] || [ "$stash_choice" = "Y" ]; then
            git stash
            echo "✅ Changes stashed"
        else
            echo "❌ Cannot switch branches with uncommitted changes"
            exit 1
        fi
    fi
fi

# Switch branch
echo ""
echo "🔄 Switching to $TARGET_BRANCH branch..."
git checkout $TARGET_BRANCH

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin $TARGET_BRANCH

echo ""
echo "✅ Successfully switched to $TARGET_BRANCH branch"
echo ""

# Show branch info
if [ "$TARGET_BRANCH" = "main" ]; then
    echo "⚠️  You are now on PRODUCTION branch"
    echo "   Be careful with changes here!"
else
    echo "✅ You are on TEST branch"
    echo "   Safe to experiment and test new features"
fi

echo ""
echo "📊 Recent commits:"
git log --oneline -5
