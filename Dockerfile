# Multi-stage build for React + Node.js application
FROM node:18-alpine AS client-build

# Set working directory for client build
WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci --only=production

# Copy client source code
COPY client/ ./

# Build the React application with legacy OpenSSL provider
RUN export NODE_OPTIONS="--openssl-legacy-provider" && npm run build

# Production stage
FROM node:18-alpine AS production

# Install build dependencies for sqlite3 compilation
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite

# Set working directory
WORKDIR /app

# Copy server package files
COPY package*.json ./

# Install server dependencies (including sqlite3 compilation)
RUN npm ci --only=production

# Copy server source code
COPY . .

# Copy built client from previous stage
COPY --from=client-build /app/client/build ./client/build

# Create data directory for SQLite database
RUN mkdir -p /app/api/data

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory (including data directory)
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV DB_PATH=/app/api/data/experiment.db

# Health check (uses endpoint that doesn't require database)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["npm", "start"] 