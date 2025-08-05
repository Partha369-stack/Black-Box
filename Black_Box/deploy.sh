#!/bin/bash
# Railway Deployment Script for BlackBox Landing Page

echo "🚀 Starting BlackBox Landing Page deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 Ready for deployment!"
    echo ""
    echo "📁 Files generated:"
    ls -la dist/
    echo ""
    echo "🚀 To deploy to Railway:"
    echo "1. Commit and push your changes to Git"
    echo "2. Railway will automatically deploy"
    echo "3. Your app will be available at the Railway URL"
else
    echo "❌ Build failed!"
    exit 1
fi
