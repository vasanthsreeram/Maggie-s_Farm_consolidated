const { getDB, runQuery, getAllRows } = require('../config/database');

class Training {
    constructor(data = {}) {
        this.id = data.id || null;
        this.TrainingNo = data.TrainingNo || null;
        this.TrialNo = data.TrialNo || null;
        this.InitialSample1Size = data.InitialSample1Size || null;
        this.InitialSample2Size = data.InitialSample2Size || null;
        this.InitialSample3Size = data.InitialSample3Size || null;
        this.Choice1Size = data.Choice1Size || null;
        this.Choice2Size = data.Choice2Size || null;
        this.Choice1Correct = data.Choice1Correct || null;
        this.Choice2Correct = data.Choice2Correct || null;
    }

    static async findByTrainingNo(trainingNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty training data');
            return [];
        }
        
        const query = 'SELECT * FROM Training WHERE TrainingNo = ? ORDER BY TrialNo';
        const rows = await getAllRows(query, [trainingNo]);
        
        return rows.map(row => new Training(row));
    }

    static async create(trainingData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - training data not saved');
            const training = new Training(trainingData);
            training.id = Math.floor(Math.random() * 1000000); // Mock ID
            return training;
        }
        
        const training = new Training(trainingData);
        
        const query = `
            INSERT INTO Training (
                TrainingNo, TrialNo, InitialSample1Size, InitialSample2Size, InitialSample3Size,
                Choice1Size, Choice2Size, Choice1Correct, Choice2Correct
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            training.TrainingNo,
            training.TrialNo,
            training.InitialSample1Size,
            training.InitialSample2Size,
            training.InitialSample3Size,
            training.Choice1Size,
            training.Choice2Size,
            training.Choice1Correct,
            training.Choice2Correct
        ];

        const result = await runQuery(query, params);
        training.id = result.lastID;
        
        console.log('Created training for TrainingNo:', training.TrainingNo, 'TrialNo:', training.TrialNo);
        return training;
    }

    // Getter methods
    getInitialSamplesSize() {
        return [this.InitialSample1Size, this.InitialSample2Size, this.InitialSample3Size];
    }

    getChoicesSize() {
        return [this.Choice1Size, this.Choice2Size];
    }

    getChoicesCorrect() {
        return [this.Choice1Correct, this.Choice2Correct];
    }

    static async batchCreate(trainingDataArray) {
        const db = await getDB();
        
        if (!db) {
            console.log('WARN: Database not available - training data not saved');
            return trainingDataArray.map(data => {
                const training = new Training(data);
                training.id = Math.floor(Math.random() * 1000000);
                return training;
            });
        }

        if (!trainingDataArray || trainingDataArray.length === 0) {
            return [];
        }

        // Build a single INSERT statement with multiple VALUES
        const baseQuery = `
            INSERT INTO Training (
                TrainingNo, TrialNo, InitialSample1Size, InitialSample2Size, InitialSample3Size,
                Choice1Size, Choice2Size, Choice1Correct, Choice2Correct
            ) VALUES `;

        // Create VALUES placeholders and collect all parameters
        const valueGroups = [];
        const allParams = [];
        
        for (const trainingData of trainingDataArray) {
            const training = new Training(trainingData);
            
            valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            allParams.push(
                training.TrainingNo,
                training.TrialNo,
                training.InitialSample1Size,
                training.InitialSample2Size,
                training.InitialSample3Size,
                training.Choice1Size,
                training.Choice2Size,
                training.Choice1Correct,
                training.Choice2Correct
            );
        }

        // Execute single bulk INSERT
        const fullQuery = baseQuery + valueGroups.join(', ');
        const result = await runQuery(fullQuery, allParams);

        console.log(`Bulk inserted ${trainingDataArray.length} training records in single query`);
        return trainingDataArray.map((data, index) => {
            const training = new Training(data);
            training.id = result.lastID - trainingDataArray.length + index + 1; // Approximate ID assignment
            return training;
        });
    }
}

module.exports = Training; 