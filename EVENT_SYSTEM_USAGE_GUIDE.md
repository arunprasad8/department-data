# Event Submission System - Implementation & Usage Guide

## Quick Start Guide

### Starting the Server

```bash
# Install dependencies (if not already done)
npm install

# Start the server
npm start

# Server runs on: http://localhost:3000
```

### Accessing the Events System

1. Navigate to: `http://localhost:3000/events.html`
2. Login with appropriate role:
   - **Teacher**: Access as teacher1 or teacher2
   - **HOD**: Access as admin with HOD role
   - **Newsletter In-Charge**: Access as designated teacher with this role

---

## System Architecture Overview

### Event Lifecycle Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EVENT CREATION PHASE                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Teacher/HOD creates event in Create Event tab            │
│ 2. Uploads: Poster, Venue Confirmation, Guest Confirmation  │
│ 3. If Teacher → Status: 'pending' (awaits HOD approval)    │
│ 4. If HOD → Status: 'approved' (auto-approved)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    EVENT APPROVAL PHASE                      │
├─────────────────────────────────────────────────────────────┤
│ 1. HOD goes to "HOD Approvals" tab                          │
│ 2. Views pending events and can:                            │
│    - Add comments on event poster                           │
│    - Approve event                                          │
│    - Reject event                                           │
│ 3. On approval: Notifications sent to all teachers         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   EVENT COMPLETION PHASE                     │
├─────────────────────────────────────────────────────────────┤
│ 1. Approved event appears in "All Events" tab              │
│ 2. Hosting teacher views event details                      │
│ 3. After event date: Click "Mark as Completed"            │
│ 4. Status: 'completed'                                     │
│ 5. Auto-created task: "Submit Event Report for [Event]"   │
│ 6. Deadline: Event Date + 3 days                           │
│ 7. Teacher receives notification of deadline               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   REPORT SUBMISSION PHASE                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Hosting teacher re-opens completed event                │
│ 2. Sees "Submit Event Report" section (now visible)        │
│ 3. Uploads required files:                                  │
│    ✓ Event Report (PDF/DOC)                                │
│    ✓ Event Photos (multiple)                               │
│    ✓ Newsletter Document                                    │
│    ✓ Highlight Photo 1                                     │
│    ✓ Highlight Photo 2                                     │
│ 4. Status: 'submitted'                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DISTRIBUTION PHASE                          │
├─────────────────────────────────────────────────────────────┤
│ Role-Based Distribution:                                    │
│                                                              │
│ HOD (Full Access):                                          │
│ ├─ Event Report                                             │
│ ├─ All Event Photos                                         │
│ ├─ Newsletter                                               │
│ └─ Both Highlight Photos                                    │
│                                                              │
│ Newsletter In-Charge (Limited Access):                      │
│ ├─ Newsletter ONLY                                          │
│ ├─ Highlight Photo 1                                        │
│ └─ Highlight Photo 2                                        │
│                                                              │
│ Other Teachers:                                             │
│ └─ Cannot access submission files                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  DEADLINE MONITORING                         │
├─────────────────────────────────────────────────────────────┤
│ 1. System checks every hour for overdue submissions        │
│ 2. If Deadline Date < Today AND Not Submitted:             │
│    ├─ Status: 'overdue'                                    │
│    ├─ Notification to hosting teacher                      │
│    └─ Notification to HOD                                  │
│ 3. Check monitoring dashboard for status overview          │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Usage Examples

### Example 1: Creating & Approving an Event (Teacher → HOD)

**As Teacher:**
1. Navigate to Events page
2. Click "Create Event" tab
3. Fill out form:
   - Event Name: "Technical Workshop on AI"
   - Department: "Computer Science"
   - Description: "Hands-on workshop..."
   - Venue: "Auditorium A"
   - Date: 2026-03-10
   - Start Time: 10:00
   - End Time: 13:00
4. Upload required images
5. Click "Submit Event for Approval"
6. ✓ Event created with status: **pending**
7. Notification appears: "Event submitted to HOD for approval"

**As HOD (next)**
1. Navigate to Events page
2. Click "HOD Approvals" tab
3. See pending event
4. Click "View Details"
5. In modal, see "HOD Actions" section
6. Can add comments on event
7. Click "✓ Approve Event"
8. ✓ Event approved with status: **approved**
9. All teachers receive notification: "New event: Technical Workshop on AI on Mar 10"

---

### Example 2: Completing Event & Creating Report Task

