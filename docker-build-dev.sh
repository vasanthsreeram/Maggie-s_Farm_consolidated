#!/bin/bash

# Maggie's Farm Development Docker Build Script
# This script builds and runs the application in development mode with SQLite

echo "🏗️  Building Maggie's Farm in Development Mode..."

# Build the Docker image for development
echo "Building Development Docker image..."
docker-compose -f docker-compose.dev.yml build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build completed successfully!"

# Start the application in development mode
echo "🚀 Starting the application in development mode..."
docker-compose -f docker-compose.dev.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start the application!"
    exit 1
fi

echo "✅ Application started successfully in development mode!"
echo ""
echo "📊 Development server is now running at: http://localhost:8092"
echo "⚛️  React dev server (if enabled): http://localhost:3000"
echo "📈 Data export interface: http://localhost:8092/output"
echo "🔧 Admin interface: http://localhost:8092/admin"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  - Stop application: docker-compose -f docker-compose.dev.yml down"
echo "  - View database status: curl http://localhost:8092/api/health"
echo "  - View database details: curl http://localhost:8092/api/db-health"
echo ""
echo "🗄️  Database: SQLite database will be created automatically at /app/api/data/experiment.db"
echo "📂 Data persistence: Database data is stored in Docker volume 'sqlite_data_dev'"
echo "⚡ Auto-initialization: Database tables are created automatically on startup"
echo "🔄 Hot reloading: Source code changes will be reflected automatically"