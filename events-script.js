// Get current user from sessionStorage
let currentUser = 'teacher1';
let userRole = 'teacher'; // 'teacher' or 'hod'

// Try to get user from sessionStorage (set by login)
try {
  const userSession = JSON.parse(sessionStorage.getItem('currentUser'));
  if (userSession) {
    currentUser = userSession.username || currentUser;
    // Determine role based on user data
    if (userSession.role === 'hod' || (userSession.role === 'admin' && userSession.adminRole === 'HOD')) {
      userRole = 'hod';
    } else {
      userRole = 'teacher';
    }
  }
} catch (e) {
  console.warn('Could not read user session, using defaults');
}

// API base URL
const API_BASE = 'http://localhost:3000/api/events';
const UPLOADS_BASE = 'http://localhost:3000/uploads/misc';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Set user info
  document.getElementById('user-info').textContent = `${currentUser} (${userRole.toUpperCase()})`;
  
  // Set create event note based on role
  const noteEl = document.getElementById('create-event-note');
  if (noteEl) {
    if (userRole === 'hod') {
      noteEl.textContent = '✓ As HOD, events you create will be automatically approved and notified to all teachers.';
    } else {
      noteEl.textContent = 'Events will be submitted to HOD for approval. Once approved, all teachers will be notified.';
    }
  }
  
  // Setup tab navigation
  setupTabs();
  
  // Setup form handling
  setupEventForm();
  
  // Setup modal
  setupModal();
  
  // Load initial data
  refreshAllEvents();
  refreshNotifications();
  
  // Refresh data periodically
  setInterval(refreshNotifications, 30000); // every 30 seconds
});

// ========== TAB NAVIGATION ==========
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active to clicked
      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
      
      // Load tab content
      loadTabContent(tabName);
    });
  });
  
  // Back button
  document.getElementById('back-btn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
}

function loadTabContent(tabName) {
  switch(tabName) {
    case 'all-events':
      refreshAllEvents();
      break;
    case 'my-events':
      refreshMyEvents();
      break;
    case 'hod-approval':
      refreshPendingEvents();
      break;
    case 'notifications':
      refreshNotifications();
      break;
  }
}

// ========== EVENT FORM ==========
function setupEventForm() {
  const form = document.getElementById('create-event-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('event-name').value;
    const description = document.getElementById('event-description').value;
    const venue = document.getElementById('event-venue').value;
    const date = document.getElementById('event-date').value;
    const startTime = document.getElementById('event-start-time').value;
    const endTime = document.getElementById('event-end-time').value;
    const department = document.getElementById('event-department').value;
    const poster = document.getElementById('event-poster').files[0];
    const venueConfirmation = document.getElementById('venue-confirmation').files[0];
    const guestConfirmation = document.getElementById('guest-confirmation').files[0];
    
    const statusDiv = document.getElementById('create-status');
    
    if (!poster || !venueConfirmation || !guestConfirmation) {
      showStatus(statusDiv, 'All file uploads are required', 'error');
      return;
    }
    
    if (!startTime || !endTime) {
      showStatus(statusDiv, 'Both start and end times are required', 'error');
      return;
    }
    
    // Disable button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('venue', venue);
      formData.append('date', date);
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);
      formData.append('department', department);
      formData.append('createdBy', currentUser);
      formData.append('isHOD', userRole === 'hod' ? 'true' : 'false');
      formData.append('poster', poster);
      formData.append('venueConfirmation', venueConfirmation);
      formData.append('guestConfirmation', guestConfirmation);
      
      const response = await fetch(`${API_BASE}/create`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.ok) {
        const message = userRole === 'hod' 
          ? '✓ Event created and automatically approved!' 
          : '✓ Event submitted successfully! Waiting for HOD approval.';
        showStatus(statusDiv, message, 'success');
        form.reset();
        setTimeout(() => {
          statusDiv.classList.remove('success');
          // Switch to my events tab
          document.querySelector('[data-tab="my-events"]').click();
        }, 2000);
      } else {
        showStatus(statusDiv, 'Error: ' + (data.error || 'Failed to create event'), 'error');
      }
    } catch (error) {
      showStatus(statusDiv, 'Error: ' + error.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Event for Approval';
    }
  });
}

