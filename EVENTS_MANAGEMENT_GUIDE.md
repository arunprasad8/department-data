# Events Management System - User Guide

## Overview
The Events Management System allows teachers to create and submit department events for HOD approval with a discussion/comment system and automatic notification to all teachers once approved.

## Files Added/Modified

### New Files Created:
1. **events.html** - Main events management interface
2. **events-script.js** - Frontend JavaScript logic
3. **events-styles.css** - Styling for the events page
4. **EVENTS_MANAGEMENT_GUIDE.md** - This file

### Files Modified:
1. **server.js** - Added Events API endpoints
2. **dashboard.html** - Added buttons to access Events page

### Data Files (Auto-created on first run):
- `data/events.json` - Stores all events
- `data/eventComments.json` - Stores comments/discussions
- `data/eventNotifications.json` - Stores notifications

---

## How to Access

### For Teachers:
1. Login to the dashboard
2. Look for the **"📅 Department Events"** section
3. Click **"Go to Events Management"** button

### For HOD:
1. Login as HOD
2. Look for the **"📅 Department Events - Approvals"** section
3. Click **"Go to Event Approvals"** button

---

## Teacher Workflow

### Step 1: Create Event
1. Go to **Create Event** tab
2. Fill in the following required information:
   - **Event Name** - Name of the event (e.g., "Tech Conference 2024")
   - **Department** - Department name (e.g., "Computer Science")
   - **Description** - Detailed description
   - **Venue** - Location (e.g., "Auditorium Hall A")
   - **Date** - Event date
   - **Time** - Event time
   
3. Upload 3 required files:
   - **Poster** - Event poster/flyer image
   - **Venue Confirmation** - Screenshot confirming venue booking
   - **Guest Confirmation** - Screenshot of guest confirmation to attend

4. Click **"Submit Event for Approval"**

### Step 2: Wait for HOD Approval
1. Go to **Notifications** tab to see approval status
2. Go to **My Events** tab to view your submitted events
3. Once HOD comments, you'll see notifications

### Step 3: Discuss with HOD
1. Open event details by clicking **"View Details"**
2. Go to **Discussion** section
3. Add comments to reply to HOD feedback
4. HOD will see your replies in real-time

### Step 4: Event Status
- **Pending** - Waiting for HOD approval
- **Approved** - Event approved, all teachers notified
- **Rejected** - Event rejected by HOD

---

## HOD Workflow

### Step 1: View Pending Events
1. Go to **HOD Approvals** tab
2. See all pending events submitted by teachers
3. Click **"View Details"** on any event

### Step 2: Review Event Details
In the modal that opens, you can see:
- Event information (name, date, time, venue, department)
- Description
- Event Documents:
  - Poster image
  - Venue confirmation screenshot
  - Guest confirmation screenshot

### Step 3: Add Comments on Poster
1. Scroll to **Discussion** section
2. Enter your feedback/comments about the poster
3. Click **"Post Comment"** (or Ctrl+Enter)
4. Teacher will get notification of your comment

### Step 4: Approve or Reject
1. Scroll to **HOD Actions** section
2. Click either:
   - **✓ Approve Event** - Approves the event, all teachers notified
   - **✗ Reject Event** - Rejects the event, teacher notified

### Step 5: Continue Discussion
After approving/rejecting, you can still:
- View all event comments
- Add additional comments if needed
- Teacher can reply to your feedback

---

## Notification System

### Notifications You'll Receive:

**For Teachers:**
- Event submitted confirmation
- HOD comments on your event
- Event approved/rejected status
- Other approved events in the department

**For HOD:**
- New event submitted for approval
- Teacher replies to your comments

### Managing Notifications:
1. Go to **Notifications** tab
2. Click on any notification to see details
3. Badge shows unread notification count
4. Clicking a notification opens the event details
5. Notifications automatically marked as read

---

## Features

### Event Filtering (All Events Tab):
- **Filter by Status** - Pending, Approved, Rejected
- **Filter by Department** - See events from specific departments

### Event Discussion (Comment System):
- Real-time comments between teacher and HOD
- Role badges show who is commenting (Teacher/HOD)
- Timestamps for all comments
- Continue discussion even after approval/rejection

### File Management:
- All event images stored securely
- Can download/view attachments anytime
- Files accessible from event details

### Responsive Design:
- Works on desktop and mobile
- Touch-friendly interface
- Optimized for various screen sizes

---

## API Endpoints

For developers, the following endpoints are available:

### Events:
- `POST /api/events/create` - Create new event (with file upload)
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:eventId` - Get event details with comments

### Comments:
- `POST /api/events/:eventId/comment` - Add comment to event

### Approvals:
- `POST /api/events/:eventId/approve` - Approve/reject event

### Notifications:
- `GET /api/events/notifications/:user` - Get user notifications
- `POST /api/events/notifications/:notificationId/read` - Mark as read

---

## Tips & Best Practices

1. **Before Creating Event:**
   - Have all required files ready
   - Take clear screenshots of confirmations
   - Create a professional poster

2. **Submitting Event:**
   - Fill in all details completely
   - Use clear, descriptive event names
   - Provide detailed descriptions

3. **As Teacher:**
   - Check notifications regularly
   - Respond promptly to HOD comments
   - Provide high-quality images

4. **As HOD:**
   - Review events promptly
   - Provide constructive feedback
   - Approve only when all requirements met

---

## Troubleshooting

### Can't see Events button:
- Make sure you're logged in
- Refresh the page
- Check that you have the teacher or HOD role

### File upload fails:
- Check file format (images only: JPG, PNG, etc.)
- Ensure file size is reasonable (<5MB)
- Try a different image

### Can't find event after creation:
- Go to "My Events" tab
- Try refreshing the page
- Check if the submission was successful (look for success message)

### Notifications not showing:
- Refresh the page
- Check the Notifications tab
- Wait 30 seconds for the system to update

---

## Color Coding

- 🔵 **Navy (#002147)** - Primary brand color
- 🟡 **Gold (#d4af37)** - Accent color
- 🟢 **Green** - Approved status
- 🟡 **Yellow** - Pending status
- 🔴 **Red** - Rejected status

---

## Support

For any issues or feature requests, contact the IT department.

---

**Last Updated:** January 24, 2026
**Version:** 1.0
