const express = require('express');
const router = express.Router();
const { getDB, getAllRows, getRow } = require('../config/database');

// Helper function to convert data to CSV format
const convertToCSV = (data, tableName) => {
    if (!data || data.length === 0) {
        return `${tableName}\nNo data available\n\n`;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(value => 
            // Escape commas and quotes in CSV
            typeof value === 'string' && (value.includes(',') || value.includes('"')) 
                ? `"${value.replace(/"/g, '""')}"` 
                : value
        ).join(',')
    ).join('\n');
    
    return `${tableName}\n${headers}\n${rows}\n\n`;
};

// GET /api/output - Get all data from all tables
router.get('/output', async (req, res) => {
    try {
        const db = await getDB();
        const format = req.query.format; // 'json' or 'csv'
        
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Database not available',
                message: 'Cannot retrieve data without database connection'
            });
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
        
        if (format === 'csv') {
            // Generate CSV content for behavior data only
            let csvContent = `Maggie's Farm - Behavior Data Export v3\nGenerated: ${summary.exportDate}\n\n`;
            csvContent += `SUMMARY\n`;
            csvContent += `Total Behavior Records,${summary.totalBehaviour}\n`;
            csvContent += `Unique Users,${summary.uniqueUsers}\n`;
            csvContent += `Total Blocks,${summary.totalBlocks}\n`;
            csvContent += `Total Trials,${summary.totalTrials}\n\n`;
            
            // Add behavior data
            csvContent += convertToCSV(behaviourData, 'Behaviour');
            
            // Set headers for CSV download
            const filename = `mf-behavior-data-export-${new Date().toISOString().split('T')[0]}.csv`;
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
            
        } else {
            // Return JSON format
            res.json({
                success: true,
                summary,
                data: { Behaviour: behaviourData },
                message: 'Behavior data retrieved successfully'
            });
        }
        
    } catch (error) {
        console.error('Error retrieving data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve data',
            message: error.message
        });
    }
});

// GET /api/output/summary - Get summary statistics only
router.get('/output/summary', async (req, res) => {
    try {
        const db = await getDB();
        
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Database not available',
                message: 'Cannot retrieve summary without database connection'
            });
        }
        
        const summaryQueries = {
            totalBehaviour: 'SELECT COUNT(*) as count FROM Behaviour',
            uniqueUsers: 'SELECT COUNT(DISTINCT UserNo) as count FROM Behaviour WHERE UserNo IS NOT NULL',
            totalBlocks: 'SELECT COUNT(DISTINCT CONCAT(UserNo, "-", BlockNo)) as count FROM Behaviour WHERE UserNo IS NOT NULL AND BlockNo IS NOT NULL',
            totalTrials: 'SELECT COUNT(*) as count FROM Behaviour'
        };
        
        const summary = {};
        
        for (const [key, query] of Object.entries(summaryQueries)) {
            try {
                const row = await getRow(query);
                summary[key] = parseInt(row.count);
            } catch (error) {
                console.error(`Error executing ${key} query:`, error);
                summary[key] = 0;
            }
        }
        
        summary.exportDate = new Date().toISOString();
        
        res.json({
            success: true,
            summary,
            message: 'Summary retrieved successfully'
        });
        
    } catch (error) {
        console.error('Error retrieving summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve summary',
            message: error.message
        });
    }
});

// GET /api/output/table/:tableName - Get data from specific table
router.get('/output/table/:tableName', async (req, res) => {
    try {
        const db = await getDB();
        const { tableName } = req.params;
        const format = req.query.format;
        
        if (!db) {
            return res.status(500).json({
                success: false,
                error: 'Database not available',
                message: 'Cannot retrieve table data without database connection'
            });
        }
        
        // Only allow Behaviour table access
        const allowedTables = ['Behaviour'];
        if (!allowedTables.includes(tableName)) {
            return res.status(400).json({
                success: false,
                error: 'Only Behaviour table data is available for export'
            });
        }
        
        const rows = await getAllRows(`SELECT * FROM ${tableName} ORDER BY id`);
        
        if (format === 'csv') {
            const csvContent = convertToCSV(rows, tableName);
            const filename = `${tableName.toLowerCase()}-data-${new Date().toISOString().split('T')[0]}.csv`;
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
        } else {
            res.json({
                success: true,
                tableName,
                count: rows.length,
                data: rows,
                message: `${tableName} data retrieved successfully`
            });
        }
        
    } catch (error) {
        console.error(`Error retrieving ${req.params.tableName} data:`, error);
        res.status(500).json({
            success: false,
            error: `Failed to retrieve ${req.params.tableName} data`,
            message: error.message
        });
    }
});

module.exports = router; 