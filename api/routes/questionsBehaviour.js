const express = require('express');
const router = express.Router();
const QuestionsBehaviour = require('../models/QuestionsBehaviour');

// GET /api/questions_behaviour/last_user_no
router.get('/questions_behaviour/last_user_no', async (req, res) => {
    try {
        const newUserNo = await QuestionsBehaviour.getLastUserNo();
        
        const result = { new_user_no: newUserNo.toString() };
        
        console.log('Last user number result:', result);
        res.json(result);
    } catch (error) {
        console.error('Error getting last user number:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// POST /api/questions_behaviour/:userId
router.post('/questions_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const content = req.body;
        
        console.log('Questions behaviour content:', content);

        const questionsBehaviourData = {
            UserNo: parseInt(userId),
            ProlificID: content.ProlificID || '',
            TrainingNo: content.TrainingNo || '',
            TaskNo: content.TaskNo || '',
            Date: content.Date || '',
            UserStartTime: content.UserStartTime || '',
            InstructionsStartTime: content.InstructionsStartTime || '',
            QuestionsStartTime: content.QuestionsStartTime || '',
            QuestionsFinishTime: content.QuestionsFinishTime || '',
            SumPassed: content.SumPassed || '',
            PressedKeys: content.PressedKeys || '',
            PercentagePassed: content.PercentagePassed || '',
            ReactionTimes: content.ReactionTimes || '',
            Correct: content.Correct || ''
        };

        // Convert arrays to strings if needed
        Object.keys(questionsBehaviourData).forEach(key => {
            if (Array.isArray(questionsBehaviourData[key])) {
                questionsBehaviourData[key] = JSON.stringify(questionsBehaviourData[key]);
            }
        });

        const questionsBehaviour = await QuestionsBehaviour.create(questionsBehaviourData);
        
        res.json({ success: "yes" });
    } catch (error) {
        console.error('Error creating questions behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// GET /api/questions_behaviour/:userId
router.get('/questions_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const questionsBehaviours = await QuestionsBehaviour.findByUser(parseInt(userId));
        
        res.json(questionsBehaviours);
    } catch (error) {
        console.error('Error retrieving questions behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 