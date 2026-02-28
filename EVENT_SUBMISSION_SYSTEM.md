# Event Submission System - Complete Documentation

## Overview
This system manages the entire lifecycle of departmental events, from creation through report submission and role-based file distribution.

## 1. Database Schema

### Events Table (`data/events.json`)
```json
{
  "id": "uuid",
  "name": "Technical Workshop on AI",
  "description": "Hands-on workshop introducing AI tools and applications.",
  "venue": "Auditorium A",
  "date": "2026-03-10",
  "startTime": "10:00",
  "endTime": "13:00",
  "department": "Computer Science",
  "createdBy": "Alice Smith",
  "hostedBy": "Alice Smith",
  "eventType": "Workshop",
  "status": "Upcoming | Completed | Approved | Pending | Rejected",
  "isHODCreated": false,
  "poster": "filename.jpg",
  "venueConfirmation": "venue-conf.jpg",
  "guestConfirmation": "guest-conf.jpg",
  "createdAt": "ISO-8601-timestamp",
  "approvedAt": "ISO-8601-timestamp",
  "approvedBy": "HOD Name",
  "completed_at": "ISO-8601-timestamp",
  "completed_by": "Teacher/HOD Name",
  "overdueNotified": false
}
```

### Teachers Table (`data/teachers.json`)
```json
{
  "id": "t1",
  "name": "Alice Smith",
  "email": "alice@example.com",
  "role": "Teacher | HOD | Newsletter In-Charge"
}
```

**Important:** Only ONE teacher should have `role: "Newsletter In-Charge"`

### Event Submissions Table (`data/eventSubmissions.json`)
```json
{
  "id": "uuid",
  "event_id": "event-uuid",
  "hosted_teacher_id": "teacher-id",
  "hosted_teacher_name": "Alice Smith",
  "report_file": "filename-report.pdf",
  "event_photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg"],
  "newsletter_file": "newsletter.pdf",
  "highlight_photo_1": "highlight1.jpg",
  "highlight_photo_2": "highlight2.jpg",
  "submitted_at": "ISO-8601-timestamp",
  "status": "pending | submitted | overdue",
  "hod_received_at": "ISO-8601-timestamp",
  "newsletter_in_charge_received_at": "ISO-8601-timestamp"
}
```

### Event Tasks Table (`data/eventTasks.json`)
Internal assignment tracking for event report submissions.

```json
{
  "id": "uuid",
  "event_id": "event-uuid",
  "event_name": "Technical Workshop on AI",
  "task_type": "submit_event_report",
  "assigned_to_id": "teacher-id",
  "assigned_to_name": "Alice Smith",
  "task_title": "Submit Event Report for Technical Workshop on AI",
  "task_description": "Please submit the event report, photos, newsletter, and highlight photos...",
  "deadline": "2026-03-13",
  "status": "pending | submitted | completed | overdue",
  "created_at": "ISO-8601-timestamp",
  "created_by": "system | teacher-name",
  "completed_at": "ISO-8601-timestamp"
}
```

### Event Notifications Table (`data/eventNotifications.json`)
```json
{
  "id": "uuid",
  "type": "report_submitted_hod | report_submitted_nlic | report_deadline_assigned | report_overdue",
  "eventId": "event-uuid",
  "submissionId": "submission-uuid",
  "taskId": "task-uuid",
  "message": "Event report submitted for 'Event Name'",
  "recipient": "Alice Smith | HOD | Newsletter In-Charge",
  "createdAt": "ISO-8601-timestamp",
  "read": false,
  "accessLevel": "full | newsletter | owner"
}
```

### Event Comments Table (`data/eventComments.json`)
```json
{
  "id": "uuid",
  "eventId": "event-uuid",
  "author": "Alice Smith",
  "role": "teacher | hod",
  "text": "Comment text here",
  "createdAt": "ISO-8601-timestamp"
}
```

---

## 2. Event Lifecycle & Workflows

### Phase 1: Event Creation & Approval
```
Teacher Creates Event
    ↓
Status: 'pending'
    ↓
HOD Receives Notification
    ↓
HOD Approves/Rejects
    ├─ Approved: Status = 'approved', Notification sent to all teachers
    └─ Rejected: Status = 'rejected', Notification sent to creator
```

### Phase 2: Event Execution
```
Status: 'approved' (Before Event Date)
    ↓
Event Date Arrives (is now Completed)
    ↓
Teacher/HOD marks as Completed
    ├─ Triggers: Status = 'completed'
    ├─ Creates Internal Task for hosting teacher
    ├─ Sets Deadline = Event Date + 3 days
    └─ Notification sent to hosting teacher
```

