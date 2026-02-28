# Event System - API Testing Guide

**Quick endpoint testing reference with curl commands and expected responses**

---

## 🧪 Testing Setup

### Prerequisites
```bash
# 1. Start server
cd "c:\clgstuff\internshipp\New folder"
npm start

# 2. Server runs on
http://localhost:3000

# 3. Base API URL
http://localhost:3000/api/events
```

### Test Data Available
- Sample Events: 5 pre-loaded
- Sample Teachers: 3 with different roles
- Sample Users: alice (teacher), bob (newsletter-ic), hod (head of dept)

---

## 📋 Endpoint Testing Guide

### 1️⃣ Create Event

**Endpoint:** `POST /api/events/create`

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/events/create \
  -F "name=Test Workshop" \
  -F "description=A test event" \
  -F "venue=Test Hall" \
  -F "date=2026-03-15" \
  -F "startTime=10:00" \
  -F "endTime=12:00" \
  -F "department=Computer Science" \
  -F "createdBy=Alice Smith" \
  -F "isHOD=false" \
  -F "poster=@path/to/image.jpg" \
  -F "venueConfirmation=@path/to/venue.jpg" \
  -F "guestConfirmation=@path/to/guest.jpg"
```

**Expected Response:**
```json
{
  "ok": true,
  "event": {
    "id": "uuid-string",
    "name": "Test Workshop",
    "status": "pending",
    "createdBy": "Alice Smith",
    "createdAt": "2026-02-26T10:30:00Z"
  }
}
```

**Test Variations:**
- [ ] Create as teacher → status should be "pending"
- [ ] Create as HOD → status should be "approved"
- [ ] Verify files are uploaded to `/data/uploads/misc/`

---

### 2️⃣ Get All Events

**Endpoint:** `GET /api/events`

**cURL Command:**
```bash
# Get all events
curl http://localhost:3000/api/events

# Get with filters
curl "http://localhost:3000/api/events?status=approved"
curl "http://localhost:3000/api/events?department=Computer+Science"
curl "http://localhost:3000/api/events?createdBy=Alice+Smith"
```

**Expected Response:**
```json
{
  "ok": true,
  "events": [
    {
      "id": "uuid-1",
      "name": "Technical Workshop on AI",
      "status": "approved",
      "date": "2026-03-10",
      "createdBy": "Alice Smith"
    },
    {
      "id": "uuid-2",
      "name": "Coding Hackathon 2026",
      "status": "approved",
      "date": "2026-04-05",
      "createdBy": "Bob Johnson"
    }
    // ... more events
  ]
}
```

**Test Variations:**
- [ ] Filter by status=pending
- [ ] Filter by status=approved
- [ ] Filter by department
- [ ] Filter by createdBy
- [ ] Combine multiple filters

---

### 3️⃣ Get Single Event

**Endpoint:** `GET /api/events/:eventId`

**cURL Command:**
```bash
# Replace with actual event ID
curl http://localhost:3000/api/events/{event-id}

# Example
curl http://localhost:3000/api/events/550e8400-e29b-41d4-a716-446655440000
```

**Expected Response:**
```json
{
  "ok": true,
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Technical Workshop on AI",
    "description": "Hands-on workshop...",
    "venue": "Auditorium A",
    "date": "2026-03-10",
    "status": "approved",
    "createdBy": "Alice Smith",
    "comments": []
  },
  "comments": []
}
```

---

### 4️⃣ Mark Event as Completed

**Endpoint:** `POST /api/events/:eventId/complete`

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/events/{event-id}/complete \
  -H "Content-Type: application/json" \
  -d '{
    "completedBy": "Alice Smith"
  }'
```

**Expected Response:**
```json
{
  "ok": true,
  "event": {
    "id": "{event-id}",
    "status": "completed",
    "completed_at": "2026-02-26T10:30:00Z",
    "completed_by": "Alice Smith"
  },
  "task": {
    "id": "task-uuid",
    "event_id": "{event-id}",
    "task_title": "Submit Event Report for Technical Workshop on AI",
    "deadline": "2026-03-13",
    "status": "pending",
    "assigned_to_name": "Alice Smith"
  }
}
```

