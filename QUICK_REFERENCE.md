# Event Submission System - Quick Reference Card

## 🎯 System Overview

A comprehensive event management system that handles:
- Event creation and approval workflow
- Event report submission with deadline tracking  
- Role-based file distribution to HOD and Newsletter teams
- Automatic task assignment and status monitoring

---

## 📊 Database Schema Quick Reference

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| **events.json** | Event records | id, name, date, status, createdBy, hosted_by |
| **eventSubmissions.json** | Report files | event_id, report_file, newsletter_file, highlight_photos, event_photos |
| **eventTasks.json** | Internal tasks | event_id, assigned_to_name, deadline, status |
| **teachers.json** | User roles | name, email, role (Teacher/HOD/Newsletter In-Charge) |
| **eventNotifications.json** | User alerts | recipient, type, read status, accessLevel |
| **eventComments.json** | Discussions | eventId, author, text |

---

## 🔄 Workflow States

### Event Status Flow
```
pending → approved → completed → [submission tracking]
          ↓
        rejected
```

### Submission Status Flow
```
pending → submitted → [distribution complete]
       ↓
      overdue (if deadline passed)
```

---

## 👥 Role Matrix

### Teacher
```
✅ Create events
✅ Submit reports (own events only)
✅ View own submissions
✅ Add comments
❌ Approve other events
❌ Download other submissions
```

### HOD
```
✅ Create events (auto-approved)
✅ Approve/reject all events
✅ Download ALL files from submissions
✅ Monitor all deadlines
✅ View full submissions
```

### Newsletter In-Charge
```
✅ Download newsletter PDF
✅ Download 2 highlight photos
✅ View notifications
❌ Download event reports
❌ Download all event photos
❌ Create/approve events
```

---

## 📋 API Endpoints Summary

### Event Management
```
POST   /api/events/create                          Create event
GET    /api/events                                 List events
GET    /api/events/:eventId                        Get event details
POST   /api/events/:eventId/comment                Add comment
POST   /api/events/:eventId/approve                HOD: approve/reject
```

### Event Workflow
```
POST   /api/events/:eventId/complete               Mark complete → Creates task
GET    /api/events/:eventId/submission             Get status
```

### Report Submission
```
POST   /api/events/:eventId/submit                 Upload reports
GET    /api/events/:eventId/submission/review/:role/:user  Get files (role-based)
GET    /api/events/submissions/download/:fileId    Download file (access-controlled)
```

### Monitoring
```
GET    /api/events/submissions/monitoring          All submissions overview
GET    /api/events/tasks/:teacherName              Teacher's tasks
```

### Notifications
```
GET    /api/events/notifications/:user             User's notifications
POST   /api/events/notifications/:id/read          Mark as read
```

---

## ⏰ Timeline Example

```
Mar 10 - Event Date
         └─ Teacher marks event as COMPLETED
         └─ Deadline set: Mar 13 (Event Date + 3 days)
         └─ Task assigned to teacher

Mar 13 - Report Deadline
         ├─ Morning: Teacher submits files
         │          ├─ Event Report (PDF)
         │          ├─ Event Photos (10 images)
         │          ├─ Newsletter (PDF)
         │          ├─ Highlight Photo 1 (JPG)
         │          └─ Highlight Photo 2 (JPG)
         │
         ├─ HOD Receives:
         │  ✓ All files (full access)
         │  ✓ Notification with access level: "full"
         │
         └─ Newsletter In-Charge Receives:
            ✓ Newsletter PDF
            ✓ Highlight Photo 1
            ✓ Highlight Photo 2
            ✓ Notification with access level: "newsletter"

Mar 14 - If Deadline Passed & No Submission:
         ├─ Automatic status: OVERDUE
         ├─ Notification to teacher: Deadline missed
         └─ Notification to HOD: Deadline missed
```

---

## 🎬 Key Features

### ✅ Event Creation with Approval
- Teachers propose events (status: pending)
- HOD reviews and approves/rejects
- Comments support team collaboration

### ✅ Automatic Task Creation
- When event marked complete
- Task: "Submit Event Report for [Event]"
- Deadline: Event Date + 3 days
- Teacher receives notification

### ✅ File Submission Workflow
- Single upload point for all materials
- Support for multiple event photos
- Separate fields for highlight photos

### ✅ Smart File Distribution
- **HOD**: Full access to everything
- **Newsletter Team**: Access only newsletter + 2 highlight photos
- **Other Teachers**: No access (except own submissions)

### ✅ Automatic Deadline Monitoring
- Hourly check for overdue submissions
- Notifications to teacher + HOD when missed
- Deduplication to prevent spam

### ✅ Role-Based Access Control
- Download endpoint verifies role before streaming files
- Newsletter In-Charge cannot access event reports
- Other teachers cannot access other submissions

---

## 📁 File Structure

```
data/
├── events.json                    [Event master records]
├── eventSubmissions.json          [Submission records]
├── eventTasks.json               [Internal task tracking]
├── eventNotifications.json       [Notification history]
├── eventComments.json            [Event discussion]
├── teachers.json                 [User roles & metadata]
│
└── uploads/event-submissions/
    ├── event-id-1/
    │   ├── timestamp-report.pdf
    │   ├── timestamp-newsletter.pdf
    │   ├── timestamp-highlight1.jpg
    │   ├── timestamp-highlight2.jpg
    │   └── timestamp-photo1.jpg
    │       timestamp-photo2.jpg
    │       ... (multiple event photos)
    │
    └── event-id-2/
        └── ... (same structure)
```