### Phase 3: Report Submission
```
Event Marked as Completed
    ↓
Hosting Teacher Submits Report:
    ├─ Event Report (PDF/DOC)
    ├─ Event Photos (multiple)
    ├─ Newsletter Document
    ├─ Highlight Photo 1
    └─ Highlight Photo 2
    ↓
Submission Status: 'submitted'
    ↓
Role-Based Distribution:
    ├─ HOD: Full access to all files
    ├─ Newsletter In-Charge: Newsletter + 2 Highlight Photos
    └─ Hosting Teacher: Can view own submission (all files)
```

### Phase 4: Deadline Management
```
Automatic Check (Every Hour)
    ↓
Is Report Deadline Passed?
    ├─ No: Status remains 'pending' or 'submitted'
    └─ Yes & Not Submitted:
        ├─ Status: 'overdue'
        ├─ Notification sent to hosting teacher
        ├─ Notification sent to HOD
        └─ Flag: event.overdueNotified = true (to prevent duplicate notifications)
```

---

## 3. Backend API Endpoints

### Event Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/create` | Create new event (with file uploads) |
| GET | `/api/events` | Get all events (with filters) |
| GET | `/api/events/:eventId` | Get single event with comments |
| POST | `/api/events/:eventId/comment` | Add comment to event |
| POST | `/api/events/:eventId/approve` | HOD approves/rejects event |
| GET | `/api/events/notifications/:user` | Get user notifications |
| POST | `/api/events/notifications/:notificationId/read` | Mark notification as read |

### Event Completion & Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/:eventId/complete` | Mark event as completed, auto-create task |
| GET | `/api/events/tasks/:teacherName` | Get teacher's assigned tasks |
| POST | `/api/events/tasks/:taskId/update` | Update task status |

