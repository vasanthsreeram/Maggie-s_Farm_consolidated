const { getDB, runQuery, getAllRows } = require('../config/database');

class Behaviour {
    constructor(data = {}) {
        this.id = data.id || null;
        this.UserNo = data.UserNo || null;
        this.ProlificID = data.ProlificID || null;
        this.TaskNo = data.TaskNo || null;
        this.TrainingNo = data.TrainingNo || null;
        this.Date = data.Date || null;
        this.UserStartTime = data.UserStartTime || null;
        this.BlockNo = data.BlockNo || null;
        this.InfoRequestNo = data.InfoRequestNo || null;
        this.BlockStartTime = data.BlockStartTime || null;
        this.BlockFinishTime = data.BlockFinishTime || null;
        this.TreeColours = data.TreeColours || null;
        this.ChosenTree = data.ChosenTree || null;
        this.ChosenAppleSize = data.ChosenAppleSize || null;
        this.AllKeyPressed = data.AllKeyPressed || null;
        this.ReactionTimes = data.ReactionTimes || null;
        this.Horizon = data.Horizon || null;
        this.ItemNo = data.ItemNo || null;
        this.TrialNo = data.TrialNo || null;
        this.UnusedTree = data.UnusedTree || null;
        this.InitialSamplesNb = data.InitialSamplesNb || null;
        this.InitialSamplesTree = data.InitialSamplesTree || null;
        this.InitialSamplesSize = data.InitialSamplesSize || null;
        this.TreePositions = data.TreePositions || null;
    }

    static async create(behaviourData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - behaviour data not saved');
            const behaviour = new Behaviour(behaviourData);
            behaviour.id = Math.floor(Math.random() * 1000000); // Mock ID
            return behaviour;
        }
        
        const behaviour = new Behaviour(behaviourData);
        
        const query = `
            INSERT INTO Behaviour (
                UserNo, ProlificID, TaskNo, TrainingNo, Date, UserStartTime, BlockNo,
                InfoRequestNo, BlockStartTime, BlockFinishTime, TreeColours, ChosenTree, ChosenAppleSize,
                AllKeyPressed, ReactionTimes, Horizon, ItemNo, TrialNo, UnusedTree, InitialSamplesNb,
                InitialSamplesTree, InitialSamplesSize, TreePositions
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?
            )
        `;

        const params = [
            behaviour.UserNo,
            behaviour.ProlificID,
            behaviour.TaskNo,
            behaviour.TrainingNo,
            behaviour.Date,
            behaviour.UserStartTime,
            behaviour.BlockNo,
            behaviour.InfoRequestNo,
            behaviour.BlockStartTime,
            behaviour.BlockFinishTime,
            behaviour.TreeColours,
            behaviour.ChosenTree,
            behaviour.ChosenAppleSize,
            behaviour.AllKeyPressed,
            behaviour.ReactionTimes,
            behaviour.Horizon,
            behaviour.ItemNo,
            behaviour.TrialNo,
            behaviour.UnusedTree,
            behaviour.InitialSamplesNb,
            behaviour.InitialSamplesTree,
            behaviour.InitialSamplesSize,
            behaviour.TreePositions
        ];

        const result = await runQuery(query, params);
        behaviour.id = result.lastID;
        
        console.log('Saved behaviour data for user:', behaviour.UserNo, 'block:', behaviour.BlockNo);
        return behaviour;
    }

    static async findByUserAndBlock(userNo, blockNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty behaviour data');
            return [];
        }
        
        const query = 'SELECT * FROM Behaviour WHERE UserNo = ? AND BlockNo = ?';
        const rows = await getAllRows(query, [userNo, blockNo]);
        
        return rows.map(row => new Behaviour(row));
    }
}

module.exports = Behaviour; 