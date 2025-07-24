const express = require('express');
const router = express.Router();
const { getDB, runQuery, getAllRows, getRow } = require('../config/database');
const paramGenerator = require('../utils/paramGenerator');

// POST /api/create-tables - Create all database tables
router.post('/create-tables', async (req, res) => {
    try {
        const db = await getDB();
        
        if (!db) {
            return res.status(500).json({
                message: 'Database connection not available',
                error: 'Cannot create tables without database connection'
            });
        }
        
        // Create Task table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS Task (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                TaskNo INTEGER,
                TrialNo INTEGER,
                BlockNo INTEGER,
                Horizon INTEGER,
                ItemNo INTEGER,
                InitialSampleNb INTEGER,
                UnusedTree INTEGER,
                DisplayOrder1 INTEGER,
                DisplayOrder2 INTEGER,
                DisplayOrder3 INTEGER,
                TreePositions1 INTEGER,
                TreePositions2 INTEGER,
                TreePositions3 INTEGER,
                TreePositions4 INTEGER,
                InitialSample1Tree INTEGER,
                InitialSample2Tree INTEGER,
                InitialSample3Tree INTEGER,
                InitialSample4Tree INTEGER,
                InitialSample5Tree INTEGER,
                InitialSample1Size INTEGER,
                InitialSample2Size INTEGER,
                InitialSample3Size INTEGER,
                InitialSample4Size INTEGER,
                InitialSample5Size INTEGER,
                Tree1FutureSize1 INTEGER,
                Tree1FutureSize2 INTEGER,
                Tree1FutureSize3 INTEGER,
                Tree1FutureSize4 INTEGER,
                Tree1FutureSize5 INTEGER,
                Tree1FutureSize6 INTEGER,
                Tree2FutureSize1 INTEGER,
                Tree2FutureSize2 INTEGER,
                Tree2FutureSize3 INTEGER,
                Tree2FutureSize4 INTEGER,
                Tree2FutureSize5 INTEGER,
                Tree2FutureSize6 INTEGER,
                Tree3FutureSize1 INTEGER,
                Tree3FutureSize2 INTEGER,
                Tree3FutureSize3 INTEGER,
                Tree3FutureSize4 INTEGER,
                Tree3FutureSize5 INTEGER,
                Tree3FutureSize6 INTEGER,
                Tree4FutureSize1 INTEGER,
                Tree4FutureSize2 INTEGER,
                Tree4FutureSize3 INTEGER,
                Tree4FutureSize4 INTEGER,
                Tree4FutureSize5 INTEGER,
                Tree4FutureSize6 INTEGER
            )
        `);

        // Create Training table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS Training (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                TrainingNo INTEGER,
                TrialNo INTEGER,
                InitialSample1Size INTEGER,
                InitialSample2Size INTEGER,
                InitialSample3Size INTEGER,
                Choice1Size INTEGER,
                Choice2Size INTEGER,
                Choice1Correct INTEGER,
                Choice2Correct INTEGER
            )
        `);

        // Create Behaviour table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS Behaviour (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                UserNo INTEGER,
                ProlificID TEXT,
                TaskNo TEXT,
                TrainingNo TEXT,
                Date TEXT,
                UserStartTime TEXT,
                BlockNo INTEGER,
                InfoRequestNo TEXT,
                BlockStartTime TEXT,
                BlockFinishTime TEXT,
                TreeColours TEXT,
                ChosenTree TEXT,
                ChosenAppleSize TEXT,
                AllKeyPressed TEXT,
                ReactionTimes TEXT,
                Horizon TEXT,
                ItemNo TEXT,
                TrialNo TEXT,
                UnusedTree TEXT,
                InitialSamplesNb TEXT,
                InitialSamplesTree TEXT,
                InitialSamplesSize TEXT,
                TreePositions TEXT
            )
        `);

        // Create TrainingBehaviour table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS TrainingBehaviour (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                UserNo INTEGER,
                ProlificID TEXT,
                TrainingNo TEXT,
                TaskNo TEXT,
                Date TEXT,
                UserStartTime TEXT,
                TrainingStartTime TEXT,
                TrainingFinishTime TEXT,
                SumPassed TEXT,
                ChoicesSize TEXT,
                InitialSamplesSize TEXT,
                ReactionTimes TEXT,
                ChoicesCorrect TEXT,
                Chosen TEXT,
                CorrectAns TEXT,
                NumTraining TEXT
            )
        `);

        // Create QuestionsBehaviour table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS QuestionsBehaviour (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                UserNo INTEGER,
                ProlificID TEXT,
                TrainingNo TEXT,
                TaskNo TEXT,
                Date TEXT,
                UserStartTime TEXT,
                InstructionsStartTime TEXT,
                QuestionsStartTime TEXT,
                QuestionsFinishTime TEXT,
                SumPassed TEXT,
                PressedKeys TEXT,
                PercentagePassed TEXT,
                ReactionTimes TEXT,
                Correct TEXT
            )
        `);

        // Create QuestionnairesBehaviour table
        await runQuery(`
            CREATE TABLE IF NOT EXISTS QuestionnairesBehaviour (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                UserNo INTEGER,
                ProlificID TEXT,
                TrainingNo TEXT,
                TaskNo TEXT,
                UserStartTime TEXT,
                Date TEXT,
                Shuffle TEXT,
                QuestionnaireStartTime TEXT,
                QuestionnaireFinishTime TEXT,
                PageNo0 TEXT,
                PageNo1 TEXT,
                PageNo2 TEXT,
                PageNo3 TEXT,
                PageNo4 TEXT,
                PageNo5 TEXT,
                PageNo6 TEXT,
                PageNo7 TEXT,
                PageNo8 TEXT,
                PageNo9 TEXT,
                PageNo10 TEXT,
                PageNo11 TEXT,
                PageNo12 TEXT,
                IQ_1 TEXT,
                IQ_2 TEXT,
                IQ_3 TEXT,
                IQ_4 TEXT,
                IQ_5 TEXT,
                IQ_6 TEXT,
                IQ_7 TEXT,
                IQ_8 TEXT,
                IQimage_1 TEXT,
                IQimage_2 TEXT,
                IQimage_3 TEXT,
                IQimage_4 TEXT,
                IQimage_5 TEXT,
                IQimage_6 TEXT,
                IQimage_7 TEXT,
                IQimage_8 TEXT,
                ASRS TEXT,
                BIS11 TEXT,
                IUS TEXT,
                LSAS TEXT,
                SDS TEXT,
                STAI TEXT,
                OCIR TEXT,
                CFS TEXT,
                MEDIC TEXT,
                AQ10 TEXT
            )
        `);

        console.log('All database tables created successfully');
        res.json({
            message: 'All database tables created successfully',
            status: 'success',
            tables: ['Task', 'Training', 'Behaviour', 'TrainingBehaviour', 'QuestionsBehaviour', 'QuestionnairesBehaviour']
        });

    } catch (error) {
        console.error('Error creating tables:', error);
        res.status(500).json({
            message: 'Error creating database tables',
            error: error.message
        });
    }
});

// POST /api/generate-data/:userCount - Generate task and training data
router.post('/generate-data/:userCount', async (req, res) => {
    try {
        const userCount = parseInt(req.params.userCount) || 10;
        
        // Extract configuration from request body
        const config = {
            months: req.body.months || 4,
            trialsPerBlock: req.body.trialsPerBlock || 20,
            trainingTrials: req.body.trainingTrials || 10
        };
        
        // Use optimized generation with configurable options
        const options = {
            concurrency: Math.min(4, Math.max(1, Math.floor(userCount / 10))),
            batchSize: 100,
            enableTransactions: true,
            config: config
        };
        
        console.log(`Generating data for ${userCount} users with configuration:`, config);
        const generatedData = await paramGenerator.generateAllData(userCount, options);
        
        res.json({ 
            success: true, 
            message: `Data generated for ${userCount} users with ${config.months} months and ${config.trialsPerBlock} trials per month`,
            data: generatedData,
            config: config
        });
    } catch (error) {
        console.error('Error generating data:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to generate data',
            message: error.message 
        });
    }
});

// POST /api/clear-tables - Clear all tables
router.post('/clear-tables', async (req, res) => {
    try {
        await paramGenerator.clearAllTables();
        
        res.json({
            success: true,
            message: 'All tables cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing tables:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear tables',
            message: error.message
        });
    }
});

// GET /api/database-status - Check database connection
router.get('/database-status', async (req, res) => {
    try {
        const db = await getDB();
        
        // If no database connection (mock mode)
        if (!db) {
            return res.json({ 
                success: true, 
                message: 'Running in mock mode - no database configured',
                mode: 'mock',
                database: 'none'
            });
        }
        
        const row = await getRow('SELECT datetime("now") as current_time');
        
        res.json({ 
            success: true, 
            message: 'Database connection successful',
            timestamp: row.current_time,
            database: 'SQLite',
            mode: 'production'
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Database connection failed',
            message: error.message 
        });
    }
});

module.exports = router; 