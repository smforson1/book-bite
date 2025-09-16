#!/bin/bash

# Start MongoDB with Docker
echo "🐳 Starting MongoDB with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if MongoDB container already exists
if [ "$(docker ps -aq -f name=book-bite-mongodb)" ]; then
    echo "📦 MongoDB container already exists. Starting it..."
    docker start book-bite-mongodb
else
    echo "📦 Creating new MongoDB container..."
    docker run -d \
        --name book-bite-mongodb \
        -p 27017:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=admin \
        -e MONGO_INITDB_ROOT_PASSWORD=password123 \
        -e MONGO_INITDB_DATABASE=book-bite \
        -v mongodb_data:/data/db \
        mongo:6.0
fi

echo "✅ MongoDB is running on port 27017"
echo "📋 Connection details:"
echo "   Host: localhost"
echo "   Port: 27017"
echo "   Username: admin"
echo "   Password: password123"
echo "   Database: book-bite"
echo ""
echo "🔗 Connection URI: mongodb://admin:password123@localhost:27017/book-bite?authSource=admin"
echo ""
echo "🛑 To stop MongoDB: docker stop book-bite-mongodb"
echo "🗑️  To remove MongoDB: docker rm book-bite-mongodb"