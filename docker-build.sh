#!/bin/bash

# Maggie's Farm Docker Build Script
# This script builds and runs the application with SQLite

echo "🏗️  Building Maggie's Farm with SQLite..."

# Build the Docker image
echo "Building Docker image..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build completed successfully!"

# Start the application
echo "🚀 Starting the application..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start the application!"
    exit 1
fi

echo "✅ Application started successfully!"
echo ""
echo "📊 Application is now running at: http://localhost:8080"
echo "📈 Data export interface: http://localhost:8080/output"
echo ""
echo "🔧 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop application: docker-compose down"
echo "  - View database status: curl http://localhost:8080/api/health"
echo "  - View database details: curl http://localhost:8080/api/db-health"
echo ""
echo "🗄️  Database: SQLite database will be created automatically at /app/api/data/experiment.db"
echo "📂 Data persistence: Database data is stored in Docker volume 'sqlite_data'"
echo "⚡ Auto-initialization: Database tables are created automatically on startup" 