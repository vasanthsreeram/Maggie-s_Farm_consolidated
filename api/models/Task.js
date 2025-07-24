const { getDB, runQuery, getAllRows } = require('../config/database');

class Task {
    constructor(data = {}) {
        this.id = data.id || null;
        this.TaskNo = data.TaskNo || null;
        this.TrialNo = data.TrialNo || null;
        this.BlockNo = data.BlockNo || null;
        this.Horizon = data.Horizon || null;
        this.ItemNo = data.ItemNo || null;
        this.InitialSampleNb = data.InitialSampleNb || null;
        this.UnusedTree = data.UnusedTree || null;
        this.DisplayOrder1 = data.DisplayOrder1 || null;
        this.DisplayOrder2 = data.DisplayOrder2 || null;
        this.DisplayOrder3 = data.DisplayOrder3 || null;
        this.TreePositions1 = data.TreePositions1 || null;
        this.TreePositions2 = data.TreePositions2 || null;
        this.TreePositions3 = data.TreePositions3 || null;
        this.TreePositions4 = data.TreePositions4 || null;
        this.InitialSample1Tree = data.InitialSample1Tree || null;
        this.InitialSample2Tree = data.InitialSample2Tree || null;
        this.InitialSample3Tree = data.InitialSample3Tree || null;
        this.InitialSample4Tree = data.InitialSample4Tree || null;
        this.InitialSample5Tree = data.InitialSample5Tree || null;
        this.InitialSample1Size = data.InitialSample1Size || null;
        this.InitialSample2Size = data.InitialSample2Size || null;
        this.InitialSample3Size = data.InitialSample3Size || null;
        this.InitialSample4Size = data.InitialSample4Size || null;
        this.InitialSample5Size = data.InitialSample5Size || null;
        this.Tree1FutureSize1 = data.Tree1FutureSize1 || null;
        this.Tree1FutureSize2 = data.Tree1FutureSize2 || null;
        this.Tree1FutureSize3 = data.Tree1FutureSize3 || null;
        this.Tree1FutureSize4 = data.Tree1FutureSize4 || null;
        this.Tree1FutureSize5 = data.Tree1FutureSize5 || null;
        this.Tree1FutureSize6 = data.Tree1FutureSize6 || null;
        this.Tree2FutureSize1 = data.Tree2FutureSize1 || null;
        this.Tree2FutureSize2 = data.Tree2FutureSize2 || null;
        this.Tree2FutureSize3 = data.Tree2FutureSize3 || null;
        this.Tree2FutureSize4 = data.Tree2FutureSize4 || null;
        this.Tree2FutureSize5 = data.Tree2FutureSize5 || null;
        this.Tree2FutureSize6 = data.Tree2FutureSize6 || null;
        this.Tree3FutureSize1 = data.Tree3FutureSize1 || null;
        this.Tree3FutureSize2 = data.Tree3FutureSize2 || null;
        this.Tree3FutureSize3 = data.Tree3FutureSize3 || null;
        this.Tree3FutureSize4 = data.Tree3FutureSize4 || null;
        this.Tree3FutureSize5 = data.Tree3FutureSize5 || null;
        this.Tree3FutureSize6 = data.Tree3FutureSize6 || null;
        this.Tree4FutureSize1 = data.Tree4FutureSize1 || null;
        this.Tree4FutureSize2 = data.Tree4FutureSize2 || null;
        this.Tree4FutureSize3 = data.Tree4FutureSize3 || null;
        this.Tree4FutureSize4 = data.Tree4FutureSize4 || null;
        this.Tree4FutureSize5 = data.Tree4FutureSize5 || null;
        this.Tree4FutureSize6 = data.Tree4FutureSize6 || null;
    }

    static async findByTaskAndBlock(taskNo, blockNo) {
        const db = await getDB();
        
        // If no database connection, return empty array
        if (!db) {
            console.log('WARN: Database not available - returning empty task data');
            return [];
        }
        
        const query = 'SELECT * FROM Task WHERE TaskNo = ? AND BlockNo = ?';
        const rows = await getAllRows(query, [taskNo, blockNo]);
        
        return rows.map(row => new Task(row));
    }

