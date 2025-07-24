const { getDB, runQuery, getAllRows } = require('../config/database');

class TrainingBehaviour {
    constructor(data = {}) {
        this.id = data.id || null;
        this.UserNo = data.UserNo || null;
        this.ProlificID = data.ProlificID || null;
        this.TrainingNo = data.TrainingNo || null;
        this.TaskNo = data.TaskNo || null;
        this.Date = data.Date || null;
        this.UserStartTime = data.UserStartTime || null;
        this.TrainingStartTime = data.TrainingStartTime || null;
        this.TrainingFinishTime = data.TrainingFinishTime || null;
        this.SumPassed = data.SumPassed || null;
        this.ChoicesSize = data.ChoicesSize || null;
        this.InitialSamplesSize = data.InitialSamplesSize || null;
        this.ReactionTimes = data.ReactionTimes || null;
        this.ChoicesCorrect = data.ChoicesCorrect || null;
        this.Chosen = data.Chosen || null;
        this.CorrectAns = data.CorrectAns || null;
        this.NumTraining = data.NumTraining || null;
    }

    static async create(trainingBehaviourData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - training behaviour data not saved');
            const trainingBehaviour = new TrainingBehaviour(trainingBehaviourData);
            trainingBehaviour.id = Math.floor(Math.random() * 1000000); // Mock ID
            return trainingBehaviour;
        }
        
        const trainingBehaviour = new TrainingBehaviour(trainingBehaviourData);
        
        const query = `
            INSERT INTO TrainingBehaviour (
                UserNo, ProlificID, TrainingNo, TaskNo, Date, UserStartTime,
                TrainingStartTime, TrainingFinishTime, SumPassed, ChoicesSize, InitialSamplesSize,
                ReactionTimes, ChoicesCorrect, Chosen, CorrectAns, NumTraining
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            trainingBehaviour.UserNo,
            trainingBehaviour.ProlificID,
            trainingBehaviour.TrainingNo,
            trainingBehaviour.TaskNo,
            trainingBehaviour.Date,
            trainingBehaviour.UserStartTime,
            trainingBehaviour.TrainingStartTime,
            trainingBehaviour.TrainingFinishTime,
            trainingBehaviour.SumPassed,
            trainingBehaviour.ChoicesSize,
            trainingBehaviour.InitialSamplesSize,
            trainingBehaviour.ReactionTimes,
            trainingBehaviour.ChoicesCorrect,
            trainingBehaviour.Chosen,
            trainingBehaviour.CorrectAns,
            trainingBehaviour.NumTraining
        ];

        const result = await runQuery(query, params);
        trainingBehaviour.id = result.lastID;
        
        console.log('Saved training behaviour data for user:', trainingBehaviour.UserNo);
        return trainingBehaviour;
    }

    static async findByUser(userNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty training behaviour data');
            return [];
        }
        
        const query = 'SELECT * FROM TrainingBehaviour WHERE UserNo = ?';
        const rows = await getAllRows(query, [userNo]);
        
        return rows.map(row => new TrainingBehaviour(row));
    }
}

module.exports = TrainingBehaviour; 