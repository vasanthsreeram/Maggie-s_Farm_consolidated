@echo off
REM MF-Web Docker Hub Deployment Script for Windows
REM Usage: deploy.bat your-dockerhub-username

if "%1"=="" (
    echo Usage: %0 ^<dockerhub-username^>
    echo Example: %0 johndoe
    exit /b 1
)

set DOCKERHUB_USERNAME=%1
set IMAGE_NAME=mf-web
set VERSION=v1.0.0

echo 🐳 Building Docker image...
docker build -t %IMAGE_NAME%:latest .

if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    exit /b 1
)

echo 🏷️  Tagging images...
docker tag %IMAGE_NAME%:latest %DOCKERHUB_USERNAME%/%IMAGE_NAME%:latest
docker tag %IMAGE_NAME%:latest %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%VERSION%

echo 📤 Pushing to Docker Hub...
docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:latest
docker push %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%VERSION%

if %errorlevel% equ 0 (
    echo ✅ Successfully pushed to Docker Hub!
    echo 📋 Image details:
    echo    - %DOCKERHUB_USERNAME%/%IMAGE_NAME%:latest
    echo    - %DOCKERHUB_USERNAME%/%IMAGE_NAME%:%VERSION%
    echo.
    echo 🚀 Ready for Azure deployment!
    echo Use this image in Azure: %DOCKERHUB_USERNAME%/%IMAGE_NAME%:latest
) else (
    echo ❌ Push to Docker Hub failed!
    exit /b 1
) 