    static async create(taskData) {
        const db = await getDB();
        
        // If no database connection, log and return mock object
        if (!db) {
            console.log('WARN: Database not available - task data not saved');
            const task = new Task(taskData);
            task.id = Math.floor(Math.random() * 1000000); // Mock ID
            return task;
        }
        
        const task = new Task(taskData);
        
        const query = `
            INSERT INTO Task (
                TaskNo, TrialNo, BlockNo, Horizon, ItemNo, InitialSampleNb, UnusedTree, 
                DisplayOrder1, DisplayOrder2, DisplayOrder3, TreePositions1, TreePositions2, TreePositions3, TreePositions4,
                InitialSample1Tree, InitialSample2Tree, InitialSample3Tree, InitialSample4Tree, InitialSample5Tree,
                InitialSample1Size, InitialSample2Size, InitialSample3Size, InitialSample4Size, InitialSample5Size,
                Tree1FutureSize1, Tree1FutureSize2, Tree1FutureSize3, Tree1FutureSize4, Tree1FutureSize5, Tree1FutureSize6,
                Tree2FutureSize1, Tree2FutureSize2, Tree2FutureSize3, Tree2FutureSize4, Tree2FutureSize5, Tree2FutureSize6,
                Tree3FutureSize1, Tree3FutureSize2, Tree3FutureSize3, Tree3FutureSize4, Tree3FutureSize5, Tree3FutureSize6,
                Tree4FutureSize1, Tree4FutureSize2, Tree4FutureSize3, Tree4FutureSize4, Tree4FutureSize5, Tree4FutureSize6
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        const params = [
            task.TaskNo, task.TrialNo, task.BlockNo, task.Horizon, task.ItemNo, task.InitialSampleNb, task.UnusedTree,
            task.DisplayOrder1, task.DisplayOrder2, task.DisplayOrder3, task.TreePositions1, task.TreePositions2, task.TreePositions3, task.TreePositions4,
            task.InitialSample1Tree, task.InitialSample2Tree, task.InitialSample3Tree, task.InitialSample4Tree, task.InitialSample5Tree,
            task.InitialSample1Size, task.InitialSample2Size, task.InitialSample3Size, task.InitialSample4Size, task.InitialSample5Size,
            task.Tree1FutureSize1, task.Tree1FutureSize2, task.Tree1FutureSize3, task.Tree1FutureSize4, task.Tree1FutureSize5, task.Tree1FutureSize6,
            task.Tree2FutureSize1, task.Tree2FutureSize2, task.Tree2FutureSize3, task.Tree2FutureSize4, task.Tree2FutureSize5, task.Tree2FutureSize6,
            task.Tree3FutureSize1, task.Tree3FutureSize2, task.Tree3FutureSize3, task.Tree3FutureSize4, task.Tree3FutureSize5, task.Tree3FutureSize6,
            task.Tree4FutureSize1, task.Tree4FutureSize2, task.Tree4FutureSize3, task.Tree4FutureSize4, task.Tree4FutureSize5, task.Tree4FutureSize6
        ];

        const result = await runQuery(query, params);
        task.id = result.lastID;
        
        console.log('Created task for TaskNo:', task.TaskNo, 'BlockNo:', task.BlockNo);
        return task;
    }

    // Getter methods equivalent to Python version
    getDisplayOrder() {
        return [this.DisplayOrder1, this.DisplayOrder2, this.DisplayOrder3];
    }

    getTreePositions() {
        return [this.TreePositions1, this.TreePositions2, this.TreePositions3, this.TreePositions4];
    }

    getInitialSamplesTree() {
        return [this.InitialSample1Tree, this.InitialSample2Tree, this.InitialSample3Tree, this.InitialSample4Tree, this.InitialSample5Tree];
    }

    getInitialSamplesSize() {
        return [this.InitialSample1Size, this.InitialSample2Size, this.InitialSample3Size, this.InitialSample4Size, this.InitialSample5Size];
    }

    getTree1FutureSize() {
        return [this.Tree1FutureSize1, this.Tree1FutureSize2, this.Tree1FutureSize3, this.Tree1FutureSize4, this.Tree1FutureSize5, this.Tree1FutureSize6];
    }

    getTree2FutureSize() {
        return [this.Tree2FutureSize1, this.Tree2FutureSize2, this.Tree2FutureSize3, this.Tree2FutureSize4, this.Tree2FutureSize5, this.Tree2FutureSize6];
    }

    getTree3FutureSize() {
        return [this.Tree3FutureSize1, this.Tree3FutureSize2, this.Tree3FutureSize3, this.Tree3FutureSize4, this.Tree3FutureSize5, this.Tree3FutureSize6];
    }

    getTree4FutureSize() {
        return [this.Tree4FutureSize1, this.Tree4FutureSize2, this.Tree4FutureSize3, this.Tree4FutureSize4, this.Tree4FutureSize5, this.Tree4FutureSize6];
    }

    static async batchCreate(taskDataArray) {
        const db = await getDB();
        
        if (!db) {
            console.log('WARN: Database not available - task data not saved');
            return taskDataArray.map(data => {
                const task = new Task(data);
                task.id = Math.floor(Math.random() * 1000000);
                return task;
            });
        }

        if (!taskDataArray || taskDataArray.length === 0) {
            return [];
        }

        // Build a single INSERT statement with multiple VALUES
        const baseQuery = `
            INSERT INTO Task (
                TaskNo, TrialNo, BlockNo, Horizon, ItemNo, InitialSampleNb, UnusedTree, 
                DisplayOrder1, DisplayOrder2, DisplayOrder3, TreePositions1, TreePositions2, TreePositions3, TreePositions4,
                InitialSample1Tree, InitialSample2Tree, InitialSample3Tree, InitialSample4Tree, InitialSample5Tree,
                InitialSample1Size, InitialSample2Size, InitialSample3Size, InitialSample4Size, InitialSample5Size,
                Tree1FutureSize1, Tree1FutureSize2, Tree1FutureSize3, Tree1FutureSize4, Tree1FutureSize5, Tree1FutureSize6,
                Tree2FutureSize1, Tree2FutureSize2, Tree2FutureSize3, Tree2FutureSize4, Tree2FutureSize5, Tree2FutureSize6,
                Tree3FutureSize1, Tree3FutureSize2, Tree3FutureSize3, Tree3FutureSize4, Tree3FutureSize5, Tree3FutureSize6,
                Tree4FutureSize1, Tree4FutureSize2, Tree4FutureSize3, Tree4FutureSize4, Tree4FutureSize5, Tree4FutureSize6
            ) VALUES `;

        // Create VALUES placeholders and collect all parameters
        const valueGroups = [];
        const allParams = [];
        
        for (const taskData of taskDataArray) {
            const task = new Task(taskData);
            
            valueGroups.push('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            
            allParams.push(
                task.TaskNo, task.TrialNo, task.BlockNo, task.Horizon, task.ItemNo, task.InitialSampleNb, task.UnusedTree,
                task.DisplayOrder1, task.DisplayOrder2, task.DisplayOrder3, task.TreePositions1, task.TreePositions2, task.TreePositions3, task.TreePositions4,
                task.InitialSample1Tree, task.InitialSample2Tree, task.InitialSample3Tree, task.InitialSample4Tree, task.InitialSample5Tree,
                task.InitialSample1Size, task.InitialSample2Size, task.InitialSample3Size, task.InitialSample4Size, task.InitialSample5Size,
                task.Tree1FutureSize1, task.Tree1FutureSize2, task.Tree1FutureSize3, task.Tree1FutureSize4, task.Tree1FutureSize5, task.Tree1FutureSize6,
                task.Tree2FutureSize1, task.Tree2FutureSize2, task.Tree2FutureSize3, task.Tree2FutureSize4, task.Tree2FutureSize5, task.Tree2FutureSize6,
                task.Tree3FutureSize1, task.Tree3FutureSize2, task.Tree3FutureSize3, task.Tree3FutureSize4, task.Tree3FutureSize5, task.Tree3FutureSize6,
                task.Tree4FutureSize1, task.Tree4FutureSize2, task.Tree4FutureSize3, task.Tree4FutureSize4, task.Tree4FutureSize5, task.Tree4FutureSize6
            );
        }

        // Execute single bulk INSERT
        const fullQuery = baseQuery + valueGroups.join(', ');
        const result = await runQuery(fullQuery, allParams);

        console.log(`Bulk inserted ${taskDataArray.length} task records in single query`);
        return taskDataArray.map((data, index) => {
            const task = new Task(data);
            task.id = result.lastID - taskDataArray.length + index + 1; // Approximate ID assignment
            return task;
        });
    }
}

module.exports = Task; 