# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

Maggie's Farm is a behavioral research web application for conducting psychological experiments using apple-picking game mechanics. It collects behavioral data through interactive gaming scenarios, training sessions, and questionnaires for academic research studies.

## Technology Stack

- **Backend**: Node.js (v16+) with Express.js, SQLite3 database
- **Frontend**: React 16.13 with Bootstrap 4.5
- **Database**: SQLite3 (migrated from Microsoft SQL Server)
- **Deployment**: Docker with Docker Compose

## Development Commands

### Quick Start
```bash
npm run dev          # Start both frontend and backend in development
```

### Individual Components
```bash
npm run server       # Backend only (Express API on port 8080)
npm run client       # Frontend only (React dev server on port 3000)
npm start           # Production mode (port 8080 serves built React app)
```

### Build and Install
```bash
npm run build       # Build React frontend for production
npm run install-client  # Install frontend dependencies
```

### Docker Commands
```bash
./docker-build.sh   # Quick Docker build and start (recommended)
docker-compose build && docker-compose up -d  # Manual Docker setup
docker-compose logs -f  # View container logs
```

## Architecture

### Client-Server Structure
- **API Server**: Express.js on port 8080 (`/api/*` routes)
- **React Client**: Development on port 3000, production served from port 8080
- **Database**: SQLite3 at `api/data/experiment.db`

### Key Directories
- `api/` - Backend API with models, routes, config, and utils
- `client/src/` - React components, with main game logic in `game.js`, `farm.js`, `task.js`
- `client/public/images/` - Extensive game assets (apple, tree, juice images)

### Database Models
- **Task** - Experimental configurations
- **Training** - Training session data  
- **Behaviour** - Core behavioral data collection
- **TrainingBehaviour/QuestionsBehaviour/QuestionnairesBehaviour** - Specialized data types

## Key Features

### Research-Specific
- Behavioral data collection with reaction time tracking
- Parameter generation for experimental designs (`api/utils/paramGenerator.js`)
- Block-based trial organization
- Training and main task separation
- Mock mode for development (no database required)

### Data Export
- Web interface at `/output` endpoint
- CSV/JSON export functionality
- Summary statistics and analytics

## Configuration

### Environment Variables
- `NODE_ENV` - Set to 'production' for production builds
- `DB_PATH` - Custom SQLite database path (optional)
- `PORT` - Server port (default: 8080)

### Development vs Production
- **Development**: Frontend proxy in `client/package.json` points to `http://localhost:4545`
- **Production**: Express serves built React app from `client/build`
- **Database**: Auto-initializes on startup, uses mock mode if no database connection

## Important Implementation Notes

### React Client Specifics
- Uses class-based components (React 16.13)
- Bootstrap 4.5 for styling
- Legacy OpenSSL provider required for builds (`NODE_OPTIONS=--openssl-legacy-provider`)
- Survey functionality via `survey-react` library

### Backend Specifics  
- CORS enabled for development
- Helmet.js for security headers
- Morgan for request logging
- Automatic database table creation via `init-db.js`
- Parameter generation uses `mathjs` for complex calculations

### Database Migration
- Recently migrated from Microsoft SQL Server to SQLite3
- Simplified deployment (no external database required)
- Persistent Docker volumes for data storage
- Mock mode available for development without database setup

## Testing and Validation

No formal test suite exists. Validate changes by:
1. Running `npm run dev` and testing core functionality
2. Checking browser console for React errors
3. Verifying API endpoints via `/api/health` and `/api/db-health`
4. Testing data collection flow through training → main task → export

## Deployment

### Docker (Recommended)
- SQLite database persists via Docker volumes
- Single container deployment
- Health checks and logging configured

### Manual Deployment
- Requires Node.js 16+
- Build frontend with `npm run build`
- Set production environment variables
- Ensure SQLite database directory is writable