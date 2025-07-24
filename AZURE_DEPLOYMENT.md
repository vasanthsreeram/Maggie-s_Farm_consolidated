# Azure Deployment Guide

## 🚀 Prerequisites

1. **Azure SQL Database** (recommended) or SQL Server instance
2. **Azure Container Registry** or use Docker Hub
3. **Azure App Service** or Container Instances

## 📋 Required Environment Variables

### **Essential Database Configuration:**
```bash
# Database Server (Azure SQL format)
DB_SERVER=your-server.database.windows.net
DB_PORT=1433
DB_USER=your-username
DB_PASSWORD=your-secure-password
DB_DATABASE=your-database-name

# Application Configuration
NODE_ENV=production
PORT=5000
```

### **Azure SQL Database Example:**
```bash
DB_SERVER=maggies-farm-sql.database.windows.net
DB_PORT=1433
DB_USER=sqladmin
DB_PASSWORD=YourSecurePassword123!
DB_DATABASE=clic
NODE_ENV=production
PORT=5000
```

## 🔧 Azure Setup Steps

### **1. Create Azure SQL Database**
```bash
# Using Azure CLI
az sql server create \
  --name maggies-farm-sql \
  --resource-group your-resource-group \
  --location "East US" \
  --admin-user sqladmin \
  --admin-password "YourSecurePassword123!"

az sql db create \
  --resource-group your-resource-group \
  --server maggies-farm-sql \
  --name clic \
  --service-objective Basic
```

### **2. Configure Firewall Rules**
```bash
# Allow Azure services
az sql server firewall-rule create \
  --resource-group your-resource-group \
  --server maggies-farm-sql \
  --name AllowAzureIps \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (optional, for management)
az sql server firewall-rule create \
  --resource-group your-resource-group \
  --server maggies-farm-sql \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### **3. Deploy to Azure App Service**

#### Option A: Using Azure CLI
```bash
# Create App Service Plan
az appservice plan create \
  --name maggies-farm-plan \
  --resource-group your-resource-group \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group your-resource-group \
  --plan maggies-farm-plan \
  --name maggies-farm-app \
  --deployment-container-image-name atefabrar/maggies-farm:v1.1

# Configure environment variables
az webapp config appsettings set \
  --resource-group your-resource-group \
  --name maggies-farm-app \
  --settings \
    DB_SERVER=maggies-farm-sql.database.windows.net \
    DB_PORT=1433 \
    DB_USER=sqladmin \
    DB_PASSWORD="YourSecurePassword123!" \
    DB_DATABASE=clic \
    NODE_ENV=production \
    PORT=5000
```

#### Option B: Using Azure Portal
1. Go to Azure Portal → App Services → Create
2. Choose **Docker Container** 
3. Set image: `atefabrar/maggies-farm:v1.1`
4. In **Configuration**, add environment variables:
   - `DB_SERVER`: `your-server.database.windows.net`
   - `DB_PORT`: `1433`
   - `DB_USER`: `your-username`
   - `DB_PASSWORD`: `your-password`
   - `DB_DATABASE`: `your-database`
   - `NODE_ENV`: `production`
   - `PORT`: `5000`

### **4. Container Instance (Alternative)**
```bash
az container create \
  --resource-group your-resource-group \
  --name maggies-farm-container \
  --image atefabrar/maggies-farm:v1.1 \
  --cpu 1 \
  --memory 1.5 \
  --ports 5000 \
  --environment-variables \
    DB_SERVER=maggies-farm-sql.database.windows.net \
    DB_PORT=1433 \
    DB_USER=sqladmin \
    DB_PASSWORD="YourSecurePassword123!" \
    DB_DATABASE=clic \
    NODE_ENV=production \
    PORT=5000
```

## 🔍 Troubleshooting

### **Health Check Endpoints:**
- **App Health**: `https://your-app.azurewebsites.net/api/health`
- **Database Health**: `https://your-app.azurewebsites.net/api/db-health`

### **Common Issues:**

#### 1. **503 Service Unavailable**
- Check environment variables are set correctly
- Verify database connection string
- Check App Service logs: `az webapp log tail`

#### 2. **Database Connection Failed**
- Ensure firewall rules allow Azure services
- Verify SQL Server allows SQL authentication
- Check connection string format

#### 3. **Container Won't Start**
- Check if all required environment variables are set
- Verify the image exists: `atefabrar/maggies-farm:v1.1`
- Review container logs in Azure Portal

### **Viewing Logs:**
```bash
# App Service logs
az webapp log tail --name maggies-farm-app --resource-group your-resource-group

# Container logs
az container logs --name maggies-farm-container --resource-group your-resource-group
```

## 📊 Connection String Formats

### **Azure SQL Database:**
```
Server=tcp:your-server.database.windows.net,1433;
Initial Catalog=your-database;
Persist Security Info=False;
User ID=your-user;
Password=your-password;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

### **SQL Server (On-Premises):**
```
Server=your-server,1433;
Database=your-database;
User Id=your-user;
Password=your-password;
Encrypt=false;
TrustServerCertificate=true;
```

## 🎯 Post-Deployment Steps

1. **Initialize Database:**
   ```bash
   curl -X POST https://your-app.azurewebsites.net/api/create-tables
   ```

2. **Test Application:**
   ```bash
   curl https://your-app.azurewebsites.net/api/health
   curl https://your-app.azurewebsites.net/api/db-health
   ```

3. **Monitor Performance:**
   - Use Azure Application Insights
   - Monitor database performance
   - Set up alerts for failures

## 🔐 Security Best Practices

1. **Use Azure Key Vault** for sensitive values
2. **Enable SSL/TLS** for all connections
3. **Configure** proper firewall rules
4. **Use managed identity** when possible
5. **Regular security updates** of dependencies

## 📈 Scaling Options

- **App Service**: Scale up/out based on demand
- **Azure SQL**: Use elastic pools for cost optimization
- **CDN**: Add Azure CDN for static assets
- **Load Balancer**: For high availability

---

Need help? Check the health endpoints or contact support. 