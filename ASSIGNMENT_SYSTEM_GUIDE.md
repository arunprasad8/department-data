# Assignment Management System Documentation

## Overview

This is a comprehensive assignment management system with student submission tracking, monitoring dashboard, and proactive/reactive assignment categorization for the CIA Classroom platform.

## Features Implemented

### 1. Sample Assignments (8 Total)

#### Proactive Assignments (4)
1. **Research Paper on AI Ethics** (100 marks)
   - Type: Research Paper
   - Due: Feb 15, 2025
   - 4 students assigned
   - 2 submissions received

2. **Hackathon – Smart Campus Solution** (100 marks)
   - Type: Hackathon (48-hour)
   - Due: Feb 28, 2025
   - 4 students assigned
   - 1 submission received (GitHub link)

3. **Technical Workshop – Full Stack Development** (100 marks)
   - Type: Workshop
   - Due: Mar 10, 2025
   - 4 students assigned
   - 0 submissions yet

4. **Mini Project – Inventory Management System** (100 marks)
   - Type: Mini Project
   - Due: Mar 20, 2025
   - 5 students assigned
   - 1 submission received

#### Reactive Assignments (4)
1. **Remedial Assignment – Data Structures Basics** (50 marks)
   - Type: Remedial
   - Due: Feb 10, 2025
   - 2 students assigned
   - 1 submitted, 1 reviewed (42/50)

2. **Re-test – Operating Systems Unit 1** (30 marks)
   - Type: Re-test
   - Due: Feb 5, 2025 (⚠️ OVERDUE)
   - 3 students assigned
   - 0 submissions

3. **Basic Coding Practice – Loops & Functions** (30 marks)
   - Type: Coding Practice
   - Due: Feb 12, 2025
   - 2 students assigned
   - 2 submitted, 2 reviewed

4. **Seminar – Introduction to DBMS** (25 marks)
   - Type: Seminar
   - Due: Feb 20, 2025
   - 2 students assigned
   - 0 submissions yet

---

## System Components

### Backend Routes (Node.js/Express)

#### Monitoring Dashboard Endpoints
```
GET /api/monitoring/assignments
- Fetches all assignments with submission stats
- Returns: totalStudents, submittedCount, reviewedCount, pendingCount, status

GET /api/monitoring/assignments/:assignmentId
- Fetches detailed view with student-wise submission data
- Returns: assignment details + studentDetails array

POST /api/monitoring/submissions/:submissionId/review
- Updates submission with marks and feedback
- Body: { marks, feedback, status: 'Reviewed' }
```

#### Student Submission Endpoints
```
GET /api/student/assignment/:token
- Retrieves assignment details using unique token
- Returns: assignment metadata without student roster

POST /api/student/submit/:token
- Student submits their work (file, text, or link)
- Accepts multipart/form-data with file upload
- Returns: submission record with ID
```

---

## Frontend Components

### 1. Monitoring Tab (Teacher View)

**Location**: `dashboard.html` → Teacher Dashboard → Monitoring Tab

**Features**:
- 📊 Stats Dashboard: Total assignments, Active, Overdue, Total submissions
- 📋 Assignment Overview Table with columns:
  - Assignment Title
  - Type (Proactive/Reactive)
  - Total Students
  - Submitted (with progress bar)
  - Pending submissions
  - Deadline
  - Status (Active/Overdue)
  - View Details button

- 🔍 Filtering & Search:
  - Filter by Type (Proactive/Reactive)
  - Filter by Status (Active/Overdue/Closed)
  - Search by assignment title

- 📋 Detailed View Modal:
  - Assignment information
  - Student-wise submission status
  - Individual submission download/view
  - Review submission button
  - Add marks and feedback

**File**: `monitoring-script.js`

### 2. Student Assignment Submission Page

**Location**: `student-submission.html?token={unique_token}`

**Features**:
- 🔓 Token-based Access: Each assignment gets a unique shareable link
- 📝 Form Fields:
  - Student Name (auto-fill if logged in)
  - Email Address
  - Submission Type Selection

- 📤 Multiple Submission Types:
  1. **File Upload**: PDF, DOCX, ZIP (max 50MB)
  2. **Text Response**: Direct answer input
  3. **Submit Link**: GitHub, Google Drive, etc.

- ✅ Confirmation: Shows success message with timestamp
- 🎨 Responsive Design: Works on desktop and mobile

---

## Data Structure

### Assignment Object
```json
{
  "id": "asgn-proactive-001",
  "token": "asgn_a1b2c3d4",
  "title": "Research Paper on AI Ethics",
  "description": "...",
  "type": "proactive|reactive",
  "dueDate": "2025-02-15",
  "maxMarks": 100,
  "assignedStudents": [
    { "id": "student-001", "name": "Rahul Singh", "email": "..." }
  ],
  "dynamicFields": { 
    "researchTopic": "AI Ethics",
    "format": "IEEE",
    "plagiarismLimit": 15
  },
  "status": "active|overdue|closed",
  "submissionCount": 2,
  "reviewedCount": 0
}
```

### Submission Object
```json
{
  "id": "sub-001",
  "assignmentId": "asgn-proactive-001",
  "studentId": "student-001",
  "studentName": "Rahul Singh",
  "studentEmail": "rahul.singh@christuniversity.in",
  "submissionType": "file|text|link",
  "filePath": "uploads/asgn-proactive-001/...",
  "textResponse": null,
  "linkResponse": null,
  "submittedAt": "2025-02-10T14:30:00.000Z",
  "status": "Submitted|Reviewed",
  "marks": null,
  "feedback": null,
  "reviewedBy": null
}
```

