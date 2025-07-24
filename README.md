# MF-Web Research Application

A full-stack web application for conducting behavioral research studies with apple-picking game mechanics, training sessions, and questionnaires.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/lintware/Maggie-s_Farm.git
cd Maggie-s_Farm

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Start the application in development mode
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Database Setup](#database-setup)
- [Admin Panel & Data Management](#admin-panel--data-management)
- [Understanding & Analyzing Behavioral Data](#understanding--analyzing-behavioral-data)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher)
- **Microsoft SQL Server** (optional - for production database)

### Check your versions:
```bash
node --version
npm --version
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/lintware/Maggie-s_Farm.git
cd Maggie-s_Farm
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory for production database setup (optional):

```env
# Database Configuration (optional - uses mock data if not provided)
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_SERVER=localhost
DB_DATABASE=clic

# Application Environment
NODE_ENV=development
PORT=8080
```

### Default Configuration
- **Frontend URL**: http://localhost:3000
- **Backend URL**: http://localhost:8080
- **Database**: Mock mode (no real database required for development)

## 🚀 Running the Application

### Development Mode (Recommended)
Runs both frontend and backend concurrently:
```bash
npm run dev
```

### Run Components Separately

#### Backend Only
```bash
npm run server
```

#### Frontend Only
```bash
npm run client
```

#### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
MF-Web-Bhuu/
├── 📁 api/                    # Backend API
│   ├── 📁 config/            # Database configuration
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API routes
│   └── 📁 utils/             # Utility functions
├── 📁 client/                # React frontend
│   ├── 📁 public/            # Static files & images
│   ├── 📁 src/               # React components & styles
│   └── package.json          # Frontend dependencies
├── server.js                 # Express server entry point
├── package.json              # Backend dependencies
└── README.md                 # This file
```

### Key Components

#### Backend (`/api`)
- **Models**: Database models for storing research data
- **Routes**: API endpoints for data collection
- **Config**: Database connection setup

#### Frontend (`/client/src`)
- **Components**: React components for study interface
- **Game Logic**: Apple-picking game mechanics
- **Questionnaires**: Research questionnaire forms
- **Training**: User training modules

## 🔌 API Endpoints

### Core Endpoints
- `GET /api/testmethod` - Health check
- `GET /api/database-status` - Database connection status

### Research Data Collection
- `GET /api/questions_behaviour/last_user_no` - Get next user number
- `POST /api/questions_behaviour/:userId` - Save question responses
- `POST /api/training_behaviour/:userId` - Save training data
- `POST /api/behaviour/:userId` - Save general behavior data
- `POST /api/questionnaires_behaviour/:userId` - Save questionnaire responses

### Task Management
- `GET /api/task/:userId` - Get task configuration
- `POST /api/task/:userId` - Save task results
- `POST /api/training/:userId` - Save training configuration

### Admin & Data Export
- `GET /admin` - Admin panel for data export and management
- `GET /api/output` - Export all behavioral data (JSON/CSV)
- `GET /api/output/summary` - Get summary statistics
- `GET /api/output/table/:tableName` - Export specific table data
- `POST /api/generate-data/:userCount` - Generate experimental parameters
- `POST /api/create-tables` - Initialize database tables

## 🗄️ Database Setup

### Development Mode (Default)
The application runs in **mock mode** by default - no database setup required!
- Data is logged to console
- Random user IDs are generated
- Perfect for development and testing

### Production Database Setup

1. **Install Microsoft SQL Server**

2. **Create Database**
   ```sql
   CREATE DATABASE clic;
   ```

3. **Configure Environment Variables**
   Create `.env` file with database credentials

4. **Create Tables**
   Make a GET request to: `http://localhost:8080/api/create-tables`

5. **Verify Connection**
   Check: `http://localhost:8080/api/database-status`

## 🎯 Admin Panel & Data Management

### Accessing the Admin Panel
Navigate to `http://localhost:8080/admin` to access the administration interface.

**Features:**
- **Database Status**: Real-time connection monitoring
- **Summary Statistics**: Total records, unique users, blocks, and trials
- **Data Export**: Download behavioral data in CSV or JSON format
- **Error Handling**: Clear feedback for database connectivity issues

### Parameter Generation System

The application uses a sophisticated parameter generation system for experimental design:

#### Experimental Structure
- **Blocks**: 4 experimental blocks (representing months)
- **Trials per Block**: 20 trials each
- **Training Trials**: 10 preliminary trials
- **Trees**: 4 apple trees with different statistical properties

#### Parameter Generation Process

1. **Training Parameters** (`appleParamsTraining()`):
   - Generates 10 training trials with 2 trees
   - Tree 1: mean=8, Tree 2: mean=3 (SD=0.8, bounds=[2,10])
   - Uses Gaussian distributions with Box-Muller transform
   - Randomized apple presentation order

2. **Main Task Parameters** (`appleParams()`):
   - Creates 100 items per condition with complex tree relationships:
     - **Tree A**: Two different means (5, 7) with controlled variance
     - **Tree B**: Derived from Tree A with specific variance patterns
     - **Tree C**: Related to Trees A/B with additional variance
     - **Tree D**: Always the lowest value tree (inferiority constraint)
   - Only 3 trees shown per trial (one randomly hidden)
   - Horizon conditions: 3 vs 6 future apple samples

3. **Database Storage**:
   - Optimized parallel processing with configurable concurrency
   - Batch inserts with transactions for performance
   - Parameters stored in Task and Training tables

#### Generating Parameters
```bash
# Generate parameters for 50 users
curl -X POST http://localhost:8080/api/generate-data/50
```

### Data Export Options

#### Via Admin Panel
- Visit `/admin` for web interface
- Click download buttons for instant export
- View summary statistics in real-time

#### Via API Endpoints
```bash
# Export all data as CSV
curl "http://localhost:8080/api/output?format=csv" -o behavioral_data.csv

# Export as JSON
curl "http://localhost:8080/api/output?format=json" -o behavioral_data.json

# Get summary statistics only
curl "http://localhost:8080/api/output/summary"

# Export specific table
curl "http://localhost:8080/api/output/table/Behaviour?format=csv"
```

### Research Workflow

1. **Setup**: Generate experimental parameters using `/api/generate-data/:userCount`
2. **Data Collection**: Users complete training and main tasks via React interface
3. **Storage**: Behavioral data automatically saved to Behaviour table
4. **Analysis**: Export data via admin panel or API endpoints
5. **Reset**: Clear tables and regenerate parameters for new studies

## 📊 Understanding & Analyzing Behavioral Data

### Data Export Structure

The exported CSV file contains rich behavioral data with the following structure:

#### File Header Information
```
Maggie's Farm - Behavior Data Export v3
Generated: [timestamp]

SUMMARY
Total Behavior Records: [number]
Unique Users: [number]
Total Blocks: [number]
Total Trials: [number]
```

### Main Data Columns

#### **Participant Information**
- **`UserNo`**: Unique participant identifier
- **`ProlificID`**: External participant ID (if using Prolific)
- **`Date`**: Experiment date
- **`UserStartTime`**: When participant started the session

#### **Trial Structure**
- **`BlockNo`**: Experimental block (1-4, representing months)
- **`TrialNo`**: Trial number within the experiment
- **`ItemNo`**: Specific item/scenario being presented
- **`Horizon`**: Number of future samples available (3 or 6)

#### **Tree Configuration**
- **`TreeColours`**: Array of color assignments for trees across trials
- **`TreePositions`**: Spatial positions of trees on screen `[tree1_pos, tree2_pos, tree3_pos, tree4_pos]`
- **`UnusedTree`**: Which tree was hidden (1-4)
- **`InitialSamplesNb`**: Number of initial apple samples shown
- **`InitialSamplesTree`**: Which trees the initial samples came from
- **`InitialSamplesSize`**: Size values of initial apple samples

#### **Participant Choices & Behavior**
- **`ChosenTree`**: Array of trees selected by participant across trials
- **`ChosenAppleSize`**: Array of apple sizes obtained from chosen trees
- **`AllKeyPressed`**: All keyboard inputs during the session
- **`ReactionTimes`**: Detailed timing data for each decision (milliseconds)

#### **Timing Data**
- **`BlockStartTime`**: When each block began
- **`BlockFinishTime`**: When each block ended
- **`InfoRequestNo`**: Number of information requests made

### Data Analysis Guide

#### **1. Choice Analysis**
```python
# Example: Analyze tree selection patterns
import pandas as pd
import json

# Load data
df = pd.read_csv('mf-behavior-data-export.csv', skiprows=4)

# Parse JSON arrays in columns
df['ChosenTree'] = df['ChosenTree'].apply(json.loads)
df['ChosenAppleSize'] = df['ChosenAppleSize'].apply(json.loads)
df['TreePositions'] = df['TreePositions'].apply(json.loads)

# Analyze choice patterns
for idx, row in df.iterrows():
    user_choices = row['ChosenTree']
    apple_sizes = row['ChosenAppleSize']
    print(f"User {row['UserNo']}, Block {row['BlockNo']}: {len(user_choices)} choices")
```

#### **2. Reaction Time Analysis**
```python
# Parse reaction time data
df['ReactionTimes'] = df['ReactionTimes'].apply(json.loads)

# Calculate average reaction times per user/block
for idx, row in df.iterrows():
    reaction_times = row['ReactionTimes']
    # Each sub-array contains reaction times for trials within that choice
    avg_rt = np.mean([rt for trial_rts in reaction_times for rt in trial_rts if rt > 0])
    print(f"User {row['UserNo']}, Block {row['BlockNo']}: Avg RT = {avg_rt:.2f}ms")
```

#### **3. Learning & Adaptation Analysis**
```python
# Analyze performance across blocks
performance_by_block = df.groupby(['UserNo', 'BlockNo']).agg({
    'ChosenAppleSize': lambda x: np.mean([np.mean(sizes) for sizes in x.apply(json.loads)]),
    'ReactionTimes': lambda x: np.mean([np.mean([rt for sublist in times for rt in sublist if rt > 0]) 
                                      for times in x.apply(json.loads)])
}).reset_index()

print("Learning curve analysis:")
print(performance_by_block)
```

#### **4. Exploration vs Exploitation**
```python
# Analyze information seeking behavior
def analyze_exploration(row):
    chosen_trees = json.loads(row['ChosenTree'])
    tree_positions = json.loads(row['TreePositions'])
    
    # Count unique trees explored
    unique_trees = len(set([tree for trial in chosen_trees for tree in trial if tree > 0]))
    
    # Calculate exploration vs exploitation ratio
    total_choices = sum(len(trial) for trial in chosen_trees)
    exploration_rate = unique_trees / total_choices if total_choices > 0 else 0
    
    return exploration_rate

df['exploration_rate'] = df.apply(analyze_exploration, axis=1)
```

### Key Research Questions You Can Answer

#### **1. Decision-Making Strategies**
- **Optimal Foraging**: Do participants learn to select higher-value trees?
- **Exploration-Exploitation Trade-off**: How do participants balance trying new trees vs. exploiting known good trees?
- **Horizon Effects**: Do participants behave differently when they know they have more/fewer future opportunities?

#### **2. Learning & Adaptation**
- **Performance Over Time**: Do participants improve across blocks (months)?
- **Transfer Learning**: Do strategies learned in early blocks transfer to later blocks?
- **Individual Differences**: What drives variation between participants?

#### **3. Temporal Dynamics**
- **Reaction Time Patterns**: Do faster decisions correlate with better/worse outcomes?
- **Time Pressure Effects**: How do participants adapt when time is limited?
- **Learning Speed**: How quickly do participants adapt to new tree configurations?

### Statistical Analysis Recommendations

#### **Data Preprocessing**
```python
# 1. Handle JSON arrays
for col in ['ChosenTree', 'ChosenAppleSize', 'ReactionTimes', 'TreePositions']:
    df[col] = df[col].apply(json.loads)

# 2. Create derived measures
df['avg_apple_size'] = df['ChosenAppleSize'].apply(lambda x: np.mean([s for trial in x for s in trial if s > 0]))
df['avg_reaction_time'] = df['ReactionTimes'].apply(lambda x: np.mean([rt for trial in x for rt in trial if rt > 0]))
df['total_choices'] = df['ChosenTree'].apply(lambda x: sum(len(trial) for trial in x))

# 3. Handle temporal data
df['BlockStartTime'] = pd.to_datetime(df['BlockStartTime'])
df['BlockFinishTime'] = pd.to_datetime(df['BlockFinishTime'])
df['block_duration'] = (df['BlockFinishTime'] - df['BlockStartTime']).dt.total_seconds()
```

#### **Recommended Analyses**
1. **Mixed-Effects Models**: Account for repeated measures within participants
2. **Learning Curve Analysis**: Model performance changes over time
3. **Choice Models**: Use logistic regression to predict tree selection
4. **Time Series Analysis**: Analyze temporal patterns in decision-making
5. **Clustering Analysis**: Identify distinct behavioral strategies

### Common Data Patterns to Look For

- **Horizon Effects**: Different behavior when `Horizon` = 3 vs 6
- **Tree Position Effects**: Preferences based on `TreePositions`
- **Learning Effects**: Improvement across `BlockNo`
- **Individual Differences**: Variation across `UserNo`
- **Exploitation**: Repeated selection of high-value trees
- **Exploration**: Sampling from previously unvisited trees

### Data Quality Checks

```python
# Check for missing or invalid data
print("Data quality summary:")
print(f"Total records: {len(df)}")
print(f"Unique users: {df['UserNo'].nunique()}")
print(f"Blocks per user: {df.groupby('UserNo')['BlockNo'].nunique().describe()}")

# Check for outliers in reaction times
all_rts = [rt for rts_list in df['ReactionTimes'].apply(json.loads) 
           for trial_rts in rts_list for rt in trial_rts if rt > 0]
print(f"Reaction time stats: mean={np.mean(all_rts):.2f}ms, std={np.std(all_rts):.2f}ms")
```

## 📊 Automated Data Visualization

We provide a powerful script to automatically analyze and visualize your behavioral data:

### 📁 Quick Start

1. **Install Dependencies:**
```bash
pip3 install pandas numpy matplotlib plotly
```

2. **Run Visualization:**
```bash
# Use your exported CSV file
python3 analyze_behavioral_data.py mf-behavior-data-export-2025-07-24.csv

# Or let it find the latest CSV file
python3 analyze_behavioral_data.py
```

### 🎨 What the Script Creates

The script automatically generates **12 comprehensive charts**:

#### **Core Analyses:**
1. **User Performance Dashboard** - Overall participant metrics
2. **Learning Curves** - Improvement across experimental blocks
3. **Horizon Effects** - Decision differences based on future opportunities
4. **Exploration Patterns** - Balance between discovery vs. exploitation

#### **Behavioral Dynamics:**
5. **Reaction Time Analysis** - Decision speed patterns
6. **Apple Size Distribution** - Outcome value spread
7. **Tree Preferences** - Subject choice patterns
8. **Block Duration** - Time expenditure analysis

#### **Advanced Insights:**
9. **Correlation Heatmap** - Relationship matrix between variables
10. **Individual Profiles** - Participant-specific behavior patterns
11. **Performance Scatter** - Scatter plots showing key relationships
12. **Summary Statistics Table** - Descriptive overview

### 📋 Features

- **Zero Setup**: Works immediately with exported CSV files
- **Automatic JSON Parsing**: Handles nested array data seamlessly
- **Professional Charts**: Publication-ready visualizations
- **Comprehensive Analysis**: Covers key research questions
- **Interactive Options**: Save charts or display interactively
- **Detailed Report**: Automatic text summary generation

### 🎯 Key Research Questions Answered Automatically

1. **Do participants learn over time?** (Learning curve analysis)
2. **How do future opportunities affect choices?** (Horizon effects)
3. **Are participants risk-seeking or conservative?** (Exploration analysis)
4. **Does decision speed impact outcomes?** (Reaction time vs. results)
5. **What strategies do different participants use?** (Individual profiling)

### 📊 Output Files

- `behavioral_analysis_charts.png` - All visualizations in one file
- `behavioral_analysis_report.txt` - Statistical summary and insights

### 🧪 Example Usage for Your Data

The provided sample shows 4 behavioral records from 1 participant across 4 blocks. The visualization script will reveal:
- Learning improvement from block 1 to 4
- Exploration rate across months
- Reaction time patterns and decision efficiency
- Individual strategy preferences

Simply run the script on any exported CSV file to get instant insights!

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend in development mode |
| `npm run server` | Start backend server only |
| `npm run client` | Start frontend client only |
| `npm start` | Start backend in production mode |
| `npm run build` | Build frontend for production |
| `npm run install-client` | Install frontend dependencies |

### Development Features
- **Hot Reload**: Frontend automatically refreshes on changes
- **CORS Enabled**: Cross-origin requests allowed
- **Mock Database**: No database setup required
- **Detailed Logging**: Console logs for debugging

### Code Structure Guidelines
- **Backend**: Express.js with SQL Server models
- **Frontend**: React with class-based components
- **Styling**: CSS modules and Bootstrap
- **State Management**: Component-level state

## 🚀 Production Deployment

### Build for Production
```bash
# Build frontend
npm run build

# Set environment variables
export NODE_ENV=production
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password

# Start production server
npm start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure database environment variables
- Ensure SQL Server is accessible
- Set up proper security headers (already configured)

### Deployment Platforms
The application is configured for deployment on:
- **Heroku** (includes `heroku-postbuild` script)
- **Azure** (SQL Server compatible)
- **Any Node.js hosting platform**

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process using port 3000 or 8080
npx kill-port 3000
npx kill-port 8080
```

#### Database Connection Errors
- **Development**: Ignore - app uses mock mode
- **Production**: Check database credentials and server connectivity

#### Frontend Build Errors
```bash
# Clear npm cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

#### CORS Issues
- Frontend proxy is configured in `client/package.json`
- Backend CORS is enabled for all origins in development

### Console Warnings
Recent fixes have resolved common React warnings:
- ✅ State updates during render
- ✅ NaN CSS values
- ✅ Missing API prefixes

### Getting Help
1. Check browser console for frontend errors
2. Check terminal console for backend errors  
3. Verify API endpoints using browser or Postman
4. Ensure both frontend and backend are running

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📞 Support

If you encounter any issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review console logs for errors
3. Ensure all dependencies are installed correctly
4. Verify the application is running on correct ports

**Happy coding! 🎉** 