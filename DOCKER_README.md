# Docker Deployment Guide - Maggie's Farm

This guide covers deploying Maggie's Farm using Docker with the new SQLite database setup.

## Quick Start

### Option 1: Using the Build Script (Recommended)
```bash
./docker-build.sh
```

### Option 2: Manual Docker Commands
```bash
# Build the application
docker-compose build

# Start the application
docker-compose up -d
```

## What Changed from MSSQL to SQLite

- ✅ **Removed**: Microsoft SQL Server container dependency
- ✅ **Added**: SQLite database with persistent volume
- ✅ **Simplified**: No external database configuration needed
- ✅ **Improved**: Faster startup and easier deployment

## Database Configuration

### SQLite Database Location
- **Container Path**: `/app/api/data/experiment.db`
- **Volume**: `sqlite_data` (persists data between container restarts)
- **Local Development**: `api/data/experiment.db`

### Environment Variables
```bash
# Required
NODE_ENV=production
PORT=5000

# Optional - Custom database path
DB_PATH=/app/api/data/experiment.db
```

## Application URLs

After deployment, access:
- **Main Application**: http://localhost:8080
- **Data Export Interface**: http://localhost:8080/output
- **Health Check**: http://localhost:8080/api/health

## Database Setup

⚡ **Automatic Initialization**: Database tables are created automatically when the container starts. No manual setup required!

### Verify Database Status
```bash
# Check application health
curl http://localhost:8080/api/health

# Check database connection details
curl http://localhost:8080/api/db-health
```

## Docker Commands Reference

### Basic Operations
```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Rebuild and restart
docker-compose down && docker-compose build && docker-compose up -d
```

### Database Management
```bash
# Access container shell
docker exec -it mf-web-app sh

# View SQLite database directly (inside container)
sqlite3 /app/api/data/experiment.db

# Backup database
docker cp mf-web-app:/app/api/data/experiment.db ./backup_$(date +%Y%m%d_%H%M%S).db
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect SQLite data volume
docker volume inspect maggies_farm_sqlite_data

# Remove volume (⚠️ This deletes all data!)
docker volume rm maggies_farm_sqlite_data
```

## Data Export

### Web Interface
Visit http://localhost:5000/output for a user-friendly data export interface.

### API Endpoints
```bash
# Export all data as JSON
curl http://localhost:5000/api/output

# Export all data as CSV
curl "http://localhost:5000/api/output?format=csv"

# Export specific table
curl http://localhost:5000/api/output/table/Behaviour

# Get summary statistics
curl http://localhost:5000/api/output/summary
```

## Troubleshooting

### Container Won't Start
```bash
# Check build logs
docker-compose build --no-cache

# Check container logs
docker-compose logs mf-web

# Remove and rebuild
docker-compose down
docker system prune
docker-compose build
```

### Database Issues
```bash
# Check if tables exist
curl http://localhost:5000/api/health

# Recreate tables
curl -X POST http://localhost:5000/api/create-tables

# Check database file exists (inside container)
docker exec mf-web-app ls -la /app/api/data/
```

### Performance Issues
```bash
# Monitor container resources
docker stats mf-web-app

# Check available disk space
docker system df
```

## Production Deployment

### Security Considerations
- Change default ports if needed
- Use environment files for sensitive data
- Set up proper reverse proxy (nginx/Apache)
- Enable HTTPS
- Regular database backups

### Scaling
- SQLite is suitable for small to medium datasets
- For high-concurrency needs, consider upgrading to PostgreSQL
- Monitor disk space for database growth

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker cp mf-web-app:/app/api/data/experiment.db "$BACKUP_DIR/experiment_$DATE.db"
```

## Migration from Development

If migrating from a development setup:
1. Export existing data from your development database
2. Build and start Docker containers
3. Initialize tables: `curl -X POST http://localhost:5000/api/create-tables`
4. Import your data using the API endpoints

## Support

For issues with Docker deployment:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure Docker and Docker Compose are up to date
4. Check available disk space and memory 