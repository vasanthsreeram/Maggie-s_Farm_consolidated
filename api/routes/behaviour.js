const express = require('express');
const router = express.Router();
const Behaviour = require('../models/Behaviour');

// POST /api/behaviour/:userId/:blockNo
router.post('/behaviour/:userId/:blockNo', async (req, res) => {
    try {
        const { userId, blockNo } = req.params;
        const content = req.body;
        
        console.log('Behaviour content:', content);
        console.log(`User ID: ${userId}, Block No: ${blockNo}`);

        const behaviourData = {
            UserNo: parseInt(userId),
            Date: content.Date || '',
            UserStartTime: content.UserStartTime || '',
            ProlificID: content.ProlificID || '',
            TrainingNo: content.TrainingNo || '',
            TaskNo: content.TaskNo || '',
            BlockNo: parseInt(blockNo),
            InfoRequestNo: content.InfoRequestNo || '',
            BlockStartTime: content.BlockStartTime || '',
            BlockFinishTime: content.BlockFinishTime || '',
            TreeColours: content.TreeColours || '',
            ChosenTree: content.ChosenTree || '',
            ChosenAppleSize: content.ChosenAppleSize || '',
            AllKeyPressed: content.AllKeyPressed || '',
            ReactionTimes: content.ReactionTimes || '',
            Horizon: content.Horizon || '',
            ItemNo: content.ItemNo || '',
            TrialNo: content.TrialNo || '',
            UnusedTree: content.UnusedTree || '',
            InitialSamplesNb: content.InitialSamplesNb || '',
            InitialSamplesTree: content.InitialSamplesTree || '',
            InitialSamplesSize: content.InitialSamplesSize || '',
            TreePositions: content.TreePositions || ''
        };

        // Convert arrays to strings if needed
        Object.keys(behaviourData).forEach(key => {
            if (Array.isArray(behaviourData[key])) {
                behaviourData[key] = JSON.stringify(behaviourData[key]);
            }
        });

        console.log('Behaviour data to save:', behaviourData);
        
        const behaviour = await Behaviour.create(behaviourData);
        
        res.json({ success: "yes" });
    } catch (error) {
        console.error('Error creating behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// GET /api/behaviour/:userId/:blockNo
router.get('/behaviour/:userId/:blockNo', async (req, res) => {
    try {
        const { userId, blockNo } = req.params;
        
        const behaviours = await Behaviour.findByUserAndBlock(parseInt(userId), parseInt(blockNo));
        
        res.json(behaviours);
    } catch (error) {
        console.error('Error retrieving behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 