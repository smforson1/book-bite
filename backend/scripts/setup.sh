#!/bin/bash

# Book Bite Backend Setup Script
echo "🚀 Setting up Book Bite Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB or use Docker."
    echo "   To start with Docker: docker run -d -p 27017:27017 --name mongodb mongo:6.0"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your configuration before starting the server."
fi

# Build the project
echo "🔨 Building the project..."
npm run build

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your configuration"
echo "2. Start MongoDB (if not already running)"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:3000/health to verify the server is running"
echo ""
echo "🔗 Useful commands:"
echo "   npm run dev      - Start development server"
echo "   npm run build    - Build for production"
echo "   npm start        - Start production server"
echo "   npm test         - Run tests"
echo "   npm run lint     - Run linter"
echo ""
echo "📚 Documentation: See README.md for detailed information"