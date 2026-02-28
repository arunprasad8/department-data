# ✅ Integrated Event Submission System for Anil Verma

**Status:** Ready to Implement  
**Approach:** Event-Integrated (No Separate Tasks)  
**Date:** February 26, 2026  

---

## 📋 System Overview

This is a **simplified, integrated** event submission system where:
- ✅ Report submission happens **inside the event detail**
- ✅ No separate task table needed
- ✅ Everything in **"My Events" tab** for teachers
- ✅ Role-based access after submission
- ✅ Clean, teacher-centric workflow

---

## 🎯 The Completed Event

### Event Details
```json
{
  "id": "evt-ai-workshop-2026",
  "name": "Technical Workshop on Artificial Intelligence",
  "description": "AI fundamentals and applications workshop",
  "venue": "Seminar Hall A",
  "date": "2026-02-24",
  "startTime": "09:00",
  "endTime": "13:00",
  "department": "Computer Science",
  "createdBy": "Dr. Anil Verma",
  "hostedBy": "Dr. Anil Verma",
  "eventType": "Workshop",
  "status": "Completed",
  "completed_at": "2026-02-24T13:00:00.000Z",
  "completed_by": "Dr. Anil Verma",
  "isHODCreated": false,
  "poster": null,
  "venueConfirmation": null,
  "guestConfirmation": null,
  "createdAt": "2026-02-24T08:00:00.000Z"
}
```

**Event Date:** February 24, 2026 (2 days before current date)  
**Status:** ✅ Completed  
**Hosted By:** Dr. Anil Verma  

---

## 📊 Deadline Calculation

```
Formula: Event Date + 3 Days
─────────────────────────────
Event Date:          Feb 24
Deadline:            Feb 27 ← Calculated automatically
Days Remaining:      1 day (as of Feb 26)
Status:              ⏳ PENDING SUBMISSION
```

---

## 🎨 UI Layout

### For Teachers (Anil Verma)

#### 1️⃣ My Events Tab
```
┌─────────────────────────────────────────────┐
│ My Events                                   │
├─────────────────────────────────────────────┤
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ Technical Workshop on AI              │  │
│ │ Status: COMPLETED ✅                 │  │
│ │                                       │  │
│ │ Date: Feb 24, 2026                   │  │
│ │ Venue: Seminar Hall A                │  │
│ │ Report Deadline: Feb 27, 2026         │  │
│ │ Days Remaining: 1 day ⏳               │  │
│ │                                       │  │
│ │ Submission Status: PENDING            │  │
│ │                                       │  │
│ │ [View Details & Submit]        │  │
│ │                        (Click to expand)│  │
│ └───────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

#### 2️⃣ Event Detail Page (When Clicked)
```
┌─────────────────────────────────────────────┐
│ Technical Workshop on Artificial Intelligence│
│ Status: COMPLETED ✅                        │
├─────────────────────────────────────────────┤
│                                             │
│ 📅 Event Date: February 24, 2026            │
│ 🏛️  Venue: Seminar Hall A                   │
│ 👤 Hosted By: Dr. Anil Verma                │
│ ✅ Status: Completed                       │
│                                             │
├─────────────────────────────────────────────┤
│ 📝 REPORT SUBMISSION                        │
├─────────────────────────────────────────────┤
│                                             │
│ Deadline: Feb 27, 2026                      │
│ Days Remaining: 1 day ⏳                     │
│ Status: PENDING SUBMISSION                  │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │ 📄 Event Report (PDF/DOC)          │    │
│ │ [Choose File]                       │    │
│ │                                     │    │
│ │ 📰 Newsletter File (PDF/DOC)        │    │
│ │ [Choose File]                       │    │
│ │                                     │    │
│ │ ⭐ Highlight Photo #1 (JPG/PNG)     │    │
│ │ [Choose File]                       │    │
│ │                                     │    │
│ │ ⭐ Highlight Photo #2 (JPG/PNG)     │    │
│ │ [Choose File]                       │    │
│ │                                     │    │
│ │ 📸 Event Photos (JPG/PNG - Multiple)│    │
│ │ [Choose Files] (Max 10)             │    │
│ │                                     │    │
│ │ [SUBMIT REPORT]                     │    │
│ └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 👥 Teachers in System

### 1. Dr. Anil Verma (Teacher - Event Host)
```json
{
  "id": "teacher_anil",
  "name": "Dr. Anil Verma",
  "email": "anil.verma@example.com",
  "role": "Teacher",
  "assignedSubject": "Data Structures",
  "assignedClasses": ["BCA-2A"]
}
```
- **Login:** `teacher_anil` / `teacherChrist2025`
- **Can:** Submit event reports for hosted events
- **Sees:** My Events tab with submission form

