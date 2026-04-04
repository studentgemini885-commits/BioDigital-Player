#!/bin/bash

# BioDigital Player - APK Build Script
# Run this on your computer (not in Codespace)

set -e

echo "=================================================="
echo "BioDigital Player - APK Build Script"
echo "=================================================="
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Java
if ! command -v java &> /dev/null; then
    echo "❌ Java not found. Install Java 21 first."
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1)
echo "✅ Java: $JAVA_VERSION"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js: $NODE_VERSION"

# Check Android Home
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME not set. Set environment variable first."
    exit 1
fi

echo "✅ ANDROID_HOME: $ANDROID_HOME"
echo ""

# Build steps
echo "🚀 Starting build process..."
echo ""

echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

echo "🔨 Step 2: Generating native code..."
npx expo prebuild --clean
echo "✅ Native code generated"
echo ""

echo "🏗️  Step 3: Building APK..."
cd android
./gradlew assembleRelease
echo "✅ Build successful!"
echo ""

echo "=================================================="
echo "✅ APK BUILD COMPLETE!"
echo "=================================================="
echo ""
echo "APK location:"
echo "  📱 Release: android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Install on device:"
echo "  adb install android/app/build/outputs/apk/release/app-release.apk"
echo ""
echo "Enjoy your BioDigital Player! 🎉"