**As Hosting Teacher (after event date):**
1. Go to "My Events" tab
2. Click on approved event
3. See "Event Status Management" section
4. Click "✓ Mark as Completed"
5. Confirm action
6. ✓ Event status changed to **completed**
7. ✓ Internal task created: "Submit Event Report for Technical Workshop on AI"
8. ✓ Task deadline: March 13, 2026 (Event Date + 3 days)
9. Notification: "Task assigned: Submit Event Report... - Due Mar 13"

---

### Example 3: Submitting Event Report

**As Hosting Teacher (before deadline):**
1. Go to "My Events" tab
2. Click on completed event
3. See "Submit Event Report" section (new!)
4. Fill in required files:
   - Report: AI_Workshop_Report.pdf
   - Photos: Select multiple photos from event
   - Newsletter: Workshop_Summary.pdf
   - Highlight Photo 1: Best_Moment.jpg
   - Highlight Photo 2: Group_Photo.jpg
5. Click "Submit Event Report"
6. ✓ Submission successful
7. Submission status changes to **submitted**
8. Status badge shows: ✅ Submitted

---

### Example 4: HOD Reviewing Full Submission

**As HOD:**
1. Navigate to Events
2. Go to "All Events" or "Notifications" tab
3. See notification: "Event report submitted for 'Technical Workshop on AI' by Alice Smith. Full access granted."
4. Click on event to view details
5. See "Event Report Files" section with ALL files:
   - 📑 Event Report (PDF)
   - 📷 Event Photos (10 photos)
   - 📰 Newsletter (PDF)
   - 📸 Highlight Photo 1 (JPG)
   - 📸 Highlight Photo 2 (JPG)
6. Download any/all files for review and archiving

---

### Example 5: Newsletter In-Charge Limited Access

**As Newsletter In-Charge:**
1. Navigate to Events
2. Go to "Notifications" tab
3. See notification: "Event report submitted for 'Technical Workshop on AI'. Newsletter and highlight photos available."
4. Click on event to view details
5. See "Event Report Files" section with LIMITED files:
   - 📰 Newsletter (PDF) ✓
   - 📸 Highlight Photo 1 (JPG) ✓
   - 📸 Highlight Photo 2 (JPG) ✓
   - (NO Event Report access)
   - (NO Event Photos access)
6. Download only newsletter and 2 highlight photos
7. Use these for department newsletter publication

---

## Database & Data Files

### Automatic Data Initialization

On first server start:

```
✓ data/events.json → 5 sample events created
✓ data/teachers.json → 3 sample teachers with roles
✓ data/eventSubmissions.json → Initialized (empty)
✓ data/eventTasks.json → Initialized (empty)
✓ data/eventNotifications.json → Initialized
✓ data/eventComments.json → Initialized (empty)
✓ uploads/event-submissions/ → Folder created
```

### Sample Teachers

| Name | Email | Role |
|------|-------|------|
| Alice Smith | alice@example.com | Teacher |
| Bob Johnson | bob@example.com | Newsletter In-Charge |
| Dr. HOD | hod@example.com | HOD |

### Sample Events (Auto-Loaded)

All sample events are pre-loaded with:
- Status: "Upcoming"
- All required fields
- Hosted by sample teachers
- Ready for test workflows

To test: Simply open an approved event and click "Mark as Completed"

---

## Notification System

### How Notifications Work

1. **Real-time in UI**: Badge shows unread count
2. **Notifications Tab**: Shows all user notifications
3. **Click to View**: Opens event details automatically
4. **Auto-Archive**: Marked as read when event is opened
5. **Role-Based**: Different messages for different roles

### Notification Types

| Type | Recipient | When |
|------|-----------|------|
| Event Submitted | HOD | Teacher creates event |
| Event Approved | Event Creator + All Teachers | HOD approves |
| Event Rejected | Event Creator | HOD rejects |
| Report Deadline Assigned | Hosting Teacher | Event marked complete |
| Report Submitted (Full) | HOD | Report uploaded |
| Report Submitted (Limited) | Newsletter In-Charge | Report uploaded |
| Report Overdue | Hosting Teacher + HOD | Deadline passed |
| Comment Added | Other Party | Comment posted |

---

## Role-Based Access Control

### Teacher Role

**Can Perform:**
- ✅ Create events
- ✅ View own events
- ✅ Submit reports for own events
- ✅ View own submissions
- ✅ Add comments to events
- ✅ Receive event notifications

**Cannot Perform:**
- ❌ Approve other events
- ❌ Access other teachers' submissions
- ❌ Download other teachers' reports