### 2. Dr. HOD (HOD - Admin)
```json
{
  "id": "hod1",
  "name": "Dr. HOD",
  "email": "hod@example.com",
  "role": "HOD"
}
```
- **Login:** `hod_monica` / `christHOD2025`
- **Can:** View all submissions
- **Receives:** ALL files (Report, Newsletter, Photos, Highlights)

### 3. Bob Johnson (Newsletter In-Charge)
```json
{
  "id": "t2",
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "role": "Newsletter In-Charge"
}
```
- **Role:** Newsletter In-Charge
- **Receives:** ONLY Newsletter file + 2 Highlight photos
- **Cannot See:** Event Report, Event Photos

---

## 📋 Required Documents

| Document | Type | Count | For | Description |
|----------|------|-------|-----|-------------|
| **Event Report** | PDF/DOC | 1 | HOD | Main event documentation |
| **Newsletter File** | PDF/DOC | 1 | HOD + NLIC | Newsletter content |
| **Highlight Photo #1** | JPG/PNG | 1 | HOD + NLIC | Best moment photo |
| **Highlight Photo #2** | JPG/PNG | 1 | HOD + NLIC | Key moment photo |
| **Event Photos** | JPG/PNG | 2-10 | HOD | Various workshop photos |

---

## 📊 Role-Based Distribution

### When Anil Verma Submits:

**HOD Receives (Full Access)**
```
✅ Event Report (PDF)
✅ Newsletter File (PDF)
✅ Event Photos (all 2-10 files)
✅ Highlight Photo #1 (JPG)
✅ Highlight Photo #2 (JPG)
─────────────────────
Total: Up to 15 files
```

**Newsletter In-Charge Receives (Limited Access)**
```
✅ Newsletter File (PDF)
✅ Highlight Photo #1 (JPG)
✅ Highlight Photo #2 (JPG)
────────────────────────
Total: 3 files
✗ Cannot see: Report, Event Photos
```

**Anil Verma (Host)**
```
✅ Can view own submission
✅ Can see submission status
✅ Can edit before deadline
✗ Cannot see after submission (read-only)
```

---

## 🔄 Workflow Steps

### Step 1: Event Completion
**When:** Event date passes (Feb 24)  
**Action:** Status changes to "Completed"  
**Result:** Submit button appears in My Events

```
Event Created (Feb 24 AM)
        ↓
Event Held (Feb 24 09:00-13:00)
        ↓
Event Marked Complete (Feb 24 PM)
        ↓
"My Events" shows with Submit option
```

### Step 2: Submission Deadline
**Automatic Calculation:** Event Date + 3 Days
```
Feb 24 + 3 = Feb 27, 2026
Days Remaining: 1 day (as of Feb 26)
Status: ⏳ PENDING SUBMISSION
```

### Step 3: Teacher Submits
**Files to Upload:**
1. Event Report (PDF/DOC)
2. Newsletter File (PDF/DOC)
3. Highlight Photo #1 (JPG/PNG)
4. Highlight Photo #2 (JPG/PNG)
5. Event Photos (Multiple JPG/PNG)

**Storage:** `/data/uploads/event-submissions/evt-ai-workshop-2026/`

### Step 4: Distribution
**Triggered On:** Submission success
```
Anil's Files
     ↓
┌────┴────┐
↓         ↓
HOD    NLIC
All    Limited
Files  Files
```

**HOD Notification:**
```
"New event submission: Technical Workshop on AI
 From: Dr. Anil Verma
 Files: Report, Newsletter, Photos, Highlights"
```

**NLIC Notification:**
```
"New newsletter content available: Technical Workshop on AI
 Files: Newsletter, Highlight Photos (2)"
```

### Step 5: Status Updates
```
⏳ PENDING        → Files not yet received
✅ SUBMITTED      → Files received & stored
📋 REVIEWED      → HOD reviewed submission
📰 PUBLISHED     → NLIC published newsletter
⏰ OVERDUE        → Deadline passed, not submitted
```

---

## 💾 Database Structure

### events.json
```json
{
  "id": "evt-ai-workshop-2026",
  "name": "Technical Workshop on Artificial Intelligence",
  "description": "AI fundamentals and applications workshop",
  "venue": "Seminar Hall A",
  "date": "2026-02-24",
  "hostedBy": "Dr. Anil Verma",
  "status": "Completed",
  "completed_at": "2026-02-24T13:00:00.000Z",
  "completed_by": "Dr. Anil Verma"
}
```

