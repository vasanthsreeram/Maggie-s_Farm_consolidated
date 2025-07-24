const { getDB, runQuery, getAllRows, getRow } = require('../config/database');

class QuestionsBehaviour {
    constructor(data = {}) {
        this.id = data.id || null;
        this.UserNo = data.UserNo || null;
        this.ProlificID = data.ProlificID || null;
        this.TrainingNo = data.TrainingNo || null;
        this.TaskNo = data.TaskNo || null;
        this.Date = data.Date || null;
        this.UserStartTime = data.UserStartTime || null;
        this.InstructionsStartTime = data.InstructionsStartTime || null;
        this.QuestionsStartTime = data.QuestionsStartTime || null;
        this.QuestionsFinishTime = data.QuestionsFinishTime || null;
        this.SumPassed = data.SumPassed || null;
        this.PressedKeys = data.PressedKeys || null;
        this.PercentagePassed = data.PercentagePassed || null;
        this.ReactionTimes = data.ReactionTimes || null;
        this.Correct = data.Correct || null;
    }

    static async create(questionsBehaviourData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - questions behaviour data not saved');
            const questionsBehaviour = new QuestionsBehaviour(questionsBehaviourData);
            questionsBehaviour.id = Math.floor(Math.random() * 1000000); // Mock ID
            return questionsBehaviour;
        }
        
        const questionsBehaviour = new QuestionsBehaviour(questionsBehaviourData);
        
        const query = `
            INSERT INTO QuestionsBehaviour (
                UserNo, ProlificID, TrainingNo, TaskNo, Date, UserStartTime,
                InstructionsStartTime, QuestionsStartTime, QuestionsFinishTime, SumPassed, PressedKeys,
                PercentagePassed, ReactionTimes, Correct
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            questionsBehaviour.UserNo,
            questionsBehaviour.ProlificID,
            questionsBehaviour.TrainingNo,
            questionsBehaviour.TaskNo,
            questionsBehaviour.Date,
            questionsBehaviour.UserStartTime,
            questionsBehaviour.InstructionsStartTime,
            questionsBehaviour.QuestionsStartTime,
            questionsBehaviour.QuestionsFinishTime,
            questionsBehaviour.SumPassed,
            questionsBehaviour.PressedKeys,
            questionsBehaviour.PercentagePassed,
            questionsBehaviour.ReactionTimes,
            questionsBehaviour.Correct
        ];

        const result = await runQuery(query, params);
        questionsBehaviour.id = result.lastID;
        
        console.log('Saved questions behaviour data for user:', questionsBehaviour.UserNo);
        return questionsBehaviour;
    }

    static async getLastUserNo() {
        const db = await getDB();
        
        // If no database connection, return default value
        if (!db) {
            console.log('WARN: Database not available - returning default user number');
            return 1;
        }
        
        const query = 'SELECT MAX(UserNo) as max_user_no FROM QuestionsBehaviour';
        const row = await getRow(query);
        
        const maxUserNo = row ? row.max_user_no : null;
        const nextUserNo = maxUserNo ? maxUserNo + 1 : 1;
        
        console.log('Generated user number:', nextUserNo);
        return nextUserNo;
    }

    static async findByUser(userNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty questions behaviour data');
            return [];
        }
        
        const query = 'SELECT * FROM QuestionsBehaviour WHERE UserNo = ?';
        const rows = await getAllRows(query, [userNo]);
        
        return rows.map(row => new QuestionsBehaviour(row));
    }
}

module.exports = QuestionsBehaviour; 