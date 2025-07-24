const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Environment validation
const validateConfig = () => {
    // For SQLite, we only need the database path
    return true; // SQLite is more flexible with configuration
};

// SQLite configuration
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/experiment.db');

let db;
let connectionAttempts = 0;
const maxRetries = 3;

const getDB = async () => {
    if (!db) {
        try {
            console.log(`Attempting database connection (attempt ${connectionAttempts + 1}/${maxRetries + 1})`);
            console.log(`Connecting to SQLite database at: ${dbPath}`);
            
            // Ensure the data directory exists
            const fs = require('fs');
            const dir = path.dirname(dbPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    throw err;
                }
                console.log('✅ Connected to SQLite database');
                connectionAttempts = 0; // Reset on successful connection
            });
            
            // Enable foreign keys
            db.run("PRAGMA foreign_keys = ON");
            
        } catch (error) {
            connectionAttempts++;
            console.error(`❌ Database connection failed (attempt ${connectionAttempts}):`, error.message);
            
            db = null;
            
            // Only throw error after max retries, or if in development
            if (connectionAttempts > maxRetries || process.env.NODE_ENV === 'development') {
                throw error;
            }
            
            // For production, return null to allow app to start without DB
            console.log('🔄 App will continue without database connection');
            return null;
        }
    }
    return db;
};

const closeDB = async () => {
    if (db) {
        try {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database connection:', err.message);
                } else {
                    console.log('Database connection closed');
                }
            });
        } catch (error) {
            console.error('Error closing database connection:', error.message);
        }
        db = null;
    }
};

// Test database connection without throwing errors
const testConnection = async () => {
    try {
        const testDB = await getDB();
        if (!testDB) return false;
        
        return new Promise((resolve) => {
            testDB.get('SELECT 1 as test', (err) => {
                resolve(!err);
            });
        });
    } catch (error) {
        console.error('Database test failed:', error.message);
        return false;
    }
};

// Helper function to run queries with promises
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
};

// Helper function to get all rows
const getAllRows = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

// Helper function to get one row
const getRow = (query, params = []) => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not connected'));
            return;
        }
        
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing database connection...');
    await closeDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing database connection...');
    await closeDB();
    process.exit(0);
});

module.exports = {
    getDB,
    closeDB,
    testConnection,
    validateConfig,
    runQuery,
    getAllRows,
    getRow
}; 