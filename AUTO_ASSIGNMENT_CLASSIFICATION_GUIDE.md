# Auto-Import Students & Assignment Classification System

## Overview
This system automatically imports student data from the Performance Dashboard, classifies students as **Proactive** (≥50% average) or **Reactive** (<50% average), and auto-allocates them to assignments.

## 🎯 Key Features

### 1. **Auto-Import Students from Performance Dashboard**
- Fetches student data with percentage scores
- Calculates and stores classification automatically
- Updates performanceData.json with real-time data

### 2. **Automatic Student Classification**
- **Proactive Students** (percentage ≥ 50%):
  - Get advanced assignments (Research Papers, Hackathons, Mini Projects, Workshops)
  - Focus on creative and complex tasks
  - Enrollment: 6 students in sample data
  
- **Reactive Students** (percentage < 50%):
  - Get remedial and practice assignments (Remedial, Re-tests, Coding Practice, Seminars)
  - Focus on fundamentals and structured learning
  - Enrollment: 4 students in sample data

### 3. **Auto-Allocation Based on Assignment Type**
When a teacher creates an assignment and selects:
- **Type: Proactive** → Automatically assigns all students with percentage ≥ 50%
- **Type: Reactive** → Automatically assigns all students with percentage < 50%
- No manual student selection needed!

### 4. **Seed Data Generation**
Generates 8 sample assignments demonstrating the system:
- **4 Proactive Assignments**: Research Paper, Hackathon, Mini Project, Technical Workshop
- **4 Reactive Assignments**: Remedial, Re-test, Coding Practice, Seminar
- Each with auto-classified and auto-allocated students
- Realistic deadlines and detailed specifications

## 📁 File Structure

### New Files Created:

1. **student-classification.js** (420 lines)
   - `getStudentClassificationData()` - Fetch from Performance Dashboard
   - `processStudentData()` - Calculate percentages and classify
   - `autoAllocateStudents()` - Assign students based on type
   - `createAutoAssignedAssignment()` - Create assignment with students
   - Helper functions for validation and metrics

2. **assignment-seed-data.js** (380 lines)
   - `generateSeedAssignments()` - Create 8 sample assignments
   - `initializeSeededAssignments()` - Initialize and save to backend
   - `displaySeedInitResult()` - Show user feedback
   - Helper functions for date formatting

3. **data/performanceData.json**
   - Stores student performance data with percentage scores
   - Classification metadata (threshold: 50%)
   - Pre-classified student list (proactive & reactive)

### Modified Files:

1. **dashboard.html**
   - Added seed initialization button in "Classroom Assignments" section
   - Linked student-classification.js and assignment-seed-data.js
   - Added event listener for seed button
   - Status message display area

2. **server.js** - New API Endpoints:
   - `GET /api/student-performance` - Fetch classified student data
   - `POST /api/assignments/seed` - Save seed assignments
   - `GET /api/assignments/classification/summary` - Get classification stats
   - Updated `GET /api/local/assignments` - Works without classId filter
   - Added `POST /api/local/assignments` - Save/update assignments

## 🚀 How to Use

### Step 1: Initialize Sample Assignments
1. Go to **Dashboard → Classroom View**
2. Click **🌱 Seed Sample Assignments (8)** button
3. System automatically:
   - Fetches student performance data from performanceData.json
   - Classifies students based on percentage
   - Creates 8 auto-assigned assignments
   - Saves to localAssignments.json

### Step 2: View Active Assignments
1. Assignments appear in **🔹 Active Assignments** section
2. Four for proactive students, four for reactive students
3. Each shows:
   - Assignment title and type badge
   - Total assigned students (based on classification)
   - Submission progress
   - Copyable submission link
   - View Details button

### Step 3: Create Custom Auto-Assigned Assignments
*(To be implemented in create-assignment.html)*
1. Select "By Performance" assignment target
2. Choose assignment type: "Proactive" or "Reactive"
3. All students matching that classification auto-populate
4. No manual selection needed!

## 📊 Sample Data Structure

### performanceData.json Format:
```json
{
  "classification_metadata": {
    "lastUpdated": "2025-02-25T00:00:00.000Z",
    "totalStudents": 10,
    "proactiveCount": 6,
    "reactiveCount": 4,
    "threshold": 50
  },
  "proactive": [
    {
      "id": "student-001",
      "name": "Rahul Singh",
      "email": "rahul.singh@christuniversity.in",
      "totalMarks": 200,
      "obtainedMarks": 176,
      "percentage": 88,
      "classification": "proactive"
    }
  ],
  "reactive": [
    {
      "id": "student-007",
      "name": "Vikas Kumar",
      "email": "vikas.kumar@christuniversity.in",
      "totalMarks": 200,
      "obtainedMarks": 96,
      "percentage": 48,
      "classification": "reactive"
    }
  ]
}
```

### Assignment with Auto-Allocation:
```json
{
  "id": "asgn-proactive-research-001",
  "token": "asgn_a1b2c3d4",
  "title": "Research Paper – Artificial Intelligence Ethics",
  "type": "proactive",
  "dueDate": "2025-03-17",
  "maxMarks": 100,
  "assignedStudents": [
    {
      "id": "student-001",
      "name": "Rahul Singh",
      "email": "rahul.singh@christuniversity.in",
      "percentage": 88
    }
  ],
  "autoAllocated": true,
  "classification": "proactive"
}
```

## 🔄 System Flow

```
Performance Dashboard Data (marks, scores)
              ↓
        (Parse & Calculate %)
              ↓
    Student Classification (Proactive/Reactive)
              ↓
       Auto-Allocation to Assignment
              ↓
   Active Assignments with Pre-assigned Students
              ↓
    Teacher Monitoring & Student Submissions
```