**Test Variations:**
- [ ] Mark different events as completed
- [ ] Verify eventTasks.json contains new task
- [ ] Check deadline is Event Date + 3 days
- [ ] Verify notifications created

---

### 5️⃣ Get Submission Status

**Endpoint:** `GET /api/events/:eventId/submission`

**cURL Command:**
```bash
curl http://localhost:3000/api/events/{event-id}/submission
```

**Expected Response:**
```json
{
  "ok": true,
  "event": {
    "id": "{event-id}",
    "name": "Technical Workshop on AI",
    "date": "2026-03-10",
    "hosted_by": "Alice Smith",
    "status": "completed"
  },
  "reportingDeadline": "2026-03-13",
  "submission": null,
  "submissionStatus": "pending"
}
```

**Status Values:**
- `pending` - Event completed, awaiting report
- `submitted` - Report uploaded
- `overdue` - Deadline passed without submission

---

### 6️⃣ Submit Event Report

**Endpoint:** `POST /api/events/:eventId/submit`

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/events/{event-id}/submit \
  -F "hostedByTeacherId=t_alice" \
  -F "hostedByTeacherName=Alice Smith" \
  -F "submittedBy=Alice Smith" \
  -F "reportFile=@report.pdf" \
  -F "newsletter=@newsletter.pdf" \
  -F "highlightPhoto1=@photo1.jpg" \
  -F "highlightPhoto2=@photo2.jpg" \
  -F "eventPhotos=@photo3.jpg" \
  -F "eventPhotos=@photo4.jpg" \
  -F "eventPhotos=@photo5.jpg"
