const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const compression = require('compression');
// const crypto = require('crypto'); // Uncomment for nonce-based CSP
require('dotenv').config();

const app = express();

// Alternative more secure CSP configuration (uncomment to use):
/*
app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
    next();
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
            scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
*/

// Enhanced CSP configuration for production deployment
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "data:", "'sha256-KnbDoxcfgOjK2E2/48GklTaC96nBiJyNuXXLV+IxM10='"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https:", "ws:", "wss:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'", "https:", "data:"],
            frameSrc: ["'none'"],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["'self'", "blob:"]
        },
    },
    crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const taskRoutes = require('./api/routes/task');
const trainingRoutes = require('./api/routes/training');
const behaviourRoutes = require('./api/routes/behaviour');
const trainingBehaviourRoutes = require('./api/routes/trainingBehaviour');
const questionsBehaviourRoutes = require('./api/routes/questionsBehaviour');
const questionnairesBehaviourRoutes = require('./api/routes/questionnairesBehaviour');
const dbRoutes = require('./api/routes/database');
const outputRoutes = require('./api/routes/output');

// API Routes
app.use('/api', taskRoutes);
app.use('/api', trainingRoutes);
app.use('/api', behaviourRoutes);
app.use('/api', trainingBehaviourRoutes);
app.use('/api', questionsBehaviourRoutes);
app.use('/api', questionnairesBehaviourRoutes);
app.use('/api', dbRoutes);
app.use('/api', outputRoutes);

// Health check endpoint (doesn't require database)
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint (backward compatibility)
app.get('/api/testmethod', (req, res) => {
    res.json({ test: 'ok' });
});

