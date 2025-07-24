const express = require('express');
const router = express.Router();
const Training = require('../models/Training');

// GET /api/training/:trainingNo
router.get('/training/:trainingNo', async (req, res) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const startTime = Date.now();
    
    try {
        const { trainingNo } = req.params;
        
        console.log(`[${requestId}] 🎯 Training Request: GET /api/training/${trainingNo}`);
        console.log(`[${requestId}] 📋 Request details:`, {
            trainingNo: trainingNo,
            parsedTrainingNo: parseInt(trainingNo),
            timestamp: new Date().toISOString(),
            userAgent: req.get('User-Agent'),
            origin: req.get('Origin'),
            referer: req.get('Referer')
        });
        
        const trainingArray = await Training.findByTrainingNo(parseInt(trainingNo));
        
        console.log(`[${requestId}] 🔍 Database query result:`, {
            found: trainingArray ? trainingArray.length : 0,
            isArray: Array.isArray(trainingArray),
            queryTime: Date.now() - startTime + 'ms'
        });
        
        if (!trainingArray || trainingArray.length === 0) {
            console.log(`[${requestId}] ❌ No training data found for TrainingNo: ${trainingNo}`);
            return res.status(404).json({ error: 'Record not found' });
        }

        const training = trainingArray[0]; // Get the first training record
        console.log(`[${requestId}] ✅ Training found:`, {
            TrainingNo: training.TrainingNo,
            TrialNo: training.TrialNo,
            id: training.id,
            rawData: training
        });
        
        const result = {
            TrainingNo: training.TrainingNo,
            TrialNo: training.TrialNo,
            InitialSamplesSize: training.getInitialSamplesSize(),
            ChoicesSize: training.getChoicesSize(),
            ChoicesCorrect: training.getChoicesCorrect()
        };

        console.log(`[${requestId}] 🎉 Training result prepared:`, result);
        console.log(`[${requestId}] ⏱️  Total request time: ${Date.now() - startTime}ms`);
        res.json(result);
    } catch (error) {
        console.error(`[${requestId}] 💥 Error retrieving training:`, {
            error: error.message,
            stack: error.stack,
            trainingNo: req.params.trainingNo,
            requestTime: Date.now() - startTime + 'ms'
        });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// POST /api/training - Create new training
router.post('/training', async (req, res) => {
    try {
        const training = await Training.create(req.body);
        res.status(201).json({ 
            success: true,
            training: training 
        });
    } catch (error) {
        console.error('Error creating training:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 