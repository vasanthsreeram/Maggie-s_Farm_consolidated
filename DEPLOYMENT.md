# MF-Web Azure Deployment Guide

This guide will help you deploy the MF-Web application to Azure using Docker Hub.

## Prerequisites

1. Docker installed on your local machine
2. Docker Hub account
3. Azure account with Container Instances or App Service access
4. Azure SQL Database (recommended) or SQL Server instance

## Step 1: Prepare Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Copy the example file
cp .env.example .env
```

Update the `.env` file with your Azure SQL Database credentials:
- `DB_SERVER`: Your Azure SQL server (e.g., `yourserver.database.windows.net`)
- `DB_USER`: Your database username
- `DB_PASSWORD`: Your database password
- `DB_DATABASE`: Your database name

## Step 2: Build and Test Locally

```bash
# Build the Docker image
docker build -t mf-web:latest .

# Test locally with docker-compose
docker-compose up
```

Visit `http://localhost:5000` to verify the application works.

## Step 3: Push to Docker Hub

1. **Login to Docker Hub:**
   ```bash
   docker login
   ```

2. **Tag your image:**
   ```bash
   docker tag mf-web:latest yourusername/mf-web:latest
   docker tag mf-web:latest yourusername/mf-web:v1.0.0
   ```

3. **Push to Docker Hub:**
   ```bash
   docker push yourusername/mf-web:latest
   docker push yourusername/mf-web:v1.0.0
   ```

## Step 4: Deploy to Azure

### Option A: Azure Container Instances (ACI)

1. **Using Azure CLI:**
   ```bash
   az container create \
     --resource-group your-resource-group \
     --name mf-web-app \
     --image yourusername/mf-web:latest \
     --dns-name-label mf-web-unique-name \
     --ports 5000 \
     --environment-variables \
       NODE_ENV=production \
       PORT=5000 \
       DB_SERVER=yourserver.database.windows.net \
       DB_DATABASE=yourdatabase \
     --secure-environment-variables \
       DB_USER=yourusername \
       DB_PASSWORD=yourpassword
   ```

2. **Using Azure Portal:**
   - Follow the guide: https://scribehow.com/viewer/How_to_Deploy_a_Docker_Container_on_Azure__Hewt_vhbTCizQBhidS-ISw
   - Use image: `yourusername/mf-web:latest`
   - Set port: `5000`
   - Add environment variables as listed above

### Option B: Azure App Service

1. **Create App Service with Docker:**
   ```bash
   az webapp create \
     --resource-group your-resource-group \
     --plan your-app-service-plan \
     --name your-app-name \
     --deployment-container-image-name yourusername/mf-web:latest
   ```

2. **Set environment variables:**
   ```bash
   az webapp config appsettings set \
     --resource-group your-resource-group \
     --name your-app-name \
     --settings \
       NODE_ENV=production \
       PORT=5000 \
       DB_SERVER=yourserver.database.windows.net \
       DB_DATABASE=yourdatabase \
       DB_USER=yourusername \
       DB_PASSWORD=yourpassword
   ```

## Step 5: Database Setup

Ensure your Azure SQL Database:
1. Allows connections from Azure services
2. Has the necessary tables and schema
3. Firewall rules allow your container's IP range

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Server port | `5000` |
| `DB_SERVER` | Database server | `server.database.windows.net` |
| `DB_USER` | Database username | `admin` |
| `DB_PASSWORD` | Database password | `SecurePassword123!` |
| `DB_DATABASE` | Database name | `mf_web_db` |

## Troubleshooting

1. **Container won't start:** Check environment variables and database connectivity
2. **Database connection fails:** Verify firewall rules and credentials
3. **Application not accessible:** Ensure port 5000 is exposed and mapped correctly

## Security Notes

- Never commit `.env` files to version control
- Use Azure Key Vault for production secrets
- Enable SSL/TLS for database connections in production
- Regularly update base images for security patches

## Health Check

The application includes a health check endpoint at `/api/testmethod` that Azure can use to monitor the container health. 