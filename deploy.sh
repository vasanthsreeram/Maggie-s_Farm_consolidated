#!/bin/bash

# MF-Web Docker Hub Deployment Script
# Usage: ./deploy.sh your-dockerhub-username

if [ -z "$1" ]; then
    echo "Usage: $0 <dockerhub-username>"
    echo "Example: $0 johndoe"
    exit 1
fi

DOCKERHUB_USERNAME=$1
IMAGE_NAME="mf-web"
VERSION="v1.0.0"

echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "🏷️  Tagging images..."
docker tag $IMAGE_NAME:latest $DOCKERHUB_USERNAME/$IMAGE_NAME:latest
docker tag $IMAGE_NAME:latest $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION

echo "📤 Pushing to Docker Hub..."
docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:latest
docker push $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to Docker Hub!"
    echo "📋 Image details:"
    echo "   - $DOCKERHUB_USERNAME/$IMAGE_NAME:latest"
    echo "   - $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION"
    echo ""
    echo "🚀 Ready for Azure deployment!"
    echo "Use this image in Azure: $DOCKERHUB_USERNAME/$IMAGE_NAME:latest"
else
    echo "❌ Push to Docker Hub failed!"
    exit 1
fi 