// ========== EVENT LISTS ==========
async function refreshAllEvents() {
  const container = document.getElementById('all-events-list');
  
  try {
    const response = await fetch(`${API_BASE}`);
    const data = await response.json();
    const events = data.events || [];
    
    // Get unique departments for filter
    const departments = [...new Set(events.map(e => e.department))];
    const deptSelect = document.getElementById('filter-department');
    const currentValue = deptSelect.value;
    deptSelect.innerHTML = '<option value="">All Departments</option>';
    departments.forEach(dept => {
      const option = document.createElement('option');
      option.value = dept;
      option.textContent = dept;
      deptSelect.appendChild(option);
    });
    deptSelect.value = currentValue;
    
    // Setup filters
    const statusFilter = document.getElementById('filter-status');
    statusFilter.addEventListener('change', () => filterAndDisplayEvents(events));
    deptSelect.addEventListener('change', () => filterAndDisplayEvents(events));
    
    filterAndDisplayEvents(events);
  } catch (error) {
    container.innerHTML = `<p class="loading" style="color: red;">Error loading events: ${error.message}</p>`;
  }
}

function filterAndDisplayEvents(events) {
  const container = document.getElementById('all-events-list');
  const statusFilter = document.getElementById('filter-status').value;
  const deptFilter = document.getElementById('filter-department').value;
  
  let filtered = events;
  if (statusFilter) filtered = filtered.filter(e => e.status === statusFilter);
  if (deptFilter) filtered = filtered.filter(e => e.department === deptFilter);
  
  displayEventsList(filtered, container);
}

async function refreshMyEvents() {
  const container = document.getElementById('my-events-list');
  
  try {
    const response = await fetch(`${API_BASE}?createdBy=${currentUser}`);
    const data = await response.json();
    const events = data.events || [];
    displayEventsList(events, container);
  } catch (error) {
    container.innerHTML = `<p class="loading" style="color: red;">Error loading events: ${error.message}</p>`;
  }
}