**Endpoints Accessible:**
```
GET  /api/events
POST /api/events/create
GET  /api/events/:eventId
POST /api/events/:eventId/comment
POST /api/events/:eventId/complete (own events only)
POST /api/events/:eventId/submit (own events only)
GET  /api/events/:eventId/submission
GET  /api/events/notifications/:user
```

### HOD Role

**Can Perform:**
- ✅ Create events (auto-approved)
- ✅ View all events
- ✅ Approve/reject pending events
- ✅ Download ALL submission files
- ✅ Monitor all deadlines
- ✅ View full analysis of submissions
- ✅ Add comments to events

**Additional Endpoints:**
```
POST /api/events/:eventId/approve
GET  /api/events/submissions/monitoring
GET  /api/events/submissions/download/:fileId
```

### Newsletter In-Charge Role

**Can Perform:**
- ✅ Receive notifications about report submissions
- ✅ Download newsletter document
- ✅ Download 2 highlight photos ONLY
- ✅ View event details

**Cannot Perform:**
- ❌ Download full event report
- ❌ Download all event photos
- ❌ Create/approve events
- ❌ Submit reports

**File Access:**
```
Newsletter PDF ✓
Highlight Photo 1 ✓
Highlight Photo 2 ✓
Event Report ❌
Event Photos ❌
```

---

## File Storage & Downloads

### Upload Structure
```
data/uploads/event-submissions/
├── {event-id-1}/
│   ├── 1709280000000-report.pdf
│   ├── 1709280001000-newsletter.pdf
│   ├── 1709280002000-highlight1.jpg
│   ├── 1709280003000-highlight2.jpg
│   ├── 1709280004000-photo1.jpg
│   └── 1709280005000-photo2.jpg
│
└── {event-id-2}/
    └── ...
```

### Download Authorization

All file downloads verify:
1. User role (HOD/NLIC/Teacher)
2. File type being requested
3. Role-appropriate access

**Role-Based Access Matrix:**
```
                    Report  Photos  Newsletter  Highlights
HOD                   ✓       ✓         ✓          ✓
Newsletter In-Charge  ❌      ❌         ✓          ✓
Hosting Teacher       ✓       ✓         ✓          ✓
Other Teachers        ❌      ❌         ❌          ❌
```

---

## Monitoring & Dashboard

### Submission Monitoring

Access: `/api/events/submissions/monitoring`

Returns:
```json
{
  "submissions": [
    {
      "id": "event-uuid",
      "name": "Technical Workshop on AI",
      "date": "2026-03-10",
      "hosted_by": "Alice Smith",
      "report_deadline": "2026-03-13",
      "submission_status": "submitted | pending | overdue",
      "submitted_at": "2026-03-13T10:30:00Z",
      "files_count": 13
    }
  ]
}
```

### Task Tracking

Access: `/api/events/tasks/{teacherName}`

Returns all assigned tasks with:
- Task title
- Deadline
- Status
- Event association

---

## Error Handling & Validation

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Incomplete form | Fill all required fields |
| "Only hosting teacher can submit report" | Wrong teacher | Use hosting teacher account |
| "Event must be marked as completed first" | Premature submission | Mark event complete first |
| "File not found" | Deleted/missing file | Re-upload file |
| "Access denied" | Role restriction | Use appropriate role account |

### Validation Rules

```javascript
// Event Creation
- name: required, string
- description: required, string
- venue: required, string
- date: required, valid date
- startTime: required, valid time
- endTime: required, valid time, after startTime
- poster: required, file upload
- venueConfirmation: required, file upload
- guestConfirmation: required, file upload

// Event Submission
- event_id: must be completed event
- hostedByTeacherId: must match event creator
- reportFile: required, PDF/DOC
- eventPhotos: required, 1+ files
- newsletter: required, PDF/DOC
- highlightPhoto1: required, image
- highlightPhoto2: required, image
```

---

## Testing the System

### Manual Testing Checklist

- [ ] **Event Creation**
  - [ ] Create event as teacher
  - [ ] Event status is "pending"
  - [ ] HOD receives notification

- [ ] **Event Approval**
  - [ ] HOD can view pending event
  - [ ] HOD can approve event
  - [ ] Event status changes to "approved"
  - [ ] All teachers receive notification

- [ ] **Event Completion**
  - [ ] Navigate to approved event
  - [ ] Click "Mark as Completed"
  - [ ] Task created in database
  - [ ] Deadline set to Event Date + 3 days
  - [ ] Teacher receives notification

