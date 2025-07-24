const { create, all } = require('mathjs');
const Task = require('../models/Task');
const Training = require('../models/Training');

const math = create(all);

// Gaussian random number generator (Box-Muller transform)
function randn() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Random permutation function
function randperm(n) {
    const arr = Array.from({length: n}, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Shuffle array in place
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Clip values to bounds
function clip(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// General parameters equivalent to general_params.m
function generalParams(userID, config = {}) {
    return {
        ID: userID,
        params: {
            wd: process.cwd(),
            javascript_version: `Node.js ${process.version}`,
            date: parseInt(new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14)),
            n_blocks: config.months || 4,
            n_trialPB: config.trialsPerBlock || 20,
            n_training_trials: config.trainingTrials || 10
        }
    };
}

// Apple parameters training equivalent to apple_params_training.m
function appleParamsTraining(user) {
    const nItems = user.params.n_training_trials;
    
    const mean1 = 8;
    const mean2 = 3;
    const SD = 0.8;
    const infBound = 2;
    const supBound = 10;
    
    // Compute means
    const means = [
        Array(nItems).fill(mean1), // Tree 1
        Array(nItems).fill(mean2)  // Tree 2
    ];
    const trainingMeans = means[0].map((_, i) => [means[0][i], means[1][i]]);
    
    // Compute sequences: draw 4 apples per tree
    const numApplesPerTree = 4;
    const items = [];
    
    for (let t = 0; t < nItems; t++) {
        const item = { sequences: [] };
        for (let tree = 0; tree < 2; tree++) {
            const r = [];
            for (let i = 0; i < numApplesPerTree; i++) {
                let val = trainingMeans[t][tree] + SD * randn();
                val = clip(val, infBound, supBound);
                r.push(Math.round(val));
            }
            item.sequences.push(r);
        }
        items.push(item);
    }
    
    // Generate samples
    user.training = { items: [] };
    
    for (let trial = 0; trial < nItems; trial++) {
        const trainingItem = {};
        
        // Choose random indices for each tree
        const chosenIdx = {};
        for (let tree = 0; tree < 2; tree++) {
            chosenIdx[tree] = randperm(4).map(x => x - 1); // Convert to 0-based
        }
        
        // Display apples
        const dispApples = numApplesPerTree - 1;
        const dispTree = Math.floor(Math.random() * 2); // 0 or 1
        
        // Initial samples
        const initialSizes = [];
        for (let i = 0; i < dispApples; i++) {
            initialSizes.push(items[trial].sequences[dispTree][chosenIdx[dispTree][i]]);
        }
        
        // Randomize order
        shuffle(initialSizes);
        
        trainingItem.initial_apples = {
            size: initialSizes,
            tree: dispTree + 1 // Convert back to 1-based for storage
        };
        
        // Future samples
        trainingItem.future_apples = {
            tree: [
                items[trial].sequences[0][chosenIdx[0][3]], // Tree 1
                items[trial].sequences[1][chosenIdx[1][3]]  // Tree 2
            ]
        };
        
        user.training.items.push(trainingItem);
    }
    
    return user;
}

// Apple parameters equivalent to apple_params.m
function appleParams(user) {
    const nCond = 2;
    const itemsPerCond = 100;
    
    // Initialization
    const meanAMean = [5, 7];
    const meanAVar = 0.7;
    const meanBVar = [1, 2];
    const meanCVar = [1, 2];
    const meanDVar = [-1, -1];
    const SD = 0.8;
    const infBound = 2;
    const supBound = 10;
    
    const numItems = itemsPerCond;
    const means = Array(4).fill().map(() => Array(numItems).fill(0));
    
    // Tree A
    const meansA = [];
    for (let i = 0; i < numItems / 2; i++) {
        meansA.push(Math.round(randn() * 2 * meanAVar - meanAVar + meanAMean[0]));
    }
    for (let i = 0; i < numItems / 2; i++) {
        meansA.push(Math.round(randn() * 2 * meanAVar - meanAVar + meanAMean[1]));
    }
    shuffle(meansA);
    for (let i = 0; i < numItems; i++) {
        means[0][i] = clip(meansA[i], infBound + 2, supBound - 1);
    }
    
    // Tree B
    const tmpB = [
        ...Array(numItems / 4).fill(meanBVar[0]),
        ...Array(numItems / 4).fill(-meanBVar[0]),
        ...Array(numItems / 4).fill(meanBVar[1]),
        ...Array(numItems / 4).fill(-meanBVar[1])
    ];
    for (let i = 0; i < numItems; i++) {
        const tmpMeans2 = means[0][i] + tmpB[i];
        means[1][i] = clip(tmpMeans2, infBound + 1, supBound);
    }
    
    // Tree C
    const tmpC = [
        ...Array(numItems / 4).fill(meanCVar[0]),
        ...Array(numItems / 4).fill(-meanCVar[0]),
        ...Array(numItems / 4).fill(meanCVar[1]),
        ...Array(numItems / 4).fill(-meanCVar[1])
    ];
    shuffle(tmpC);
    for (let i = 0; i < numItems; i++) {
        const baseVal = i < numItems / 2 ? means[0][i] : means[1][i];
        const tmpMeans3 = baseVal + tmpC[i];
        means[2][i] = clip(tmpMeans3, infBound + 1, supBound);
    }
    
    // Tree D
    const tmpD = [
        ...Array(numItems / 2).fill(meanDVar[0]),
        ...Array(numItems / 2).fill(meanDVar[1])
    ];
    for (let i = 0; i < numItems; i++) {
        const tmpMeans4 = Math.min(means[0][i], Math.min(means[1][i], means[2][i])) + tmpD[i];
        means[3][i] = clip(tmpMeans4, infBound, supBound);
    }
    
    const taskMeans = means[0].map((_, i) => [means[0][i], means[1][i], means[2][i], means[3][i]]);
    
    // Only 3 trees shown out of 4 every time
    const unusedTree = [
        ...Array(itemsPerCond / 4).fill(1),
        ...Array(itemsPerCond / 4).fill(2),
        ...Array(itemsPerCond / 4).fill(3),
        ...Array(itemsPerCond / 4).fill(4)
    ];
    shuffle(unusedTree);
    
    // Compute sequences
    const hor = [9, 4];
    const items = [];
    
    for (let t = 0; t < itemsPerCond; t++) {
        const item = { sequences: [] };
        for (let tree = 0; tree < 4; tree++) {
            const r = [];
            for (let i = 0; i < hor[0]; i++) {
                let val = taskMeans[t][tree] + SD * randn();
                if (tree < 3) { // Trees 1, 2, 3
                    val = clip(val, infBound + 1, supBound);
                } else { // Tree 4
                    val = clip(val, infBound, supBound);
                }
                r.push(Math.round(val));
            }
            item.sequences.push(r);
        }
        items.push(item);
    }
    
    // Generate samples for each trial
    user.task = { items: [] };
    
    for (let trial = 0; trial < itemsPerCond; trial++) {
        const taskItem = {};
        taskItem.unused_tree = unusedTree[trial];
        taskItem.initial_apples = { size: [], tree: [] };
        
        // Generate random indices for sequences
        const chosenIdx = {};
        for (let tree = 0; tree < 4; tree++) {
            chosenIdx[tree] = randperm(9).map(x => x - 1); // Convert to 0-based
        }
        
        // Determine how many samples based on unused tree
        let ix;
        if (taskItem.unused_tree === 3) {
            ix = randperm(5).map(x => x - 1);
        } else if ([4, 2].includes(taskItem.unused_tree)) {
            ix = randperm(4).map(x => x - 1);
        } else if (taskItem.unused_tree === 1) {
            ix = randperm(2).map(x => x - 1);
        }
        
        // Initial samples
        // Tree A (3 samples)
        if (taskItem.unused_tree !== 1) {
            for (let i = 0; i < 3; i++) {
                taskItem.initial_apples.size.push(items[trial].sequences[0][chosenIdx[0][i]]);
                taskItem.initial_apples.tree.push(1);
            }
        }
        
        // Tree B (1 sample)
        if (taskItem.unused_tree !== 2) {
            taskItem.initial_apples.size.push(items[trial].sequences[1][chosenIdx[1][0]]);
            taskItem.initial_apples.tree.push(2);
        }
        
        // Tree D (1 sample)
        if (taskItem.unused_tree !== 4) {
            taskItem.initial_apples.size.push(items[trial].sequences[3][chosenIdx[3][0]]);
            taskItem.initial_apples.tree.push(4);
        }
        
        // Ensure D is the smallest if present
        const indTreeD = taskItem.initial_apples.tree.indexOf(4);
        if (indTreeD !== -1) {
            while (taskItem.initial_apples.size[indTreeD] >= Math.min(...taskItem.initial_apples.size)) {
                taskItem.initial_apples.size[indTreeD] -= 1;
                if (taskItem.initial_apples.size[indTreeD] < 2) {
                    taskItem.initial_apples.size[indTreeD] = 2;
                    break;
                }
            }
        }
        
        // Randomize order
        const initialData = taskItem.initial_apples.size.map((size, i) => ({
            size: size,
            tree: taskItem.initial_apples.tree[i]
        }));
        shuffle(initialData);
        taskItem.initial_apples.size = initialData.map(d => d.size);
        taskItem.initial_apples.tree = initialData.map(d => d.tree);
        
        // Pad with zeros to length 5
        while (taskItem.initial_apples.size.length < 5) {
            taskItem.initial_apples.size.push(0);
            taskItem.initial_apples.tree.push(0);
        }
        
        // Future samples
        taskItem.future_apples = { tree: [] };
        for (let tree = 0; tree < 4; tree++) {
            if (taskItem.unused_tree === tree + 1) {
                taskItem.future_apples.tree.push(Array(6).fill(0));
            } else {
                const futureSamples = [];
                for (let i = 3; i < 9; i++) {
                    futureSamples.push(items[trial].sequences[tree][chosenIdx[tree][i]]);
                }
                taskItem.future_apples.tree.push(futureSamples);
            }
        }
        
        user.task.items.push(taskItem);
    }
    
    // Set up blocks
    const NCond_per_block = user.params.n_trialPB / nCond;
    const conds = [];
    for (let i = 0; i < NCond_per_block; i++) {
        conds.push(1, 2);
    }
    
    // Create item indices for each condition
    const itemIdxs = {
        1: [shuffle([...Array(itemsPerCond)].map((_, i) => i)), shuffle([...Array(itemsPerCond)].map((_, i) => i))],
        2: [shuffle([...Array(itemsPerCond)].map((_, i) => i)), shuffle([...Array(itemsPerCond)].map((_, i) => i))]
    };
    
    user.task.blocks = [];
    for (let b = 0; b < user.params.n_blocks; b++) {
        const block = {};
        block.hor = shuffle([...conds]);
        block.itemID = [];
        
        for (let c of [1, 2]) {
            const idx = block.hor.map((val, i) => val === c ? i : -1).filter(i => i !== -1);
            if (b < 2) { // First half
                for (let i = 0; i < idx.length; i++) {
                    block.itemID[idx[i]] = itemIdxs[c][0].pop();
                }
            } else { // Second half
                for (let i = 0; i < idx.length; i++) {
                    block.itemID[idx[i]] = itemIdxs[c][1].pop();
                }
            }
        }
        
        user.task.blocks.push(block);
    }
    
    return user;
}

// Convert to database format similar to MATLAB output
function convertToDBFormat(user) {
    const results = {
            taskData: [],
            trainingData: []
        };

    // Training data
    const nTrainingTrials = user.training.items.length;
    for (let trialNo = 0; trialNo < nTrainingTrials; trialNo++) {
        const item = user.training.items[trialNo];
        const appSizes = [...item.initial_apples.size];
        const futureAppSizes = item.future_apples.tree;
        const correctTree = item.initial_apples.tree;
        
        // Pad app_sizes to length 3 if needed
        while (appSizes.length < 3) {
            appSizes.push(0);
        }
        
        // Determine correct answer based on which choice apple is bigger
        const correctOptions = futureAppSizes[0] > futureAppSizes[1] ? [1, 0] : [0, 1];
        
        const trainingData = {
            TrainingNo: user.ID,
            TrialNo: trialNo + 1,
            InitialSample1Size: appSizes[0] || 0,
            InitialSample2Size: appSizes[1] || 0,
            InitialSample3Size: appSizes[2] || 0,
            Choice1Size: futureAppSizes[0],
            Choice2Size: futureAppSizes[1],
            Choice1Correct: correctOptions[0],
            Choice2Correct: correctOptions[1]
        };
        
        results.trainingData.push(trainingData);
    }
    
    // Task data
    let trialNo = 0;
    const trialPerBlock = user.params.n_trialPB;
    
    for (let blockNo = 0; blockNo < 4; blockNo++) {
        const block = user.task.blocks[blockNo];
        
        for (let trialInBlockNo = 0; trialInBlockNo < trialPerBlock; trialInBlockNo++) {
            trialNo++;
            let horizon = block.hor[trialInBlockNo];
            const itemNo = block.itemID[trialInBlockNo];
            
            const taskItem = user.task.items[itemNo];
            const initialSampleNb = taskItem.initial_apples.tree.filter(x => x !== 0).length;
            const initialSamples = taskItem.initial_apples;
            const futureSamples = taskItem.future_apples.tree;
            const unusedTree = taskItem.unused_tree;
            
            // Display order
            let displayOrder = [1, 2, 3, 4].filter(x => x !== unusedTree);
            shuffle(displayOrder);
            
            // Tree positions
            const treePositions = [0, 0, 0, 0];
            for (let i = 0; i < 4; i++) {
                if (i + 1 !== unusedTree) {
                    const pos = displayOrder.indexOf(i + 1);
                    if (pos !== -1) {
                        treePositions[i] = pos + 1;
                    }
                }
            }
            
            if (horizon === 2) {
                horizon = 6;
            } else if (horizon === 1) {
                horizon = 3;  // Change minimum from 1 to 3 apples
            }
            
            const taskData = {
                TaskNo: user.ID,
                TrialNo: trialNo,
                BlockNo: blockNo + 1,
                Horizon: horizon,
                ItemNo: itemNo + 1,
                InitialSampleNb: initialSampleNb,
                UnusedTree: unusedTree,
                DisplayOrder1: displayOrder[0] || 0,
                DisplayOrder2: displayOrder[1] || 0,
                DisplayOrder3: displayOrder[2] || 0,
                TreePositions1: treePositions[0],
                TreePositions2: treePositions[1],
                TreePositions3: treePositions[2],
                TreePositions4: treePositions[3],
                InitialSample1Tree: initialSamples.tree[0] || 0,
                InitialSample2Tree: initialSamples.tree[1] || 0,
                InitialSample3Tree: initialSamples.tree[2] || 0,
                InitialSample4Tree: initialSamples.tree[3] || 0,
                InitialSample5Tree: initialSamples.tree[4] || 0,
                InitialSample1Size: initialSamples.size[0] || 0,
                InitialSample2Size: initialSamples.size[1] || 0,
                InitialSample3Size: initialSamples.size[2] || 0,
                InitialSample4Size: initialSamples.size[3] || 0,
                InitialSample5Size: initialSamples.size[4] || 0,
                Tree1FutureSize1: futureSamples[0][0],
                Tree1FutureSize2: futureSamples[0][1],
                Tree1FutureSize3: futureSamples[0][2],
                Tree1FutureSize4: futureSamples[0][3],
                Tree1FutureSize5: futureSamples[0][4],
                Tree1FutureSize6: futureSamples[0][5],
                Tree2FutureSize1: futureSamples[1][0],
                Tree2FutureSize2: futureSamples[1][1],
                Tree2FutureSize3: futureSamples[1][2],
                Tree2FutureSize4: futureSamples[1][3],
                Tree2FutureSize5: futureSamples[1][4],
                Tree2FutureSize6: futureSamples[1][5],
                Tree3FutureSize1: futureSamples[2][0],
                Tree3FutureSize2: futureSamples[2][1],
                Tree3FutureSize3: futureSamples[2][2],
                Tree3FutureSize4: futureSamples[2][3],
                Tree3FutureSize5: futureSamples[2][4],
                Tree3FutureSize6: futureSamples[2][5],
                Tree4FutureSize1: futureSamples[3][0],
                Tree4FutureSize2: futureSamples[3][1],
                Tree4FutureSize3: futureSamples[3][2],
                Tree4FutureSize4: futureSamples[3][3],
                Tree4FutureSize5: futureSamples[3][4],
                Tree4FutureSize6: futureSamples[3][5]
            };
            
            results.taskData.push(taskData);
        }
    }
    
    return results;
}

// Main generator class
class ParamGenerator {
    static async generateAllData(userCount = 10, options = {}) {
        const {
            concurrency = Math.min(4, Math.max(1, Math.floor(userCount / 10))), // Dynamic concurrency
            batchSize = 50,
            enableTransactions = true,
            config = {}
        } = options;
        
        console.log(`Generating data for ${userCount} users with optimizations:`);
        console.log(`- Concurrency: ${concurrency} parallel users`);
        console.log(`- Batch size: ${batchSize} records per batch`);
        console.log(`- Transactions: ${enableTransactions ? 'enabled' : 'disabled'}`);
        
        const results = {
            users: [],
            taskRecords: 0,
            trainingRecords: 0,
            timings: {
                startTime: Date.now(),
                generationTime: 0,
                insertionTime: 0
            }
        };

        const generationStart = Date.now();
        
        // Generate ALL user data in parallel - algorithm is completely independent per user
        console.log('Generating all users in parallel (fully optimized)...');
        
        const userPromises = [];
        for (let userNo = 1; userNo <= userCount; userNo++) {
            userPromises.push(
                (async (userNo) => {
                    try {
                        // Generate user parameters - completely independent per user
                        let user = generalParams(userNo, config);
                        user = appleParamsTraining(user);
                        user = appleParams(user);
                        
                        // Convert to database format
                        const dbData = convertToDBFormat(user);
                        
                        return {
                            userNo,
                            dbData,
                            taskTrials: dbData.taskData.length,
                            trainingTrials: dbData.trainingData.length
                        };
                    } catch (error) {
                        console.error(`Error generating parameters for user ${userNo}:`, error);
                        throw error;
                    }
                })(userNo)
            );
        }
        
        // Wait for all users to be generated in parallel
        const allUserData = await Promise.all(userPromises);
        console.log(`All ${userCount} users generated in parallel!`);
        
        results.timings.generationTime = Date.now() - generationStart;
        console.log(`Parameter generation completed in ${results.timings.generationTime}ms`);
        
        // Insert data in optimized batches
        const insertionStart = Date.now();
        await ParamGenerator._insertDataInBatches(allUserData, batchSize, enableTransactions, results);
        results.timings.insertionTime = Date.now() - insertionStart;
        
        // Populate results
        results.users = allUserData.map(userData => ({
            userNo: userData.userNo,
            taskTrials: userData.taskTrials,
            trainingTrials: userData.trainingTrials
        }));
        
        results.timings.totalTime = Date.now() - results.timings.startTime;
        
        console.log(`\n=== Generation Complete ===`);
        console.log(`Total time: ${results.timings.totalTime}ms`);
        console.log(`- Parameter generation: ${results.timings.generationTime}ms`);
        console.log(`- Database insertion: ${results.timings.insertionTime}ms`);
        console.log(`Created ${results.taskRecords} task records and ${results.trainingRecords} training records for ${userCount} users.`);
        
        return results;
    }
    
    static async _insertDataInBatches(allUserData, batchSize, enableTransactions, results) {
        const { getDB, runQuery } = require('../config/database');
        const db = await getDB();
        
        if (!db) {
            console.log('Database not available - skipping data insertion');
            return;
        }
        
        // Collect all task and training data
        const allTaskData = [];
        const allTrainingData = [];
        
        for (const userData of allUserData) {
            allTaskData.push(...userData.dbData.taskData);
            allTrainingData.push(...userData.dbData.trainingData);
        }
        
        // Insert with optimized batch operations and transactions
        if (enableTransactions) {
            await runQuery('BEGIN TRANSACTION');
        }
        
        try {
            // Use optimized batch inserts
            await ParamGenerator._batchInsertData(allTaskData, allTrainingData, batchSize, results);
            
            if (enableTransactions) {
                await runQuery('COMMIT');
                console.log('Transaction committed successfully');
            }
        } catch (error) {
            if (enableTransactions) {
                await runQuery('ROLLBACK');
                console.log('Transaction rolled back due to error');
            }
            throw error;
        }
    }
    
    static async _batchInsertData(allTaskData, allTrainingData, batchSize, results) {
        // Process task data in batches
        if (allTaskData.length > 0) {
            for (let i = 0; i < allTaskData.length; i += batchSize) {
                const batch = allTaskData.slice(i, Math.min(i + batchSize, allTaskData.length));
                const batchNumber = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(allTaskData.length / batchSize);
                
                console.log(`Inserting Task batch ${batchNumber}/${totalBatches} (${batch.length} records)`);
                
                await Task.batchCreate(batch);
                results.taskRecords += batch.length;
            }
        }
        
        // Process training data in batches  
        if (allTrainingData.length > 0) {
            for (let i = 0; i < allTrainingData.length; i += batchSize) {
                const batch = allTrainingData.slice(i, Math.min(i + batchSize, allTrainingData.length));
                const batchNumber = Math.floor(i / batchSize) + 1;
                const totalBatches = Math.ceil(allTrainingData.length / batchSize);
                
                console.log(`Inserting Training batch ${batchNumber}/${totalBatches} (${batch.length} records)`);
                
                await Training.batchCreate(batch);
                results.trainingRecords += batch.length;
            }
        }
    }

    static async clearParameterTables() {
        console.log('Clearing parameter tables (Task and Training only)...');
        
        try {
            const { getDB, runQuery } = require('../config/database');
            const db = await getDB();
            
            if (!db) {
                console.log('Database not available - cannot clear tables');
                return;
            }
            
            // Clear only parameter tables, preserving behavioral data
            const parameterTables = ['Task', 'Training'];
            
            for (const table of parameterTables) {
                await runQuery(`DELETE FROM ${table}`);
                console.log(`Cleared parameter table: ${table}`);
            }
            
            console.log('Parameter tables cleared successfully (behavioral data preserved)');
        } catch (error) {
            console.error('Error clearing parameter tables:', error);
            throw error;
        }
    }

    // Legacy method name for backward compatibility
    static async clearAllTables() {
        return this.clearParameterTables();
    }
}

module.exports = {
    ParamGenerator,
    generateAllData: ParamGenerator.generateAllData,
    clearAllTables: ParamGenerator.clearAllTables,
    clearParameterTables: ParamGenerator.clearParameterTables
}; 