// Admin API endpoints
// Update experiment configuration and regenerate database
// Admin panel for data export
app.get('/admin', async (req, res) => {
    try {
        const { getDB, getAllRows } = require('./api/config/database');
        const db = await getDB();
        
        if (!db) {
            return res.status(500).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Data Export - Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .error { color: #d32f2f; }
                        h1 { color: #333; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>❌ Database Error <span style="font-size: 0.5em; color: #666; font-weight: normal;">v3</span></h1>
                        <p class="error">Database is not available. Cannot export experiment data.</p>
                        <p><a href="/">← Back to Home</a></p>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Fetch behavior data only
        const behaviourData = await getAllRows('SELECT * FROM Behaviour ORDER BY id');
        
        // Calculate behavior summary
        const summary = {
            totalBehaviour: behaviourData.length,
            uniqueUsers: new Set(behaviourData.map(b => b.UserNo).filter(Boolean)).size,
            totalBlocks: new Set(behaviourData.map(b => `${b.UserNo}-${b.BlockNo}`).filter(Boolean)).size,
            totalTrials: behaviourData.length,
            exportDate: new Date().toISOString()
        };
        
        // Generate CSV content for behavior data only
        let csvContent = `Maggie's Farm - Behavior Data Export v3\\nGenerated: ${summary.exportDate}\\n\\n`;
        csvContent += `SUMMARY\\n`;
        csvContent += `Total Behavior Records,${summary.totalBehaviour}\\n`;
        csvContent += `Unique Users,${summary.uniqueUsers}\\n`;
        csvContent += `Total Blocks,${summary.totalBlocks}\\n`;
        csvContent += `Total Trials,${summary.totalTrials}\\n\\n`;
        
        // Add behavior data
        if (behaviourData && behaviourData.length > 0) {
            csvContent += `Behaviour Data\\n`;
            const headers = Object.keys(behaviourData[0]).join(',');
            csvContent += `${headers}\\n`;
            const rows = behaviourData.map(row => 
                Object.values(row).map(value => 
                    typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                        ? `"${value.replace(/"/g, '""')}"` 
                        : value
                ).join(',')
            ).join('\\n');
            csvContent += `${rows}\\n\\n`;
        } else {
            csvContent += `Behaviour Data\\nNo data available\\n\\n`;
        }
         
         // Send HTML page with data export functionality
         res.send(`
             <!DOCTYPE html>
             <html>
             <head>
                 <title>Maggie's Farm - Data Export</title>
                 <style>
                     body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                     .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                     .section { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
                     .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px; }
                     .stat-card { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; }
                     .stat-number { font-size: 24px; font-weight: bold; color: #2196F3; }
                     .btn { display: inline-block; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 14px; margin: 10px 5px; border: none; cursor: pointer; }
                     .btn-primary { background: #2196F3; }
                     .btn-success { background: #4CAF50; }
                     .btn:hover { opacity: 0.9; }
                     h1, h2 { color: #333; }
                     .timestamp { color: #666; font-size: 14px; }
                 </style>
             </head>
             <body>
                 <div class="container">
                     <h1>📊 Maggie's Farm - Data Export</h1>
                     <p>Export behavioral data collected from the experiment.</p>
                     
                     <div class="section">
                         <h2>📊 Current Data Summary</h2>
                         <div class="stats">
                             <div class="stat-card">
                                 <div class="stat-number">${summary.totalBehaviour}</div>
                                 <div>Behavior Records</div>
                             </div>
                             <div class="stat-card">
                                 <div class="stat-number">${summary.uniqueUsers}</div>
                                 <div>Unique Users</div>
                             </div>
                             <div class="stat-card">
                                 <div class="stat-number">${summary.totalBlocks}</div>
                                 <div>Total Blocks</div>
                             </div>
                             <div class="stat-card">
                                 <div class="stat-number">${summary.totalTrials}</div>
                                 <div>Total Trials</div>
                             </div>
                         </div>
                     </div>
                     
                     <div class="section">
                         <h2>⚙️ Parameter Configuration</h2>
                         <p style="color: #666; margin-bottom: 15px;">
                             <strong>Note:</strong> This affects only the Task and Training tables. Behavioral data (Behaviour, TrainingBehaviour, etc.) is preserved.
                         </p>
                         <form id="configForm" style="margin-bottom: 20px;">
                             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                                 <div>
                                     <label for="months" style="display: block; margin-bottom: 5px; font-weight: bold;">Number of Months (Blocks):</label>
                                     <input type="number" id="months" name="months" value="4" min="1" max="12" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                 </div>
                                 <div>
                                     <label for="trialsPerMonth" style="display: block; margin-bottom: 5px; font-weight: bold;">Trials per Month:</label>
                                     <input type="number" id="trialsPerMonth" name="trialsPerMonth" value="20" min="1" max="100" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                 </div>
                             </div>
                             <div style="margin-bottom: 20px;">
                                 <label for="userCount" style="display: block; margin-bottom: 5px; font-weight: bold;">Number of Users:</label>
                                 <input type="number" id="userCount" name="userCount" value="10" min="1" max="1000" style="width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                             </div>
                             <button type="button" onclick="generateParameters()" class="btn btn-primary">🔄 Generate Parameters</button>
                             <button type="button" onclick="clearTables()" class="btn" style="background: #ff9800;">🗑️ Clear Parameter Tables</button>
                         </form>
                         <div id="generationResult" style="margin-top: 15px; padding: 10px; border-radius: 4px; display: none;"></div>
                     </div>
                     
                     <div class="section">
                         <h2>📥 Data Export</h2>
                         <a href="/api/output?format=csv" class="btn btn-success">📥 Download Behavior Data (CSV)</a>
                         <a href="/api/output?format=json" class="btn btn-primary">📥 Download as JSON</a>
                         
                         <h3>📋 Export Details:</h3>
                         <ul>
                             <li>🍎 Apple selection choices (ChosenTree, ChosenAppleSize)</li>
                             <li>⏱️ Reaction times and timing data</li>
                             <li>🎯 Trial and block information</li>
                             <li>🌳 Tree positions and colors</li>
                             <li>📊 User performance data</li>
                             <li>🔢 All key presses and user interactions</li>
                         </ul>
                     </div>
                     
                     <div class="timestamp">
                         <p>Last updated: ${new Date(summary.exportDate).toLocaleString()}</p>
                     </div>
                     
                     <p><a href="/">← Back to Experiment</a></p>
                 </div>
                 
                 <script>
                     async function generateParameters() {
                         const months = document.getElementById('months').value;
                         const trialsPerMonth = document.getElementById('trialsPerMonth').value;
                         const userCount = document.getElementById('userCount').value;
                         const resultDiv = document.getElementById('generationResult');
                         
                         resultDiv.style.display = 'block';
                         resultDiv.style.background = '#e3f2fd';
                         resultDiv.style.color = '#1976d2';
                         resultDiv.innerHTML = '⏳ Generating parameters...';
                         
                         try {
                             const response = await fetch(\`/api/generate-data/\${userCount}\`, {
                                 method: 'POST',
                                 headers: {
                                     'Content-Type': 'application/json',
                                 },
                                 body: JSON.stringify({
                                     months: parseInt(months),
                                     trialsPerBlock: parseInt(trialsPerMonth)
                                 })
                             });
                             
                             const result = await response.json();
                             
                             if (result.success) {
                                 resultDiv.style.background = '#e8f5e8';
                                 resultDiv.style.color = '#2e7d32';
                                 resultDiv.innerHTML = \`✅ Successfully generated parameters for \${userCount} users with \${months} months and \${trialsPerMonth} trials per month. <a href="#" onclick="location.reload()" style="color: #1976d2;">Refresh page</a> to see updated statistics.\`;
                             } else {
                                 throw new Error(result.message || 'Unknown error');
                             }
                         } catch (error) {
                             resultDiv.style.background = '#ffebee';
                             resultDiv.style.color = '#c62828';
                             resultDiv.innerHTML = \`❌ Error: \${error.message}\`;
                         }
                     }
                     
                     async function clearTables() {
                         const resultDiv = document.getElementById('generationResult');
                         
                         if (!confirm('Are you sure you want to clear parameter tables (Task and Training)? This will NOT delete behavioral data. This action cannot be undone.')) {
                             return;
                         }
                         
                         resultDiv.style.display = 'block';
                         resultDiv.style.background = '#fff3e0';
                         resultDiv.style.color = '#f57c00';
                         resultDiv.innerHTML = '⏳ Clearing parameter tables (preserving behavioral data)...';
                         
                         try {
                             const response = await fetch('/api/clear-tables', {
                                 method: 'POST'
                             });
                             
                             const result = await response.json();
                             
                             if (result.success) {
                                 resultDiv.style.background = '#e8f5e8';
                                 resultDiv.style.color = '#2e7d32';
                                 resultDiv.innerHTML = \`✅ Parameter tables cleared successfully (behavioral data preserved). <a href="#" onclick="location.reload()" style="color: #1976d2;">Refresh page</a> to see updated statistics.\`;
                             } else {
                                 throw new Error(result.message || 'Unknown error');
                             }
                         } catch (error) {
                             resultDiv.style.background = '#ffebee';
                             resultDiv.style.color = '#c62828';
                             resultDiv.innerHTML = \`❌ Error: \${error.message}\`;
                         }
                     }
                 </script>
             </body>
             </html>
         `);
         
     } catch (error) {
         console.error('Error in /admin route:', error);
         res.status(500).send(`
             <!DOCTYPE html>
             <html>
             <head>
                 <title>Data Export - Error</title>
                 <style>
                     body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                     .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                     .error { color: #d32f2f; }
                     h1 { color: #333; }
                 </style>
             </head>
             <body>
                 <div class="container">
                     <h1>❌ Export Error <span style="font-size: 0.5em; color: #666; font-weight: normal;">v3</span></h1>
                     <p class="error">An error occurred while exporting data: ${error.message}</p>
                     <p><a href="/">← Back to Home</a></p>
                 </div>
             </body>
             </html>
         `);
     }
 });

// Database health check (separate endpoint)
app.get('/api/db-health', async (req, res) => {
    try {
        const { getDB, getRow } = require('./api/config/database');
        const db = await getDB();
        
        if (!db) {
            return res.status(503).json({ 
                database: 'disconnected',
                error: 'Database not available',
                timestamp: new Date().toISOString()
            });
        }
        
        const row = await getRow('SELECT 1 as test');
        res.json({ 
            database: 'connected',
            type: 'SQLite',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Add security headers for storage access
app.use((req, res, next) => {
    // Allow storage access in cross-origin contexts
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    
    // Ensure storage is available
    res.setHeader('Permissions-Policy', 'storage-access=*');
    
    next();
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
    // Set additional headers for static files
    app.use(express.static(path.join(__dirname, 'client/build'), {
        setHeaders: (res, path) => {
            // Allow all origins for static assets to prevent CORS issues
            res.setHeader('Access-Control-Allow-Origin', '*');
            
            // Cache static assets
            if (path.endsWith('.js') || path.endsWith('.css')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
        }
    }));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'MF Web API Server Running', env: 'development' });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || (process.env.NODE_ENV === 'development' ? 8092 : 8080);

// Initialize database on startup
const { initializeDatabase } = require('./init-db');

// Function to get Docker container information
function getDockerInfo() {
    const fs = require('fs');
    const os = require('os');
    
    let dockerInfo = {
        containerId: 'not-in-docker',
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        pid: process.pid
    };
    
    try {
        // Try to read Docker container ID from /proc/self/cgroup (Linux containers)
        if (fs.existsSync('/proc/self/cgroup')) {
            const cgroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
            const dockerMatch = cgroup.match(/\/docker\/([a-f0-9]{64})/);
            if (dockerMatch) {
                dockerInfo.containerId = dockerMatch[1].substring(0, 12); // Short ID
            }
        }
        
        // Try to read from Docker environment variables
        if (process.env.HOSTNAME) {
            dockerInfo.dockerHostname = process.env.HOSTNAME;
        }
    } catch (error) {
        // Ignore errors - not in Docker or can't access container info
    }
    
    return dockerInfo;
}

// Function to test database connectivity
async function testDatabaseConnection() {
    try {
        const { getDB, getRow } = require('./api/config/database');
        const db = await getDB();
        
        if (!db) {
            return { status: 'error', message: 'Database not available' };
        }
        
        const testResult = await getRow('SELECT 1 as test');
        return { status: 'success', message: 'Database connected', testResult };
    } catch (error) {
        return { status: 'error', message: error.message };
    }
}

// Function to test API endpoints
async function testAPIEndpoints() {
    const http = require('http');
    
    const endpoints = [
        '/api/health',
        '/api/testmethod',
        '/api/db-health'
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
        try {
            const response = await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${PORT}${endpoint}`, { timeout: 5000 }, (res) => {
                    resolve({ status: 'success', code: res.statusCode });
                });
                req.on('error', reject);
                req.on('timeout', () => reject(new Error('Request timeout')));
            });
            results[endpoint] = response;
        } catch (error) {
            results[endpoint] = { 
                status: 'error', 
                code: 'timeout',
                message: error.message 
            };
        }
    }
    
    return results;
}

app.listen(PORT, '0.0.0.0', async () => {
    console.log('\n=== MAGGIE\'S FARM SERVER STARTUP ===');
    console.log('🚀 Starting server initialization...');
    
    // Get Docker and system information
    const dockerInfo = getDockerInfo();
    console.log('\n📋 SYSTEM INFORMATION:');
    console.log(`   Docker Container ID: ${dockerInfo.containerId}`);
    console.log(`   Hostname: ${dockerInfo.hostname}`);
    console.log(`   Platform: ${dockerInfo.platform} (${dockerInfo.arch})`);
    console.log(`   Node.js Version: ${dockerInfo.nodeVersion}`);
    console.log(`   Process ID: ${dockerInfo.pid}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
    
    // Initialize database tables automatically
    console.log('\n🗄️  DATABASE INITIALIZATION:');
    try {
        await initializeDatabase();
        console.log('   ✅ Database initialized successfully');
    } catch (error) {
        console.log('   ❌ Database initialization failed:', error.message);
    }
    
    // Test database connectivity
    console.log('\n🔍 DATABASE CONNECTIVITY TEST:');
    const dbTest = await testDatabaseConnection();
    if (dbTest.status === 'success') {
        console.log('   ✅ Database connection test passed');
    } else {
        console.log('   ❌ Database connection test failed:', dbTest.message);
    }
    
    // Wait a moment for server to be ready then test API endpoints
    console.log('\n🌐 API ENDPOINT TESTS:');
    setTimeout(async () => {
        try {
            const apiTests = await testAPIEndpoints();
            for (const [endpoint, result] of Object.entries(apiTests)) {
                if (result.status === 'success') {
                    console.log(`   ✅ ${endpoint} - Status: ${result.code}`);
                } else {
                    console.log(`   ❌ ${endpoint} - Error: ${result.code} (${result.message})`);
                }
            }
        } catch (error) {
            console.log('   ❌ API endpoint testing failed:', error.message);
        }
        
        console.log('\n🚀 Application fully initialized and ready to accept connections');
        console.log(`   Server URL: http://localhost:${PORT}`);
        console.log(`   Health Check: http://localhost:${PORT}/api/health`);
        console.log(`   Database Health: http://localhost:${PORT}/api/db-health`);
        console.log('\n========================================\n');
    }, 1000);
}); 