- [ ] **Report Submission**
  - [ ] Report form appears after completion
  - [ ] Can upload all required files
  - [ ] Submission status updates to "submitted"

- [ ] **HOD Review**
  - [ ] HOD sees report submitted notification
  - [ ] Can view event details
  - [ ] Can download all files
  - [ ] File counts accurate

- [ ] **Newsletter In-Charge Access**
  - [ ] NLIC sees notification
  - [ ] Can download newsletter PDF
  - [ ] Can download both highlight photos
  - [ ] Cannot download report or event photos
  - [ ] Error when trying to access restricted files

- [ ] **Role Separation**
  - [ ] Teacher cannot approve events
  - [ ] NLIC cannot submit reports
  - [ ] Other teachers cannot access submissions

- [ ] **Deadline Tracking**
  - [ ] Check /api/events/submissions/monitoring
  - [ ] Verify deadline calculations (Event Date + 3)
  - [ ] System should mark overdue submissions
  - [ ] Notifications sent for overdue

---

## API Reference

### Create Event
```
POST /api/events/create
Content-Type: multipart/form-data

Body:
{
  name: string,
  description: string,
  venue: string,
  date: YYYY-MM-DD,
  startTime: HH:MM,
  endTime: HH:MM,
  department: string,
  createdBy: string,
  isHOD: boolean,
  poster: File,
  venueConfirmation: File,
  guestConfirmation: File
}

Response:
{ "ok": true, "event": {...} }
```

### Submit Event Report
```
POST /api/events/{eventId}/submit
Content-Type: multipart/form-data

Body:
{
  hostedByTeacherId: string,
  hostedByTeacherName: string,
  submittedBy: string,
  reportFile: File,
  newsletter: File,
  highlightPhoto1: File,
  highlightPhoto2: File,
  eventPhotos: File[]
}

Response:
{ "ok": true, "submission": {...} }
```

### Get Submission Status
```
GET /api/events/{eventId}/submission

Response:
{
  "ok": true,
  "event": {...},
  "reportingDeadline": "YYYY-MM-DD",
  "submission": {...} | null,
  "submissionStatus": "pending" | "submitted" | "overdue"
}
```

### Review Submission (Role-Based)
```
GET /api/events/{eventId}/submission/review/{userRole}/{userName}

Response (HOD):
{
  "ok": true,
  "submission": {
    "files": {
      "report_file": "filename.pdf",
      "event_photos": ["photo1.jpg", ...],
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    }
  }
}

Response (Newsletter In-Charge):
{
  "ok": true,
  "submission": {
    "files": {
      "newsletter_file": "newsletter.pdf",
      "highlight_photo_1": "highlight1.jpg",
      "highlight_photo_2": "highlight2.jpg"
    }
  }
}
```

---

## Performance Considerations

- **Overdue Check**: Runs every hour (configurable)
- **File Size Limit**: 100MB per file
- **Multiple Photos**: Up to 10 event photos per submission
- **Notification Deduplication**: Prevents duplicate overdue notifications
- **Automatic Cleanup**: Old temporary files in uploads folder

---

## Future Enhancements

1. **Email Notifications**: Integrate SendGrid/SMTP
2. **SMS Alerts**: For critical deadlines
3. **Bulk Operations**: Import/export events
4. **Advanced Reporting**: Analytics dashboard
5. **Digital Signatures**: For report approval
6. **Version Control**: Track submission changes
7. **Archive System**: Auto-archive completed events
8. **QR Code**: Quick event sharing
9. **Calendar Integration**: Sync with Google Calendar
10. **Mobile App**: React Native companion app

---

## Support & Troubleshooting

### Server Won't Start
```bash
# Check port 3000 is free
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# If in use, kill process or change PORT in .env
```

### Data Files Not Creating
```bash
# Ensure data folder exists
mkdir -p data/uploads/event-submissions

# Check file permissions
chmod 755 data/

# Restart server to trigger initialization
```

### Notifications Not Appearing
```bash
# Check browser console for errors
# Verify user session: sessionStorage.getItem('currentUser')
# Ensure notifications are being created in eventNotifications.json
```

### File Upload Fails
```bash
# Check uploads folder permissions
# Verify file size < 100MB
# Check disk space availability
# Restart server if multer cache is full
```

---

## Documentation Files

- `EVENT_SUBMISSION_SYSTEM.md` - Complete technical documentation
- `server.js` - Backend implementation
- `events.html` - Frontend UI
- `events-script.js` - Frontend logic
- `events-styles.css` - Styling

