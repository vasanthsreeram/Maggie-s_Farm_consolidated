const { getDB, runQuery, getAllRows } = require('../config/database');

class QuestionnairesBehaviour {
    constructor(data = {}) {
        this.id = data.id || null;
        this.UserNo = data.UserNo || null;
        this.ProlificID = data.ProlificID || null;
        this.TrainingNo = data.TrainingNo || null;
        this.TaskNo = data.TaskNo || null;
        this.UserStartTime = data.UserStartTime || null;
        this.Date = data.Date || null;
        this.Shuffle = data.Shuffle || null;
        this.QuestionnaireStartTime = data.QuestionnaireStartTime || null;
        this.QuestionnaireFinishTime = data.QuestionnaireFinishTime || null;
        this.PageNo0 = data.PageNo0 || null;
        this.PageNo1 = data.PageNo1 || null;
        this.PageNo2 = data.PageNo2 || null;
        this.PageNo3 = data.PageNo3 || null;
        this.PageNo4 = data.PageNo4 || null;
        this.PageNo5 = data.PageNo5 || null;
        this.PageNo6 = data.PageNo6 || null;
        this.PageNo7 = data.PageNo7 || null;
        this.PageNo8 = data.PageNo8 || null;
        this.PageNo9 = data.PageNo9 || null;
        this.PageNo10 = data.PageNo10 || null;
        this.PageNo11 = data.PageNo11 || null;
        this.PageNo12 = data.PageNo12 || null;
        this.IQ_1 = data.IQ_1 || null;
        this.IQ_2 = data.IQ_2 || null;
        this.IQ_3 = data.IQ_3 || null;
        this.IQ_4 = data.IQ_4 || null;
        this.IQ_5 = data.IQ_5 || null;
        this.IQ_6 = data.IQ_6 || null;
        this.IQ_7 = data.IQ_7 || null;
        this.IQ_8 = data.IQ_8 || null;
        this.IQimage_1 = data.IQimage_1 || null;
        this.IQimage_2 = data.IQimage_2 || null;
        this.IQimage_3 = data.IQimage_3 || null;
        this.IQimage_4 = data.IQimage_4 || null;
        this.IQimage_5 = data.IQimage_5 || null;
        this.IQimage_6 = data.IQimage_6 || null;
        this.IQimage_7 = data.IQimage_7 || null;
        this.IQimage_8 = data.IQimage_8 || null;
        this.ASRS = data.ASRS || null;
        this.BIS11 = data.BIS11 || null;
        this.IUS = data.IUS || null;
        this.LSAS = data.LSAS || null;
        this.SDS = data.SDS || null;
        this.STAI = data.STAI || null;
        this.OCIR = data.OCIR || null;
        this.CFS = data.CFS || null;
        this.MEDIC = data.MEDIC || null;
        this.AQ10 = data.AQ10 || null;
    }

    static async create(questionnairesBehaviourData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - questionnaires behaviour data not saved');
            const questionnairesBehaviour = new QuestionnairesBehaviour(questionnairesBehaviourData);
            questionnairesBehaviour.id = Math.floor(Math.random() * 1000000); // Mock ID
            return questionnairesBehaviour;
        }
        
        const questionnairesBehaviour = new QuestionnairesBehaviour(questionnairesBehaviourData);
        
        const query = `
            INSERT INTO QuestionnairesBehaviour (
                UserNo, ProlificID, TrainingNo, TaskNo, UserStartTime, Date, Shuffle,
                QuestionnaireStartTime, QuestionnaireFinishTime, PageNo0, PageNo1, PageNo2, PageNo3, PageNo4,
                PageNo5, PageNo6, PageNo7, PageNo8, PageNo9, PageNo10, PageNo11, PageNo12,
                IQ_1, IQ_2, IQ_3, IQ_4, IQ_5, IQ_6, IQ_7, IQ_8,
                IQimage_1, IQimage_2, IQimage_3, IQimage_4, IQimage_5, IQimage_6, IQimage_7, IQimage_8
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            questionnairesBehaviour.UserNo,
            questionnairesBehaviour.ProlificID,
            questionnairesBehaviour.TrainingNo,
            questionnairesBehaviour.TaskNo,
            questionnairesBehaviour.UserStartTime,
            questionnairesBehaviour.Date,
            questionnairesBehaviour.Shuffle,
            questionnairesBehaviour.QuestionnaireStartTime,
            questionnairesBehaviour.QuestionnaireFinishTime,
            questionnairesBehaviour.PageNo0,
            questionnairesBehaviour.PageNo1,
            questionnairesBehaviour.PageNo2,
            questionnairesBehaviour.PageNo3,
            questionnairesBehaviour.PageNo4,
            questionnairesBehaviour.PageNo5,
            questionnairesBehaviour.PageNo6,
            questionnairesBehaviour.PageNo7,
            questionnairesBehaviour.PageNo8,
            questionnairesBehaviour.PageNo9,
            questionnairesBehaviour.PageNo10,
            questionnairesBehaviour.PageNo11,
            questionnairesBehaviour.PageNo12,
            questionnairesBehaviour.IQ_1,
            questionnairesBehaviour.IQ_2,
            questionnairesBehaviour.IQ_3,
            questionnairesBehaviour.IQ_4,
            questionnairesBehaviour.IQ_5,
            questionnairesBehaviour.IQ_6,
            questionnairesBehaviour.IQ_7,
            questionnairesBehaviour.IQ_8,
            questionnairesBehaviour.IQimage_1,
            questionnairesBehaviour.IQimage_2,
            questionnairesBehaviour.IQimage_3,
            questionnairesBehaviour.IQimage_4,
            questionnairesBehaviour.IQimage_5,
            questionnairesBehaviour.IQimage_6,
            questionnairesBehaviour.IQimage_7,
            questionnairesBehaviour.IQimage_8
        ];

        const result = await runQuery(query, params);
        questionnairesBehaviour.id = result.lastID;
        
        console.log('Saved questionnaires behaviour data for user:', questionnairesBehaviour.UserNo);
        return questionnairesBehaviour;
    }

    static async findByUser(userNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty questionnaires behaviour data');
            return [];
        }
        
        const query = 'SELECT * FROM QuestionnairesBehaviour WHERE UserNo = ?';
        const rows = await getAllRows(query, [userNo]);
        
        return rows.map(row => new QuestionnairesBehaviour(row));
    }
}

module.exports = QuestionnairesBehaviour; 