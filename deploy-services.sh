#!/bin/bash

# Deploy Service Pages to GitHub
echo "🚀 Starting deployment of service pages to GitHub..."

# Add all new files
echo "📁 Adding service files to git..."
git add services/
git add index.html

# Commit the changes
echo "💾 Committing changes..."
git commit -m "Add GitHub-hosted service detail pages - Individual HTML pages for each service"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
echo "🔗 Your service pages are now available at:"
echo "   Main site: https://weboutright.github.io/BOOKING-API-DEMO/"
echo "   Services directory: https://weboutright.github.io/BOOKING-API-DEMO/services/"