```

**Expected Response:**
```json
{
  "ok": true,
  "submission": {
    "id": "sub-uuid",
    "event_id": "{event-id}",
    "hosted_teacher_name": "Alice Smith",
    "status": "submitted",
    "submitted_at": "2026-02-26T14:00:00Z"
  }
}
```

**Test Variations:**
- [ ] Submit with all required files
- [ ] Try with missing files (should fail)
- [ ] Submit for wrong teacher (should be denied)
- [ ] Submit before event completed (should fail)
- [ ] Multiple event photos (up to 10 supported)

---

### 7️⃣ Get Submission for HOD Review

**Endpoint:** `GET /api/events/:eventId/submission/review/HOD/:userName`

**cURL Command:**
```bash
curl "http://localhost:3000/api/events/{event-id}/submission/review/HOD/hod-name"
```

**Expected Response (Full Access):**
```json
{
  "ok": true,
  "submission": {
    "id": "sub-uuid",
    "event_id": "{event-id}",
    "hosted_by": "Alice Smith",
    "submitted_at": "2026-02-26T14:00:00Z",
    "status": "submitted",
    "files": {
      "report_file": "timestamp-report.pdf",
      "event_photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    },
    "access_level": "full"
  }
}
```

---

### 8️⃣ Get Submission for Newsletter In-Charge Review

**Endpoint:** `GET /api/events/:eventId/submission/review/Newsletter In-Charge/:userName`

**cURL Command:**
```bash
curl "http://localhost:3000/api/events/{event-id}/submission/review/Newsletter%20In-Charge/bob-johnson"
```

**Expected Response (Limited Access):**
```json
{
  "ok": true,
  "submission": {
    "id": "sub-uuid",
    "event_id": "{event-id}",
    "hosted_by": "Alice Smith",
    "submitted_at": "2026-02-26T14:00:00Z",
    "status": "submitted",
    "files": {
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    },
    "access_level": "newsletter"
  }
}
```

**Security Features to Verify:**
- [ ] Report file NOT included
- [ ] Event photos NOT included
- [ ] Only newsletter and 2 highlights

---

### 9️⃣ Download Submission File

**Endpoint:** `GET /api/events/submissions/download/:fileId?userRole={role}&userName={name}`

**cURL Command:**
```bash
# HOD downloading report file
curl "http://localhost:3000/api/events/submissions/download/filename-report.pdf?userRole=HOD&userName=hod-name" \
  --output report.pdf

# Newsletter In-Charge downloading newsletter
curl "http://localhost:3000/api/events/submissions/download/filename-newsletter.pdf?userRole=Newsletter%20In-Charge&userName=bob-johnson" \
  --output newsletter.pdf

# Try to access restricted file (should fail)
curl "http://localhost:3000/api/events/submissions/download/filename-report.pdf?userRole=Newsletter%20In-Charge&userName=bob-johnson"
```

**Expected Response:**
- HOD: File downloads successfully (with any file from submission)
- Newsletter IC: Newsletter, highlight photos download successfully ✓
- Newsletter IC: Report file download returns 403 Access Denied ❌

---

### 🔟 Get All Submissions (Monitoring)

**Endpoint:** `GET /api/events/submissions/monitoring`

**cURL Command:**
```bash
curl http://localhost:3000/api/events/submissions/monitoring
```

**Expected Response:**
```json
{
  "ok": true,
  "submissions": [
    {
      "id": "event-uuid-1",
      "name": "Technical Workshop on AI",
      "date": "2026-03-10",
      "hosted_by": "Alice Smith",
      "report_deadline": "2026-03-13",
      "submission_status": "submitted",
      "submitted_at": "2026-02-26T14:00:00Z",
      "files_count": 13
    },
    {
      "id": "event-uuid-2",
      "name": "Coding Hackathon 2026",
      "date": "2026-04-05",
      "hosted_by": "Bob Johnson",
      "report_deadline": "2026-04-08",
      "submission_status": "pending",
      "submitted_at": null,
      "files_count": 0
    }
  ]
}
```

---

### 1️⃣1️⃣ Get Teacher Tasks

**Endpoint:** `GET /api/events/tasks/:teacherName`

**cURL Command:**
```bash
curl "http://localhost:3000/api/events/tasks/Alice%20Smith"
```

**Expected Response:**
```json
{
  "ok": true,
  "tasks": [
    {
      "id": "task-uuid",
      "event_id": "event-uuid",
      "event_name": "Technical Workshop on AI",
      "task_type": "submit_event_report",
      "task_title": "Submit Event Report for Technical Workshop on AI",
      "task_description": "Please submit the event report...",
      "deadline": "2026-03-13",
      "status": "pending",
      "created_at": "2026-02-26T10:30:00Z",
      "assigned_to_name": "Alice Smith"
    }
  ]
}
```

---

### 1️⃣2️⃣ Get Notifications

**Endpoint:** `GET /api/events/notifications/:user`

**cURL Command:**
```bash
curl "http://localhost:3000/api/events/notifications/Alice%20Smith"
```

**Expected Response:**
```json
{
  "ok": true,
  "notifications": [
    {
      "id": "notif-uuid-1",
      "type": "report_submitted_hod",
      "eventId": "event-uuid",
      "submissionId": "sub-uuid",
      "message": "Event report submitted for 'Event Name' by Alice Smith. Full access granted.",
      "recipient": "Dr. HOD",
      "createdAt": "2026-02-26T14:00:00Z",
      "read": false,
      "accessLevel": "full"
    },
    {
      "id": "notif-uuid-2",
      "type": "report_submitted_nlic",
      "eventId": "event-uuid",
      "submissionId": "sub-uuid",
      "message": "Event report submitted for 'Event Name'. Newsletter and highlight photos available.",
      "recipient": "Bob Johnson",
      "createdAt": "2026-02-26T14:00:00Z",
      "read": false,
      "accessLevel": "newsletter"
    }
  ]
}
```

---

## ✅ Complete Test Workflow

### Step-by-Step Testing Scenario

**1. Get Sample Event ID**
```bash
curl http://localhost:3000/api/events | grep -A 5 '"name"'
# Note the first event ID
```

**2. Check Event Status (should be approved)**
```bash
curl http://localhost:3000/api/events/{event-id}
```

**3. Mark Event as Completed**
```bash
curl -X POST http://localhost:3000/api/events/{event-id}/complete \
  -H "Content-Type: application/json" \
  -d '{"completedBy": "Alice Smith"}'
```

**4. Check New Submission Status (should be pending)**
```bash
curl http://localhost:3000/api/events/{event-id}/submission
```

**5. Submit Files**
```bash
# Create test files first
echo "Test Report" > report.pdf
echo "Test Newsletter" > newsletter.pdf
echo "dummy" > photo1.jpg
echo "dummy" > photo2.jpg

# Submit
curl -X POST http://localhost:3000/api/events/{event-id}/submit \
  -F "hostedByTeacherId=t_alice" \
  -F "hostedByTeacherName=Alice Smith" \
  -F "submittedBy=Alice Smith" \
  -F "reportFile=@report.pdf" \
  -F "newsletter=@newsletter.pdf" \
  -F "highlightPhoto1=@photo1.jpg" \
  -F "highlightPhoto2=@photo2.jpg" \
  -F "eventPhotos=@photo1.jpg"
```

**6. Check Updated Submission Status (should be submitted)**
```bash
curl http://localhost:3000/api/events/{event-id}/submission
```

**7. Get Files as HOD (full access)**
```bash
curl "http://localhost:3000/api/events/{event-id}/submission/review/HOD/hod-name"
```

**8. Get Files as Newsletter IC (limited access)**
```bash
curl "http://localhost:3000/api/events/{event-id}/submission/review/Newsletter%20In-Charge/bob-johnson"
```

**9. View Monitoring Dashboard**
```bash
curl http://localhost:3000/api/events/submissions/monitoring
```

**10. Get Notifications**
```bash
curl "http://localhost:3000/api/events/notifications/Dr. HOD"
```

---

## 🔍 Testing Checklist

### Event Creation & Approval
- [ ] Teacher creates event → status: pending
- [ ] HOD approves → status: approved
- [ ] All teachers receive notification

### Event Completion
- [ ] Click "Mark as Completed"
- [ ] Status changes to: completed
- [ ] Task created in eventTasks.json
- [ ] Deadline = Event Date + 3 days

### Report Submission
- [ ] Form appears after completion
- [ ] Can upload all file types
- [ ] Submission status: submitted
- [ ] Files stored in /uploads/event-submissions/{eventId}/

### Role-Based Access
- [ ] HOD gets full access (all files)
- [ ] Newsletter IC gets limited (newsletter + 2 photos)
- [ ] Other teachers get denied access
- [ ] Download endpoint enforces access control

### Notifications
- [ ] HOD notification has accessLevel: "full"
- [ ] NLIC notification has accessLevel: "newsletter"
- [ ] Teachers without role get no notification

### Error Handling
- [ ] Submit before completion → error
- [ ] Wrong teacher submits → 403 error
- [ ] Missing files → error
- [ ] Invalid role → 403 error

---

## 📊 Response Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Event retrieved successfully |
| 201 | Created | New event created |
| 400 | Bad Request | Missing required fields |
| 403 | Forbidden | Access denied, wrong role |
| 404 | Not Found | Event not found |
| 500 | Server Error | Database write failed |

---

## 🛠️ Troubleshooting Tests

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000

# Mac/Linux
lsof -i :3000
```

**Sample data not loading:**
```bash
# Check data files exist
ls data/events.json
ls data/teachers.json

# Check server logs for initialization messages
```

**File upload fails:**
```bash
# Verify uploads folder
mkdir -p data/uploads/event-submissions

# Check permissions
ls -la data/uploads/
```

**Access denied errors:**
```bash
# Verify teachers.json has correct roles
cat data/teachers.json | grep -A 1 role

# Check notification has correct recipient
cat data/eventNotifications.json | jq '.[] | select(.type=="report_submitted")'
```

---

## 📝 Notes

- All timestamps in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- All IDs are UUIDs (v4 format)
- File sizes max 100MB per file
- Max 10 event photos per submission
- Dates in format: `YYYY-MM-DD`
- Times in format: `HH:mm` (24-hour)

---

**Last Updated:** February 26, 2026  
**API Version:** 1.0  
**Status:** Production Ready