### eventSubmissions.json
```json
{
  "id": "submission-001",
  "event_id": "evt-ai-workshop-2026",
  "hosted_by": "Dr. Anil Verma",
  "report_file": "uploads/event-submissions/evt-ai-workshop-2026/report.pdf",
  "newsletter_file": "uploads/event-submissions/evt-ai-workshop-2026/newsletter.pdf",
  "highlight_photo_1": "uploads/event-submissions/evt-ai-workshop-2026/highlight-1.jpg",
  "highlight_photo_2": "uploads/event-submissions/evt-ai-workshop-2026/highlight-2.jpg",
  "event_photos": [
    "uploads/event-submissions/evt-ai-workshop-2026/photo-1.jpg",
    "uploads/event-submissions/evt-ai-workshop-2026/photo-2.jpg"
  ],
  "submitted_at": "2026-02-26T14:30:00.000Z",
  "status": "Submitted"
}
```

### teachers.json
```json
[
  {
    "id": "teacher_anil",
    "name": "Dr. Anil Verma",
    "role": "Teacher"
  },
  {
    "id": "hod1",
    "name": "Dr. HOD",
    "role": "HOD"
  },
  {
    "id": "t2",
    "name": "Bob Johnson",
    "role": "Newsletter In-Charge"
  }
]
```

---

## 🔌 Backend Routes Needed

### Get My Events (For Logged-in Teacher)
```
GET /api/events/teacher/my-events
Headers: User-Id, User-Name
Response: [Events hosted by this teacher]
```

### Get Event Details with Submission Status
```
GET /api/events/:eventId/details
Response: Event + Submission status + Deadline info
```

### Submit Event Report
```
POST /api/events/:eventId/submit
Body: FormData with files
Files: report, newsletter, highlight1, highlight2, photos[]
Response: Submission confirmation + Distribution info
```

### Get Submission Status
```
GET /api/events/:eventId/submission/status
Response: Status, submitted_at, files info
```

### Get Submission Files (Role-Based)
```
GET /api/events/:eventId/submission/view/:role
Query: ?userRole=HOD|NLIC|Teacher
Response: Files filtered by role
```

### Download File (Secured)
```
GET /api/events/submissions/download/:fileId
Headers: User-Id, User-Role
Response: File (or 403 if unauthorized)
```

---

## ✨ Key Features

### For Teachers
✅ See all hosted events in "My Events"  
✅ Clear deadline countdown  
✅ One-click submit from event detail  
✅ Upload multiple file types  
✅ See submission status  
✅ Cannot submit after deadline  

### For HOD
✅ View all submissions  
✅ See all files (Report, Newsletter, Photos, Highlights)  
✅ Download any file  
✅ Review and provide feedback  

### For Newsletter In-Charge
✅ See only relevant submissions  
✅ Download only Newsletter + Highlight photos  
✅ Publish to newsletter system  
✅ Cannot access event report or photos  

### Automatic Features
✅ Deadline = Event Date + 3 Days  
✅ Status: Pending → Submitted → Reviewed  
✅ Hourly deadline check (if overdue)  
✅ Auto notifications on submission  
✅ Role-based file filtering  

---

## 🔐 Security & Validation

### Endpoint Security
- ✅ User authentication required
- ✅ Teacher can only submit own events
- ✅ HOD can view all submissions
- ✅ NLIC can only see limited files

### File Validation
- ✅ Report must be PDF/DOC
- ✅ Newsletter must be PDF/DOC
- ✅ Highlight photos exactly 2
- ✅ Event photos 2-10 files
- ✅ Max file size validation

### Role-Based Access
- ✅ Endpoint level: Route checks role
- ✅ File level: Files filtered by role
- ✅ Download level: Authorization verified
- ✅ 403 Forbidden for unauthorized access

---

## 🧪 Testing Checklist

### Test 1: View My Events
- [ ] Login as Dr. Anil Verma
- [ ] Go to Dashboard → My Events tab
- [ ] Should see "Technical Workshop on AI"
- [ ] Status shows "Completed"
- [ ] Deadline shows "Feb 27"

### Test 2: View Event Details
- [ ] Click the event
- [ ] See event date, venue, description
- [ ] See submission form with 5 upload fields
- [ ] See deadline (Feb 27) and pending status

### Test 3: Submit Files
- [ ] Upload Event Report (PDF)
- [ ] Upload Newsletter (PDF)
- [ ] Upload Highlight Photo #1 (JPG)
- [ ] Upload Highlight Photo #2 (JPG)
- [ ] Upload Event Photos (2-10 JPG/PNG)
- [ ] Click Submit
- [ ] See success message