---

## How to Use

### For Teachers

#### View Monitoring Dashboard
1. Log in as teacher
2. Go to Dashboard → Subject View → Monitoring Tab
3. See stats at the top
4. View all assignments in table format
5. Use filters to find specific assignments
6. Click "View Details" to see student submissions

#### Review a Submission
1. Open assignment details modal
2. Find student in the submissions table
3. Click "Review" button
4. Enter marks and feedback
5. Click submit
6. Student will see feedback in their dashboard

#### Share Assignment with Students
1. Click "View Details" on any assignment
2. Copy the shareable link from modal (format: `/assignment/submit/{token}`)
3. Share via email, class portal, or any communication channel
4. Students can submit work immediately

---

### For Students

#### Submitting an Assignment
1. Receive shareable link from teacher
2. Click the link (opens `student-submission.html?token=...`)
3. Enter your name and email
4. Choose submission type:
   - **File**: Click to upload or drag-and-drop
   - **Text**: Type your answer directly
   - **Link**: Paste GitHub/Drive/etc. link
5. Click "Submit Assignment"
6. See confirmation with timestamp

#### Viewing Assignment Details
- Assignment type (Proactive/Reactive)
- Description and requirements
- Deadline
- Total marks
- Additional fields (topic, venue, format, etc.)

---

## Sample Workflow

### Scenario: Research Paper Assignment

**Teacher's Steps**:
1. Open Dashboard → Monitoring Tab
2. See "Research Paper on AI Ethics" (4 students, 2 submissions)
3. Click "View Details"
4. See status:
   - Rahul Singh: Submitted, Not reviewed
   - Anjali Verma: Submitted, Not reviewed
   - Priya Nair: Not Started
   - Rohan Gupta: Not Started

5. Click "Review" for Anjali's submission
6. Enter marks: 88
7. Enter feedback: "Excellent research paper with comprehensive analysis..."
8. Submit review

**Student's View**:
1. Receives link: `https://yoursite.com/student-submission.html?token=asgn_a1b2c3d4`
2. Sees assignment details:
   - Type: 🔵 Proactive
   - Deadline: Feb 15, 2025
   - Marks: 100
   - Format: IEEE
   - Min References: 10

3. Selects "Upload File" → selects PDF
4. Enters name and email
5. Clicks "Submit Assignment"
6. Gets confirmation: "Submission Successful! Submitted at 2:15 PM"

---

## Current Statistics

| Metric | Count |
|--------|-------|
| Total Assignments | 8 |
| Active Assignments | 7 |
| Overdue Assignments | 1 |
| Total Submissions | 7 |
| Reviewed | 4 |
| Pending Review | 3 |
| Average Submission Rate | 47% |

---

## File Locations

```
Project Root/
├── server.js                    # Backend routes for assignments
├── dashboard.html              # Teacher dashboard with monitoring tab
├── monitoring-script.js        # Monitoring tab logic
├── student-submission.html     # Student submission form
├── data/
│   ├── localAssignments.json   # Assignment database
│   ├── submissions.json        # Submission records
│   └── uploads/               # Uploaded files storage
└── login-script.js            # User authentication
```

---

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **File Storage**: Local filesystem (uploads/ directory)
- **Database**: JSON files
- **Authentication**: Session-based (via login-script.js)

---

## API Response Examples

### Monitoring Assignments
```json
{
  "ok": true,
  "assignments": [
    {
      "id": "asgn-proactive-001",
      "title": "Research Paper on AI Ethics",
      "type": "proactive",
      "totalStudents": 4,
      "submittedCount": 2,
      "reviewedCount": 0,
      "pendingCount": 2,
      "dueDate": "2025-02-15",
      "status": "Active",
      "progress": 50
    }
  ]
}
```

### Student Submission Success
```json
{
  "ok": true,
  "submission": {
    "id": "sub-001",
    "assignmentId": "asgn-proactive-001",
    "studentName": "Rahul Singh",
    "submittedAt": "2025-02-10T14:30:00.000Z",
    "status": "Submitted"
  }
}
```

---

## Future Enhancements

- 📊 Graphical reporting and analytics
- 🔔 Email notifications for deadlines
- 📁 File preview for common formats (PDF, images)
- 🤖 Plagiarism detection integration
- 📱 Mobile app for student submissions
- 🎯 Assignment templates and scheduling
- 👥 Peer review functionality
- 📈 Student progress tracking
- ⚙️ Assignment auto-grading (for MCQ)
- 🔒 Digital signatures for verified submissions

---

## Troubleshooting

### Issue: Token not recognized
**Solution**: Ensure the token matches exactly. Check assignment data in `localAssignments.json`

### Issue: File upload fails
**Solution**: Check file size (max 50MB) and ensure `/data/uploads/` directory exists

### Issue: Monitoring tab shows no data
**Solution**: Verify `/api/monitoring/assignments` returns data and check browser console for errors

### Issue: Marks not updating
**Solution**: Ensure submission ID is valid and user has teacher privileges

---

## Credits

Built as part of the CIA Classroom Management System for Christ University.

---

**Last Updated**: February 24, 2026
**Version**: 1.0.0
