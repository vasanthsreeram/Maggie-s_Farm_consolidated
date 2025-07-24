const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// GET /api/task/:taskNo/:blockNo
router.get('/task/:taskNo/:blockNo', async (req, res) => {
    try {
        const { taskNo, blockNo } = req.params;
        
        const tasks = await Task.findByTaskAndBlock(parseInt(taskNo), parseInt(blockNo));
        
        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ error: 'No records found' });
        }

        const result = {
            TaskNo: [],
            TrialNo: [],
            BlockNo: [],
            Horizon: [],
            ItemNo: [],
            UnusedTree: [],
            InitialSampleNb: [],
            DisplayOrder: [],
            TreePositions: [],
            InitialSamplesTree: [],
            InitialSamplesSize: [],
            Tree1FutureSize: [],
            Tree2FutureSize: [],
            Tree3FutureSize: [],
            Tree4FutureSize: [],
            trialsPerBlock: tasks.length // Add the actual number of trials
        };

        tasks.forEach(task => {
            result.TaskNo.push(task.TaskNo);
            result.TrialNo.push(task.TrialNo);
            result.BlockNo.push(task.BlockNo);
            result.Horizon.push(task.Horizon);
            result.ItemNo.push(task.ItemNo);
            result.UnusedTree.push(task.UnusedTree);
            result.InitialSampleNb.push(task.InitialSampleNb);
            result.DisplayOrder.push(task.getDisplayOrder());
            result.TreePositions.push(task.getTreePositions());
            result.InitialSamplesTree.push(task.getInitialSamplesTree());
            result.InitialSamplesSize.push(task.getInitialSamplesSize());
            result.Tree1FutureSize.push(task.getTree1FutureSize());
            result.Tree2FutureSize.push(task.getTree2FutureSize());
            result.Tree3FutureSize.push(task.getTree3FutureSize());
            result.Tree4FutureSize.push(task.getTree4FutureSize());
        });

        console.log('Task data retrieved:', result);
        res.json(result);
    } catch (error) {
        console.error('Error retrieving task:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// POST /api/task - Create new task
router.post('/task', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ 
            success: true,
            task: task 
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 