---

## 🔒 Security Features

1. **Role Verification**: Every endpoint checks user role
2. **File Access Control**: Download verifies role + file type
3. **Ownership Validation**: Only hosting teacher can submit
4. **Newsletter Isolation**: Cannot access non-newsletter files
5. **Duplicate Prevention**: Flags prevent repeated notifications

---

## 🚀 Quick Start

```bash
# 1. Start server
npm start

# 2. Server initialization:
✓ Creates data files
✓ Loads 5 sample events
✓ Initializes 3 sample teachers
✓ Sets up folders

# 3. Access Events Page
http://localhost:3000/events.html

# 4. Test Workflow:
a) Create event as teacher
b) Approve event as HOD
c) Mark event complete
d) Submit report files
e) HOD downloads all files
f) Newsletter In-Charge downloads limited files
```

---

## 📌 Important Dates

All events use **ISO 8601 format**: `YYYY-MM-DD`

```
Sample Event Dates (auto-loaded):
├─ Mar 10 (Technical Workshop) - 3 days away
├─ Mar 20 (Cybersecurity Lecture) - 13 days away
├─ Mar 25 (Cloud Computing) - 18 days away
├─ Apr 05 (Coding Hackathon) - 29 days away
└─ May 15 (Project Expo) - 69 days away

Completion Strategy:
→ Mark event complete after or on event date
→ Deadline automatically = Date + 3 days
→ Report must be submitted before deadline
```

---

## 🛠️ Configuration

### Environment Variables
```
PORT=3000                          Server port
SMTP_HOST=...                      Email service (optional)
SMTP_PORT=...                      Email port (optional)
SMTP_USER=...                      Email user (optional)
SMTP_PASS=...                      Email password (optional)
```

### Server Constants
```
UPLOADS_DIR = data/uploads
MAX_FILE_SIZE = 100MB per file
SUBMISSION_DEADLINE = Event Date + 3 days
OVERDUE_CHECK = Every hour
NOTIFICATION_REFRESH = Every 30 seconds
```

---

## ✨ Optional Enhancements

- [ ] Email notifications for all events
- [ ] SMS alerts for deadline reminders
- [ ] Google Calendar integration
- [ ] Digital signature for approvals
- [ ] Event analytics dashboard
- [ ] Batch event import from CSV
- [ ] Mobile-responsive refinements
- [ ] Dark mode support
- [ ] Multi-language support

---

## 🧪 Testing Checklist

- [ ] Teacher can create pending event
- [ ] HOD can approve to make it approved
- [ ] Hot can reject to make it rejected
- [ ] Teacher can mark approved event as completed
- [ ] System creates internal task on completion
- [ ] Report form appears for completed events
- [ ] Teacher can upload all required files
- [ ] HOD receives full access notification
- [ ] NLIC receives limited access notification
- [ ] HOD can download all files
- [ ] NLIC can download only newsletter + highlights
- [ ] Other teachers get access denied
- [ ] Deadline monitoring detects overdue
- [ ] Overdue notifications sent correctly

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Files not uploading | Check uploads/event-submissions folder exists |
| Notifications not showing | Verify notifications created in JSON |
| Access denied errors | Verify user role in teachers.json |
| Download fails | Check file exists in uploads folder |
| Task not created | Verify Event Marked as Completed |

---

## 📞 API Response Examples

### Create Event Success
```json
{
  "ok": true,
  "event": {
    "id": "uuid-here",
    "name": "Event Name",
    "status": "pending"
  }
}
```

### Submit Report Success
```json
{
  "ok": true,
  "submission": {
    "id": "uuid-here",
    "event_id": "event-uuid",
    "status": "submitted",
    "submitted_at": "2026-03-13T10:30:00Z"
  }
}
```

### Get Submission Status (HOD)
```json
{
  "ok": true,
  "submission": {
    "files": {
      "report_file": "report.pdf",
      "event_photos": ["photo1.jpg", "photo2.jpg"],
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    },
    "access_level": "full"
  }
}
```

### Get Submission Status (Newsletter In-Charge)
```json
{
  "ok": true,
  "submission": {
    "files": {
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    },
    "access_level": "newsletter"
  }
}
```

---

## 📚 Documentation Files

1. **EVENT_SUBMISSION_SYSTEM.md** - Full technical documentation
2. **EVENT_SYSTEM_USAGE_GUIDE.md** - Step-by-step usage guide
3. **QUICK_REFERENCE.md** - This file
4. **server.js** - Backend implementation (1900+ lines)
5. **events.html** - Frontend UI with submission sections
6. **events-script.js** - JavaScript logic
7. **events-styles.css** - CSS styling

---

## 🎓 Learning Path

1. Read this Quick Reference
2. Review EVENT_SUBMISSION_SYSTEM.md for schema
3. Follow EVENT_SYSTEM_USAGE_GUIDE.md for workflows
4. Test with sample events
5. Explore server.js implementation
6. Review UI in events.html

