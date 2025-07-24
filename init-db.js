const { getDB, runQuery, getAllRows } = require('./api/config/database');

async function initializeDatabase() {
    console.log('🗄️  Initializing database...');
    
    try {
        // Wait for database connection
        const db = await getDB();
        if (!db) {
            console.log('⚠️  Database not available, skipping initialization');
            return;
        }

        // Check if tables already exist by querying sqlite_master
        const existingTables = await getAllRows('SELECT name FROM sqlite_master WHERE type="table" AND name="Task"');
        let tablesExist = existingTables && existingTables.length > 0;
        
        if (tablesExist) {
            console.log('✅ Database tables already exist');
            // Always clear existing data and regenerate
            const trainingData = await getAllRows('SELECT COUNT(*) as count FROM Training');
            if (trainingData && trainingData[0].count > 0) {
                console.log('🔄 Training data exists - clearing and regenerating fresh data');
                console.log('🗑️  Clearing existing data...');
                delete require.cache[require.resolve('./api/utils/paramGenerator')];
                const ParamGenerator = require('./api/utils/paramGenerator');
                await ParamGenerator.clearAllTables();
            } else {
                console.log('📋 Training data missing, will generate...');
            }
        } else {
            console.log('📋 Tables do not exist, creating them...');
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

        if (!tablesExist) {
            console.log('✅ Database tables created successfully');

            // Verify tables were created
            const tableList = await getAllRows("SELECT name FROM sqlite_master WHERE type='table'");
            console.log('📋 Created tables:', tableList.map(t => t.name).join(', '));
        }

        // Generate initial training and task data for the application
        console.log('🎯 Generating initial training and task data...');
        try {
            delete require.cache[require.resolve('./api/utils/paramGenerator')];
            const ParamGenerator = require('./api/utils/paramGenerator');
            // Use optimized generation for better performance
            const options = {
                concurrency: 8, // Higher concurrency for initialization
                batchSize: 500, // Optimal batch size for SQLite bulk inserts
                enableTransactions: true
            };
            console.log('Using optimized generation with options:', options);
            const generationResult = await ParamGenerator.generateAllData(100, options); // Generate for 100 users to cover random range 1-100
            console.log(`✅ Generated ${generationResult.taskRecords} task records and ${generationResult.trainingRecords} training records for ${generationResult.users.length} users`);
        } catch (error) {
            console.warn('⚠️ Failed to generate initial data, but database is ready:', error.message);
        }

        console.log('🚀 Database initialization completed successfully');

    } catch (error) {
        console.error('❌ Failed to initialize database:', error.message);
        // Don't exit the process, let the app continue without database
    }
}

// Export for use in other files
module.exports = { initializeDatabase };

// If this file is run directly, execute initialization
if (require.main === module) {
    initializeDatabase().then(() => {
        console.log('Database initialization completed');
        process.exit(0);
    }).catch((error) => {
        console.error('Database initialization failed:', error);
        process.exit(1);
    });
} 