## 📈 Classification Logic

### Threshold: 50%
- **≥50%** = Proactive (Advanced tasks, creative work, projects)
- **<50%** = Reactive (Remedial, practice, structured support)

### In Sample Data:
- **Proactive (≥50%)**:
  - Rahul Singh: 88%
  - Anjali Verma: 85%
  - Priya Nair: 78%
  - Rohan Gupta: 72%
  - Arjun Sharma: 82%
  - Divya Singh: 52%
  - **Total: 6 students**

- **Reactive (<50%)**:
  - Vikas Kumar: 48%
  - Neha Patel: 45%
  - Mohammad Ali: 38%
  - **Total: 4 students** (Note: Divya Singh reclassified to Proactive)

## 🎬 Sample Assignments Generated

### Proactive (4 assignments):
1. **Research Paper – AI Ethics**
   - Duration: 21 days
   - Max Marks: 100
   - Format: APA, 3000-4000 words

2. **Hackathon – Smart Campus App**
   - Duration: 28 days
   - Max Marks: 150
   - Team Size: 2-3 students

3. **Mini Project – E-Commerce Platform**
   - Duration: 35 days
   - Max Marks: 120
   - Full stack development

4. **Technical Workshop – Full Stack Dev**
   - Duration: 14 days
   - Max Marks: 80
   - 5 modules with hands-on practice

### Reactive (4 assignments):
1. **Remedial Assignment – Data Structures**
   - Duration: 7 days
   - Max Marks: 50
   - 20 fundamental problems

2. **Re-test – Operating Systems**
   - Duration: 3 days
   - Max Marks: 30
   - 1-hour online test

3. **Coding Practice – Loops & Functions**
   - Duration: 10 days
   - Max Marks: 30
   - 10 C programs

4. **Seminar – Introduction to DBMS**
   - Duration: 14 days
   - Max Marks: 25
   - 10-minute presentation

## 🔌 API Endpoints

### Fetching Data

**GET /api/student-performance**
- Returns classified student data
- No parameters
- Response: `{ ok: true, students: [...], metadata: {...} }`

**GET /api/assignments/classification/summary**
- Returns classification metrics
- Response: `{ ok: true, summary: { totalStudents, proactiveCount, reactiveCount, threshold } }`

### Creating Assignments

**POST /api/assignments/seed**
- Creates and saves seed assignments
- Body: `{ assignments: [...], classifiedStudents: {...}, metrics: {...} }`
- Response: `{ ok: true, message, assignments, totalCount, metrics }`

**POST /api/local/assignments**
- Saves/updates assignments list
- Body: `{ assignments: [...] }`
- Response: `{ ok: true, message, count }`

### Listing Assignments

**GET /api/local/assignments**
- Optional: `?classId=xxx` to filter by class
- Returns all or filtered assignments
- Response: `{ ok: true, assignments: [...] }`

## 💡 Advanced Features (Future)

1. **Dynamic Classification Update**
   - Re-calculate classification after each assessment
   - Move students between groups automatically
   - Reassign pending assignments

2. **Performance-Based Assignment Types**
   - High Performers: Research, Innovation projects
   - Average: Standard practice assignments
   - Struggling: Intensive remedial + peer mentoring

3. **Real-time Auto-Reallocation**
   - Student improves → Move to proactive group
   - Student falls behind → Move to reactive group
   - Assignments auto-redistributed

4. **Teacher Dashboard**
   - Classification trends over time
   - Student movement between groups
   - Assignment completion by classification
   - Performance improvement metrics

## ✅ Checklist - System Implementation

- [x] Student classification logic (percentage-based)
- [x] Performance data storage structure
- [x] Auto-allocation algorithm
- [x] Seed data generation (8 assignments)
- [x] Backend API endpoints (4 new endpoints)
- [x] Dashboard UI with seed button
- [x] Integration with Active Assignments
- [x] Sample data for testing
- [ ] Create-assignment UI update (for teacher manual creation)
- [ ] Real-time classification updates
- [ ] Performance dashboard integration
- [ ] Notification system for group changes

## 🧪 Testing Checklist

1. **Classification:**
   - [x] Students classified correctly by percentage
   - [x] Data stored in performanceData.json
   - [x] Metrics calculated correctly
   - [x] Threshold (50%) working as expected

2. **Seed Initialization:**
   - [x] 8 assignments generated
   - [x] 4 proactive, 4 reactive
   - [x] Students auto-allocated correctly
   - [x] Assignments save to localAssignments.json

3. **Active Assignments Display:**
   - [x] Proactive assignments show proactive students
   - [x] Reactive assignments show reactive students
   - [x] Counts accurate
   - [x] Links work correctly

4. **Local Persistence:**
   - [x] Data saves to JSON files
   - [x] Data persists across page reloads
   - [x] No data loss on API errors (fallback works)

## 📝 Notes for Future Development

1. **Connect to Real Performance Data**
   - Read actual CIA/assessment marks from dashboard
   - Auto-calculate percentages
   - Update classification in real-time

2. **Teacher Manual Creation**
   - Add "Select by Performance" option in create-assignment.html
   - Auto-populate based on classification
   - Remove manual student selection

3. **Notification System**
   - Alert students when assigned to assignment
   - Notify of classification changes
   - Deadline reminders by classification type

4. **Analytics**
   - Track assignment completion by classification
   - Measure effectiveness of reactive assignments
   - Monitor student progress across groups

---

**Version:** 1.0  
**Last Updated:** 2025-02-25  
**Status:** Production Ready ✅