### Report Submission
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events/:eventId/submit` | Submit event report with files |
| GET | `/api/events/:eventId/submission` | Get submission status |
| GET | `/api/events/:eventId/submission/review/:userRole/:userName` | Get files for review (role-based) |
| GET | `/api/events/submissions/monitoring` | Get all submissions for monitoring |
| GET | `/api/events/submissions/download/:fileId` | Download submission file (role-based access) |

---

## 4. Role-Based Access Control

### **Teacher**
- ✅ Create events
- ✅ Submit event reports (only for own events)
- ✅ View own submissions
- ✅ Add comments to events
- ✅ Receive notifications about events they host
- ❌ Approve other events
- ❌ Download other teachers' submissions

### **Head of Department (HOD)**
- ✅ Create events (auto-approved)
- ✅ Approve/reject pending events
- ✅ Full access to all submitted event reports
- ✅ Download all files from all submissions
- ✅ View all event details
- ✅ Receive full access notifications for submissions
- ✅ Monitor all submission deadlines

### **Newsletter In-Charge** (New Role)
- ✅ View only Newsletter documents
- ✅ View only 2 Highlight Photos
- ✅ Receive limited notifications
- ❌ Access to event reports
- ❌ Access to all event photos
- ❌ Create or approve events

---

## 5. Notification System

### Notification Types & Recipients

#### When Event is Created (by Teacher)
```
Recipient: HOD
Type: 'event_submitted'
Message: 'New event "X" submitted by Y for approval'
```

#### When Event is Created (by HOD)
```
Recipient: All Teachers (except creator)
Type: 'event_notification'
Message: 'New event: "X" on DATE'
```

#### When Event is Approved
```
Recipient: Event Creator + All Other Teachers
Type: 'event_approved'
Message: 'Your event "X" has been approved'
```

#### When Report Deadline is Assigned (Event Marked Complete)
```
Recipient: Hosting Teacher
Type: 'report_deadline_assigned'
Message: 'Task assigned: Submit Event Report for "X" - Due DATE'
```

#### When Report is Submitted (Full Access - HOD)
```
Recipient: HOD
Type: 'report_submitted_hod'
Access: FULL (all files)
Files: Report, All Photos, Newsletter, Highlights
Message: 'Event report submitted for "X" by Y. Full access granted.'
```

#### When Report is Submitted (Limited Access - Newsletter In-Charge)
```
Recipient: Newsletter In-Charge
Type: 'report_submitted_nlic'
Access: LIMITED (newsletter + highlights only)
Files: Newsletter, Highlight Photo 1, Highlight Photo 2
Message: 'Event report submitted for "X". Newsletter and highlight photos available.'
```

#### When Report Deadline is Overdue
```
Recipients: Hosting Teacher + HOD
Type: 'report_overdue'
Message: 'Report deadline passed for event "X"'
```

---

## 6. Sample Events Data

Pre-loaded sample events in `data/events.json`:

1. **Technical Workshop on AI**
   - Date: 2026-03-10
   - Hosted By: Alice Smith
   - Type: Workshop
   - Venue: Auditorium A

2. **Coding Hackathon 2026**
   - Date: 2026-04-05
   - Hosted By: Bob Johnson
   - Type: Hackathon
   - Venue: Lab 204

3. **Guest Lecture on Cybersecurity**
   - Date: 2026-03-20
   - Hosted By: Alice Smith
   - Type: Lecture
   - Venue: Conference Hall

4. **Project Expo**
   - Date: 2026-05-15
   - Hosted By: Bob Johnson
   - Type: Expo
   - Venue: Exhibition Gallery

5. **Seminar on Cloud Computing**
   - Date: 2026-03-25
   - Hosted By: Alice Smith
   - Type: Seminar
   - Venue: Seminar Room 1

---

## 7. File Storage Structure

```
data/
├── uploads/
│   └── event-submissions/
│       └── {event-id}/
│           ├── {timestamp}-report.pdf
│           ├── {timestamp}-newsletter.pdf
│           ├── {timestamp}-highlight1.jpg
│           ├── {timestamp}-highlight2.jpg
│           └── {timestamp}-photo1.jpg
│               {timestamp}-photo2.jpg
│               ... (multiple event photos)
├── events.json
├── eventSubmissions.json
├── eventTasks.json
├── eventNotifications.json
├── eventComments.json
└── teachers.json
```

---

## 8. Key Utility Functions

### `addDays(isoDate, days)` → deadline
Calculates deadline by adding days to event date.
```
Event Date: 2026-03-10
Report Deadline: 2026-03-13 (Event Date + 3 days)
```

### `getHOD()` → teacher object
Returns the teacher object with `role: 'HOD'`

### `getNewsletterInCharge()` → teacher object
Returns the teacher object with `role: 'Newsletter In-Charge'`

### `ensureTeacherData()`
Seeds initial teacher data if file is empty:
- Teacher 1: Alice Smith (Role: Teacher)
- Teacher 2: Bob Johnson (Role: Newsletter In-Charge)
- Teacher 3: Dr. HOD (Role: HOD)

### `seedSampleEvents()`
Pre-loads 5 sample events for demonstration.

### `updateOverdueSubmissions()`
Runs every hour to check for overdue submissions and send notifications.

---

## 9. UI Components

### Events Tab - All Events View
- Event cards with title, date, hosted by, status
- Filter by status, department
- Click to view details

### Event Modal - New Sections

#### Event Status Management
- Shows current event status
- Button to mark event as completed (visible for hosting teacher)

#### Event Submission Status
- Event Date
- Report Deadline (Event Date + 3 days)
- Current Submission Status (Pending/Submitted/Overdue)
- Hosted By

#### Event Report Submission Form (Hosting Teacher Only)
- Report File Upload (PDF/DOC)
- Multiple Event Photos Upload
- Newsletter Document Upload
- Highlight Photo 1 Upload
- Highlight Photo 2 Upload
- Submit Button

#### Event Submission Review Section (HOD & NLIC)
- Displays accessible files based on role
- Download links for each file
- HOD: All files
- NLIC: Newsletter + 2 Highlight Photos

---

## 10. Testing Checklist

- [ ] Create event as teacher → pending status
- [ ] Approve event as HOD → approved status, notifications sent
- [ ] Mark event as completed → task created for hosting teacher
- [ ] Submit event report as hosting teacher → submission recorded
- [ ] HOD receives notification with full access
- [ ] Newsletter In-Charge receives notification with limited access
- [ ] Download files as HOD → all files accessible
- [ ] Download files as NLIC → newsletter + highlights only
- [ ] Check overdue notifications (simulate deadline passing)
- [ ] Verify role separation and access controls

---

## 11. Error Handling

All endpoints return JSON responses:

### Success Response
```json
{ "ok": true, "data": {...} }
```

### Error Response
```json
{ "error": "Error message here" }
```

### Validation Rules
- Event name, description, venue, date required for creation
- Only hosting teacher can submit report
- Event must be completed before report submission
- Role-based file access strictly enforced
- Duplicate notifications prevented via flags

---

## 12. Security & Best Practices

1. **Role Verification**: All endpoints check user role before allowing access
2. **File Access Control**: Download endpoint verifies user role and file type
3. **Newsletter In-Charge Limitation**: Strictly limited to newsletter + 2 photos only
4. **Deadline Tracking**: Automatic overdue detection with notification deduplication
5. **Event Ownership**: Only hosting teacher can submit for their event
6. **HOD Authority**: Full access to all submission files for monitoring and review

---

## 13. Future Enhancements

- Email notifications for all roles
- Event attendance tracking
- Automated report template generation
- Photo gallery for accepted events
- Newsletter preview before distribution
- Bulk event creation from CSV
- Event participation metrics
- Feedback collection from attendees
- Integration with email/messaging service
