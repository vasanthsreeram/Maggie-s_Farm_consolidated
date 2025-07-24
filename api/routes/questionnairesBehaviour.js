const express = require('express');
const router = express.Router();
const QuestionnairesBehaviour = require('../models/QuestionnairesBehaviour');

// POST /api/questionnaires_behaviour/:userId
router.post('/questionnaires_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const content = req.body;
        
        console.log("Questionnaires behaviour content:", content);

        const questionnairesBehaviourData = {
            UserNo: parseInt(userId),
            ProlificID: content.ProlificID || '',
            TrainingNo: content.TrainingNo || '',
            TaskNo: content.TaskNo || '',
            UserStartTime: content.UserStartTime || '',
            Shuffle: content.Shuffle || '',
            Date: content.Date || '',
            QuestionnaireStartTime: content.QuestionnaireStartTime || '',
            QuestionnaireFinishTime: content.QuestionnaireFinishTime || '',
            PageNo0: content.PageNo0 || '',
            PageNo1: content.PageNo1 || '',
            PageNo2: content.PageNo2 || '',
            PageNo3: content.PageNo3 || '',
            PageNo4: content.PageNo4 || '',
            PageNo5: content.PageNo5 || '',
            PageNo6: content.PageNo6 || '',
            PageNo7: content.PageNo7 || '',
            PageNo8: content.PageNo8 || '',
            PageNo9: content.PageNo9 || '',
            PageNo10: content.PageNo10 || '',
            PageNo11: content.PageNo11 || '',
            PageNo12: content.PageNo12 || '',
            IQ_1: content.IQ_1 || '',
            IQ_2: content.IQ_2 || '',
            IQ_3: content.IQ_3 || '',
            IQ_4: content.IQ_4 || '',
            IQ_5: content.IQ_5 || '',
            IQ_6: content.IQ_6 || '',
            IQ_7: content.IQ_7 || '',
            IQ_8: content.IQ_8 || '',
            IQimage_1: content.IQimage_1 || '',
            IQimage_2: content.IQimage_2 || '',
            IQimage_3: content.IQimage_3 || '',
            IQimage_4: content.IQimage_4 || '',
            IQimage_5: content.IQimage_5 || '',
            IQimage_6: content.IQimage_6 || '',
            IQimage_7: content.IQimage_7 || '',
            IQimage_8: content.IQimage_8 || '',
            ASRS: content.ASRS || '',
            BIS11: content.BIS11 || '',
            IUS: content.IUS || '',
            LSAS: content.LSAS || '',
            SDS: content.SDS || '',
            STAI: content.STAI || '',
            OCIR: content.OCIR || '',
            AQ10: content.AQ10 || '',
            CFS: content.CFS || '',
            MEDIC: content.MEDIC || ''
        };

        // Convert arrays to strings if needed
        Object.keys(questionnairesBehaviourData).forEach(key => {
            if (Array.isArray(questionnairesBehaviourData[key])) {
                questionnairesBehaviourData[key] = JSON.stringify(questionnairesBehaviourData[key]);
            }
        });

        const questionnairesBehaviour = await QuestionnairesBehaviour.create(questionnairesBehaviourData);
        
        res.json({ success: "yes" });
    } catch (error) {
        console.error('Error creating questionnaires behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// GET /api/questionnaires_behaviour/:userId
router.get('/questionnaires_behaviour/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const questionnairesBehaviours = await QuestionnairesBehaviour.findByUser(parseInt(userId));
        
        res.json(questionnairesBehaviours);
    } catch (error) {
        console.error('Error retrieving questionnaires behaviour:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 