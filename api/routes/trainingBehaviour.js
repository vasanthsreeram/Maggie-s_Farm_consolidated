const express = require('express');
const router = express.Router();
const TrainingBehaviour = require('../models/TrainingBehaviour');

// POST /api/training_behaviour/:userId
router.post('/training_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const content = req.body;
        
        console.log("Training behaviour user id:", userId);
        console.log("Training content:", content);

        const trainingBehaviourData = {
            UserNo: parseInt(userId),
            UserStartTime: content.UserStartTime || '',
            ProlificID: content.ProlificID || '',
            TrainingNo: content.TrainingNo || '',
            TaskNo: content.TaskNo || '',
            Date: content.Date || '',
            TrainingStartTime: content.TrainingStartTime || '',
            TrainingFinishTime: content.TrainingFinishTime || '',
            SumPassed: content.SumPassed || '',
            InitialSamplesSize: content.InitialSamplesSize || '',
            ReactionTimes: content.ReactionTimes || '',
            ChoicesSize: content.ChoicesSize || '',
            ChoicesCorrect: content.ChoicesCorrect || '',
            Chosen: content.Chosen || '',
            CorrectAns: content.CorrectAns || '',
            NumTraining: content.NumTraining || ''
        };

        // Convert arrays to strings if needed
        Object.keys(trainingBehaviourData).forEach(key => {
            if (Array.isArray(trainingBehaviourData[key])) {
                trainingBehaviourData[key] = JSON.stringify(trainingBehaviourData[key]);
            }
        });

        console.log("Saving training behaviour:", trainingBehaviourData);
        
        const trainingBehaviour = await TrainingBehaviour.create(trainingBehaviourData);
        
        res.json({ success: "yes" });
    } catch (error) {
        console.error('Error creating training behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// GET /api/training_behaviour/:userId
router.get('/training_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const trainingBehaviours = await TrainingBehaviour.findByUser(parseInt(userId));
        
        res.json(trainingBehaviours);
    } catch (error) {
        console.error('Error retrieving training behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 