async function refreshPendingEvents() {
  const container = document.getElementById('pending-events-list');
  
  if (userRole !== 'hod') {
    container.innerHTML = '<p class="loading">Only HOD can access this section</p>';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}?status=pending`);
    const data = await response.json();
    const events = data.events || [];
    displayEventsList(events, container, true);
  } catch (error) {
    container.innerHTML = `<p class="loading" style="color: red;">Error loading events: ${error.message}</p>`;
  }
}

function displayEventsList(events, container, isApprovalView = false) {
  if (events.length === 0) {
    container.innerHTML = '<p class="loading">No events found</p>';
    return;
  }
  
  container.innerHTML = events.map(event => `
    <div class="event-card">
      <h4>${escapeHtml(event.name)}</h4>
      <div class="event-meta">
        <div class="meta-item">
          <strong>Date:</strong>
          <span>${formatDate(event.date)}</span>
        </div>
        <div class="meta-item">
          <strong>Time:</strong>
          <span>${event.startTime} - ${event.endTime}</span>
        </div>
        <div class="meta-item">
          <strong>Venue:</strong>
          <span>${escapeHtml(event.venue)}</span>
        </div>
        <div class="meta-item">
          <strong>Department:</strong>
          <span>${escapeHtml(event.department)}</span>
        </div>
        <div class="meta-item">
          <strong>Created By:</strong>
          <span>${escapeHtml(event.createdBy)}</span>
        </div>
      </div>
      <div class="event-status">
        <span class="status-badge ${event.status}">${event.status}</span>
      </div>
      <button class="btn-small" onclick="openEventDetail('${event.id}')">View Details</button>
    </div>
  `).join('');
}

// ========== MODAL & EVENT DETAILS ==========
function setupModal() {
  const modal = document.getElementById('event-modal');
  const closeBtn = document.querySelector('.modal-close');
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

async function openEventDetail(eventId) {
  const modal = document.getElementById('event-modal');
  
  try {
    const response = await fetch(`${API_BASE}/${eventId}`);
    const data = await response.json();
    const event = data.event;
    const comments = data.comments || [];
    
    // Populate event details
    document.getElementById('modal-event-title').textContent = event.name;
    document.getElementById('modal-date').textContent = formatDate(event.date);
    document.getElementById('modal-time').textContent = `${event.startTime} - ${event.endTime}`;
    document.getElementById('modal-venue').textContent = event.venue;
    document.getElementById('modal-department').textContent = event.department;
    document.getElementById('modal-created-by').textContent = event.createdBy;
    document.getElementById('modal-description').textContent = event.description;
    
    const statusBadge = document.getElementById('modal-status');
    statusBadge.className = `status-badge ${event.status}`;
    statusBadge.textContent = event.status || 'Upcoming';
    
    // Populate attachments
    if (event.poster) document.getElementById('modal-poster-link').href = `${UPLOADS_BASE}/${event.poster}`;
    if (event.venueConfirmation) document.getElementById('modal-venue-conf-link').href = `${UPLOADS_BASE}/${event.venueConfirmation}`;
    if (event.guestConfirmation) document.getElementById('modal-guest-conf-link').href = `${UPLOADS_BASE}/${event.guestConfirmation}`;
    
    // Display comments
    displayComments(comments);
    
    // Setup comment submission
    document.getElementById('add-comment-btn').onclick = () => submitComment(eventId);
    document.getElementById('comment-text').onkeydown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') submitComment(eventId);
    };
    
    // Show approval section only for HOD and pending events
    const approvalSection = document.getElementById('approval-section');
    if (userRole === 'hod' && event.status === 'pending') {
      approvalSection.style.display = 'block';
      document.getElementById('approve-btn').onclick = () => approveEvent(eventId, true);
      document.getElementById('reject-btn').onclick = () => approveEvent(eventId, false);
    } else {
      approvalSection.style.display = 'none';
    }

    // ========== EVENT SUBMISSION WORKFLOW ==========
    // Show status management for approved events
    const statusSection = document.getElementById('event-status-section');
    if (event.status === 'approved') {
      statusSection.style.display = 'block';
      document.getElementById('event-current-status').textContent = event.status || 'Upcoming';
      document.getElementById('mark-completed-btn').style.display = 'inline-block';
      document.getElementById('mark-completed-btn').onclick = () => markEventCompleted(eventId);
    } else {
      statusSection.style.display = 'block';
      document.getElementById('event-current-status').textContent = event.status || 'Upcoming';
      document.getElementById('mark-completed-btn').style.display = event.status === 'approved' && event.createdBy === currentUser ? 'inline-block' : 'none';
    }
    
    // Load and show submission status for completed events
    if (event.status === 'completed' || event.status === 'Completed') {
      await loadSubmissionStatus(eventId, event);
    } else {
      // Hide submission sections for non-completed events
      document.getElementById('submission-status-section').style.display = 'none';
      document.getElementById('event-submission-form-section').style.display = 'none';
      document.getElementById('event-submission-review-section').style.display = 'none';
    }
    
    // Store current event for submission
    modal.dataset.eventId = eventId;
    modal.dataset.eventName = event.name;
    modal.dataset.eventDate = event.date;
    modal.dataset.hostedBy = event.createdBy;
    
    modal.classList.add('active');
  } catch (error) {
    alert('Error loading event: ' + error.message);
  }
}

async function loadSubmissionStatus(eventId, event) {
  try {
    const response = await fetch(`${API_BASE}/${eventId}/submission`);
    const data = await response.json();
    const submission = data.submission;
    const submissionStatus = data.submissionStatus;
    const reportingDeadline = data.reportingDeadline;
    
    // Show submission status section
    document.getElementById('submission-status-section').style.display = 'block';
    document.getElementById('submission-event-date').textContent = formatDate(event.date);
    document.getElementById('submission-deadline').textContent = formatDate(reportingDeadline) + ' (Event Date + 3 days)';
    document.getElementById('submission-hosted-by').textContent = event.createdBy || 'N/A';
    
    // Set submission status badge
    const statusBadge = document.getElementById('submission-status-badge');
    statusBadge.className = `status-badge ${submissionStatus}`;
    statusBadge.textContent = submissionStatus;
    
    // Show submission form only for hosting teacher and if event is completed
    const formSection = document.getElementById('event-submission-form-section');
    if (event.createdBy === currentUser && event.status === 'completed' && submissionStatus !== 'submitted') {
      formSection.style.display = 'block';
      document.getElementById('form-deadline').textContent = formatDate(reportingDeadline);
      setupSubmissionForm(eventId, event);
    } else {
      formSection.style.display = 'none';
    }
    
    // Show submission review section for HOD and Newsletter In-Charge
    const reviewSection = document.getElementById('event-submission-review-section');
    if (submission && (userRole === 'hod' || (userRole === 'teacher' && isNewsletterInCharge()))) {
      reviewSection.style.display = 'block';
      await loadSubmissionFiles(eventId, userRole, currentUser);
    } else {
      reviewSection.style.display = 'none';
    }
  } catch (error) {
    console.error('Error loading submission status:', error);
  }
}

function setupSubmissionForm(eventId, event) {
  const form = document.getElementById('event-submission-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    
    const reportFile = document.getElementById('submission-report-file').files[0];
    const eventPhotos = document.getElementById('submission-event-photos').files;
    const newsletter = document.getElementById('submission-newsletter').files[0];
    const highlight1 = document.getElementById('submission-highlight-1').files[0];
    const highlight2 = document.getElementById('submission-highlight-2').files[0];
    
    if (!reportFile || eventPhotos.length === 0 || !newsletter || !highlight1 || !highlight2) {
      showStatus(document.getElementById('submission-status'), 'Please upload all required files', 'error');
      return;
    }
    
    const formData = new FormData();
    formData.append('hostedByTeacherId', 't_' + currentUser);
    formData.append('hostedByTeacherName', currentUser);
    formData.append('submittedBy', currentUser);
    formData.append('reportFile', reportFile);
    formData.append('newsletter', newsletter);
    formData.append('highlightPhoto1', highlight1);
    formData.append('highlightPhoto2', highlight2);
    
    // Add multiple event photos
    for (let i = 0; i < eventPhotos.length; i++) {
      formData.append('eventPhotos', eventPhotos[i]);
    }
    
    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Uploading...';
      
      const response = await fetch(`${API_BASE}/${eventId}/submit`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.ok) {
        showStatus(document.getElementById('submission-status'), '✓ Event report submitted successfully!', 'success');
        setTimeout(() => {
          openEventDetail(eventId); // Reload to show updated status
        }, 2000);
      } else {
        showStatus(document.getElementById('submission-status'), 'Error: ' + result.error, 'error');
      }
    } catch (error) {
      showStatus(document.getElementById('submission-status'), 'Error: ' + error.message, 'error');
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Event Report';
    }
  };
}

async function loadSubmissionFiles(eventId, userRole, userName) {
  try {
    const response = await fetch(`${API_BASE}/${eventId}/submission/review/${userRole}/${userName}`);
    const data = await response.json();
    const submission = data.submission;
    const files = submission.files;
    
    const container = document.getElementById('submission-files-container');
    const filesHtml = [];
    
    if (files.report_file) {
      filesHtml.push(`
        <div class="submission-file-item">
          <strong>📑 Event Report</strong>
          <a href="http://localhost:3000/api/events/submissions/download/${files.report_file}?userRole=${userRole}&userName=${userName}" target="_blank" class="file-link">Download</a>
        </div>
      `);
    }
    
    if (files.newsletter_file) {
      filesHtml.push(`
        <div class="submission-file-item">
          <strong>📰 Newsletter</strong>
          <a href="http://localhost:3000/api/events/submissions/download/${files.newsletter_file}?userRole=${userRole}&userName=${userName}" target="_blank" class="file-link">Download</a>
        </div>
      `);
    }
    
    if (files.highlight_photo_1) {
      filesHtml.push(`
        <div class="submission-file-item">
          <strong>📸 Highlight Photo 1</strong>
          <a href="http://localhost:3000/api/events/submissions/download/${files.highlight_photo_1}?userRole=${userRole}&userName=${userName}" target="_blank" class="file-link">Download</a>
        </div>
      `);
    }
    
    if (files.highlight_photo_2) {
      filesHtml.push(`
        <div class="submission-file-item">
          <strong>📸 Highlight Photo 2</strong>
          <a href="http://localhost:3000/api/events/submissions/download/${files.highlight_photo_2}?userRole=${userRole}&userName=${userName}" target="_blank" class="file-link">Download</a>
        </div>
      `);
    }
    
    if (userRole === 'HOD' && files.event_photos && files.event_photos.length > 0) {
      filesHtml.push(`
        <div class="submission-file-item">
          <strong>📷 Event Photos (${files.event_photos.length} files)</strong>
          ${files.event_photos.map((photo, idx) => `
            <a href="http://localhost:3000/api/events/submissions/download/${photo}?userRole=${userRole}&userName=${userName}" target="_blank" class="file-link">Photo ${idx + 1}</a>
          `).join(' | ')}
        </div>
      `);
    }
    
    if (filesHtml.length === 0) {
      container.innerHTML = '<p>No files available for download</p>';
    } else {
      container.innerHTML = filesHtml.join('');
    }
  } catch (error) {
    document.getElementById('submission-files-container').innerHTML = `<p style="color: red;">Error loading files: ${error.message}</p>`;
  }
}

async function markEventCompleted(eventId) {
  if (!confirm('Mark this event as completed? A report submission task will be created for the hosting teacher.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${eventId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completedBy: currentUser
      })
    });
    
    const data = await response.json();
    if (data.ok) {
      alert('✓ Event marked as completed! Report submission task has been assigned.');
      openEventDetail(eventId);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

function isNewsletterInCharge() {
  // Check if current user has Newsletter In-Charge role (you might have this info in sessionStorage)
  try {
    const userSession = JSON.parse(sessionStorage.getItem('currentUser'));
    return userSession && userSession.role === 'Newsletter In-Charge';
  } catch (e) {
    return false;
  }
}


function closeModal() {
  const modal = document.getElementById('event-modal');
  modal.classList.remove('active');
  document.getElementById('comment-text').value = '';
}

function displayComments(comments) {
  const container = document.getElementById('comments-list');
  
  if (comments.length === 0) {
    container.innerHTML = '<p style="color: #999; padding: 16px;">No comments yet. Be the first to comment!</p>';
    return;
  }
  
  container.innerHTML = comments.map(comment => `
    <div class="comment">
      <div class="comment-header">
        <div>
          <span class="comment-author">${escapeHtml(comment.author)}</span>
          <span class="comment-role ${comment.role}">${comment.role}</span>
        </div>
        <span class="comment-date">${formatDateTime(comment.createdAt)}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
    </div>
  `).join('');
}

async function submitComment(eventId) {
  const text = document.getElementById('comment-text').value.trim();
  
  if (!text) {
    alert('Please enter a comment');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${eventId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        author: currentUser,
        role: userRole
      })
    });
    
    const data = await response.json();
    if (data.ok) {
      document.getElementById('comment-text').value = '';
      // Reload event details
      openEventDetail(eventId);
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error submitting comment: ' + error.message);
  }
}

async function approveEvent(eventId, approved) {
  if (!confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this event?`)) {
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/${eventId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        approved,
        hodName: currentUser
      })
    });
    
    const data = await response.json();
    if (data.ok) {
      alert(`Event ${approved ? 'approved' : 'rejected'} successfully!`);
      closeModal();
      refreshPendingEvents();
      refreshNotifications();
    } else {
      alert('Error: ' + data.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ========== NOTIFICATIONS ==========
async function refreshNotifications() {
  const container = document.getElementById('notifications-list');
  
  try {
    const response = await fetch(`${API_BASE}/notifications/${currentUser}`);
    const data = await response.json();
    let notifications = data.notifications || [];
    
    // Sort by newest first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update badge
    const unreadCount = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notification-badge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
    
    if (notifications.length === 0) {
      container.innerHTML = '<p class="loading">No notifications</p>';
      return;
    }
    
    container.innerHTML = notifications.map(notif => `
      <div class="notification-item ${notif.read ? '' : 'unread'}" onclick="markNotificationRead('${notif.id}', '${notif.eventId}')">
        <div class="notification-header">
          <span class="notification-type ${getNotificationType(notif.type)}">${notif.type.replace('event_', '')}</span>
          <span class="notification-date">${formatDateTime(notif.createdAt)}</span>
        </div>
        <div class="notification-message">${escapeHtml(notif.message)}</div>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p class="loading" style="color: red;">Error loading notifications: ${error.message}</p>`;
  }
}

function getNotificationType(type) {
  if (type.includes('submitted')) return 'submitted';
  if (type.includes('comment')) return 'comment';
  if (type.includes('approved')) return 'approved';
  if (type.includes('rejected')) return 'rejected';
  if (type.includes('notification')) return 'approved';
  return 'submitted';
}

async function markNotificationRead(notificationId, eventId) {
  try {
    await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    if (eventId) {
      openEventDetail(eventId);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// ========== UTILITY FUNCTIONS ==========
function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status-message ${type}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