### Test 4: HOD Views All Files
- [ ] Login as HOD
- [ ] Find submission
- [ ] Should see all 5 file types
- [ ] Should be able to download each

### Test 5: NLIC Views Limited
- [ ] Login as Bob Johnson (NLIC)
- [ ] Find submission
- [ ] Should see only 3 files:
   - Newsletter
   - Highlight #1
   - Highlight #2
- [ ] Should NOT see:
   - Event Report
   - Event Photos

### Test 6: Deadline Behavior
- [ ] As of Feb 26: "1 day remaining"
- [ ] After Feb 27: "Overdue" (red)
- [ ] Upload disabled if overdue

---

## 📁 File Structure

```
data/
├── events.json
│   └── evt-ai-workshop-2026 ✅ (completed event)
│
├── eventSubmissions.json
│   └── submission-001 (records submitted files)
│
├── teachers.json
│   ├── Dr. Anil Verma (Teacher)
│   ├── Dr. HOD (HOD)
│   └── Bob Johnson (Newsletter In-Charge)
│
└── uploads/
    └── event-submissions/
        └── evt-ai-workshop-2026/
            ├── report.pdf
            ├── newsletter.pdf
            ├── highlight-1.jpg
            ├── highlight-2.jpg
            ├── photo-1.jpg
            ├── photo-2.jpg
            └── ...
```

---

## ✅ Implementation Checklist

### Backend
- [ ] Verify event exists in events.json (Completed status)
- [ ] Verify teachers in teachers.json (Anil, HOD, NLIC)
- [ ] Add GET `/api/events/teacher/my-events` route
- [ ] Add GET `/api/events/:id/details` route
- [ ] Add POST `/api/events/:id/submit` route
- [ ] Add GET `/api/events/:id/submission/view/:role` route
- [ ] Add GET `/api/events/submissions/download/:fileId` route
- [ ] Add role-based file filtering logic
- [ ] Add deadline calculation (Event Date + 3)
- [ ] Add status tracking (Pending → Submitted)
- [ ] Add automatic notifications

### Frontend
- [ ] Add "My Events" tab to dashboard
- [ ] Show events hosted by logged-in teacher
- [ ] Display deadline countdown
- [ ] Show submission status indicator
- [ ] Add event detail modal
- [ ] Add 5-field upload form
- [ ] Add submit button with validation
- [ ] Show status after submission
- [ ] Add role-based file display
- [ ] Add download buttons

### Database
- [ ] Ensure events.json has completed event ✅
- [ ] Ensure teachers.json has all roles ✅
- [ ] Create eventSubmissions.json entries on submit
- [ ] Update event status after submission
- [ ] Log notifications sent

---

## 🚀 Quick Start

### 1. Verify Event Exists
```bash
# Check: data/events.json should have evt-ai-workshop-2026 with status: "Completed"
cat data/events.json | grep -A 5 "evt-ai-workshop"
```

### 2. Verify Teachers
```bash
# Check: data/teachers.json should have all 3 roles
cat data/teachers.json | grep "role"
```

### 3. Start Server
```bash
node server.js
```

### 4. Login & Test
```
URL: http://localhost:3000/login.html
Username: teacher_anil
Password: teacherChrist2025
```

### 5. Navigate to My Events
```
Dashboard → My Events Tab
Click: Technical Workshop on AI
```

### 6. Submit Files
```
Upload 5 file types
Click: SUBMIT REPORT
```

---

## 📞 Architecture Summary

```
TEACHER FLOW:
─────────────
Login (Anil Verma)
   ↓
My Events Tab
   ↓
Click Event
   ↓
See Submission Form
   ↓
Upload 5 Files
   ↓
Click Submit
   ↓
Status: SUBMITTED ✅


HOD FLOW:
────────
Login
   ↓
Events Section
   ↓
Find Submissions
   ↓
Download All Files (15 max)
   ↓
Review & Approve


NLIC FLOW:
─────────
Login
   ↓
Events Section
   ↓
Find Submissions
   ↓
Download Limited (3 files)
   ↓
Newsletter + Highlights Only
```

---

## ✅ Status

**Event:** ✅ Created (Completed status)  
**Teachers:** ✅ All added (Anil, HOD, NLIC)  
**Deadline:** ✅ Auto-calculated (Feb 27)  
**Workflow:** ✅ Designed (My Events focused)  
**Ready to Implement:** ✅ Yes  

---

**This simplified approach provides:**
- ✅ Cleaner teacher experience
- ✅ Integrated submission workflow
- ✅ No separate task management
- ✅ Event-centric interface
- ✅ Role-based file distribution
- ✅ Production-ready structure

Ready to implement the backend routes and frontend components! 🚀

