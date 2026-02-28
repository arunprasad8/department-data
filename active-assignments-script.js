// ==================== ACTIVE ASSIGNMENTS FUNCTIONALITY ====================

let allActiveAssignments = [];
let filteredActiveAssignments = [];

/**
 * Initialize Active Assignments section when page loads
 */
function initActiveAssignments() {
    loadActiveAssignments();
}

/**
 * Load all active assignments from API
 */
async function loadActiveAssignments() {
    try {
        console.log('📋 Loading active assignments from monitoring API...');
        const response = await fetch('/api/monitoring/assignments');
        const data = await response.json();
        
        if (data.ok && data.assignments && data.assignments.length > 0) {
            // Filter only published, not expired, not closed assignments
            const now = new Date();
            allActiveAssignments = data.assignments.filter(assignment => {
                const dueDate = new Date(assignment.dueDate);
                const isNotExpired = dueDate >= now;
                const isNotClosed = assignment.status !== 'closed';
                return isNotExpired && isNotClosed;
            });
            
            if (allActiveAssignments.length > 0) {
                console.log(`✅ Loaded ${allActiveAssignments.length} active assignments`);
                renderActiveAssignmentCards();
                return;
            }
        }
        
        console.warn('⚠️ Monitoring API returned empty or invalid data, using fallback...');
        loadActiveAssignmentsWithFallback();
    } catch (error) {
        console.error('❌ Error loading active assignments:', error);
        loadActiveAssignmentsWithFallback();
    }
}

/**
 * Fallback: Load from local API endpoint
 */
async function loadActiveAssignmentsWithFallback() {
    try {
        console.log('🔄 Fallback: Loading assignments from /api/local/assignments...');
        const response = await fetch('/api/local/assignments');
        const data = await response.json();
        
        console.log('📦 Fallback response:', data);
        
        // Handle both array and object with .assignments property
        let assignmentsToProcess = Array.isArray(data) ? data : (data.assignments || []);
        
        if (assignmentsToProcess.length === 0) {
            console.warn('⚠️ No assignments in fallback response');
            allActiveAssignments = [];
            renderActiveAssignmentCards();
            return;
        }
        
        const submissions = await fetchSubmissionsForFallback();
        const now = new Date();
        
        // Process assignments with minimal filtering
        allActiveAssignments = assignmentsToProcess
            .filter(a => {
                // Accept assignments from last 90 days OR assignments with pending submissions
                if (!a.dueDate) return true; // Include if no due date
                const dueDate = new Date(a.dueDate);
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                return dueDate >= ninetyDaysAgo;
            })
            .map(assignment => {
                const assignmentSubmissions = submissions.filter(s => 
                    s.assignmentId === assignment.id || 
                    s.assignmentId === assignment.assignmentId
                );
                const totalStudents = assignment.assignedStudents ? assignment.assignedStudents.length : 0;
                const submittedCount = assignmentSubmissions.length;
                const reviewedCount = assignmentSubmissions.filter(s => s.status === 'Reviewed').length;
                
                const dueDate = new Date(assignment.dueDate);
                let status = 'Active';
                if (now > dueDate && assignment.dueDate) status = 'Overdue';
                
                return {
                    id: assignment.id || assignment.assignmentId,
                    title: assignment.title || assignment.assignmentTitle,
                    type: assignment.type || 'regular',
                    status,
                    dueDate: assignment.dueDate,
                    maxMarks: assignment.maxMarks,
                    token: assignment.token,
                    totalStudents,
                    submittedCount,
                    reviewedCount,
                    description: assignment.description,
                    assignedStudents: assignment.assignedStudents || []
                };
            });
        
        console.log(`✅ Processed ${allActiveAssignments.length} assignments from fallback`);
        renderActiveAssignmentCards();
    } catch (error) {
        console.error('❌ Fallback load failed:', error);
        allActiveAssignments = [];
        renderActiveAssignmentCards();
    }
}

/**
 * Fetch submissions for fallback
 */
async function fetchSubmissionsForFallback() {
    try {
        const response = await fetch('/api/local/submissions');
        const data = await response.json();
        return data.submissions || [];
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
}

/**
 * Render assignment cards in grid layout
 */
function renderActiveAssignmentCards() {
    const container = document.getElementById('active-assignment-cards-container');
    if (!container) return;
    
    if (allActiveAssignments.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #999; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 12px;">📭</div>
                <div>No active assignments yet. Create one to get started!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allActiveAssignments.map(assignment => {
        const deadline = new Date(assignment.dueDate);
        const formattedDeadline = deadline.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        
        const statusBadgeColor = assignment.status === 'Overdue' ? '#ff6b6b' : '#28a745';
        const typeEmoji = assignment.type === 'proactive' ? '🔵' : '🔴';
        const typeText = assignment.type === 'proactive' ? 'Proactive' : 'Reactive';
        
        const submissionProgress = assignment.totalStudents > 0 
            ? Math.round((assignment.submittedCount / assignment.totalStudents) * 100)
            : 0;
        
        const submissionLink = `${window.location.origin}/student-submission.html?token=${assignment.token}`;
        
        return `
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s, box-shadow 0.2s;">
                <!-- Card Header -->
                <div style="background: linear-gradient(135deg, ${assignment.type === 'proactive' ? '#667eea' : '#f5576c'} 0%, ${assignment.type === 'proactive' ? '#764ba2' : '#fd7272'} 100%); color: white; padding: 16px; display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${typeEmoji} ${typeText}</div>
                        <h3 style="margin: 0; font-size: 18px; color: white;">${assignment.title}</h3>
                    </div>
                    <div style="background: ${statusBadgeColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; white-space: nowrap; margin-left: 12px;">
                        ${assignment.status === 'Overdue' ? '⚠️ Overdue' : '✓ Active'}
                    </div>
                </div>
                
                <!-- Card Body -->
                <div style="padding: 16px;">
                    <!-- Key Info Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Assigned To</div>
                            <div style="font-weight: 600; color: var(--christ-blue);">${assignment.totalStudents} Students</div>
                        </div>
                        <div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Deadline</div>
                            <div style="font-weight: 600; color: var(--christ-blue);">${formattedDeadline}</div>
                        </div>
                    </div>
                    
                    <!-- Submission Progress -->
                    <div style="margin-bottom: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <div style="font-size: 12px; font-weight: 600; color: var(--christ-blue);">Submission Progress</div>
                            <div style="font-size: 12px; color: #666;">${assignment.submittedCount} / ${assignment.totalStudents} Submitted</div>
                        </div>
                        <div style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                            <div style="height: 100%; background: linear-gradient(90deg, #11998e 0%, #38ef7d 100%); width: ${submissionProgress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="font-size: 11px; color: #999; margin-top: 4px;">${submissionProgress}% Complete</div>
                    </div>
                    
                    <!-- Submission Link -->
                    <div style="margin-bottom: 16px; padding: 12px; background: #f0f7ff; border-radius: 4px; border-left: 3px solid var(--christ-blue);">
                        <div style="font-size: 11px; color: #666; margin-bottom: 6px;">📎 Student Submission Link</div>
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                            <input type="text" readonly value="${submissionLink}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 11px; background: white; color: var(--christ-blue);">
                            <button onclick="copyToClipboard('${submissionLink}')" style="padding: 8px 12px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; white-space: nowrap;">
                                📋 Copy
                            </button>
                        </div>
                        <button onclick="window.open('${submissionLink}', '_blank')" style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; white-space: nowrap;">
                            👉 Test Link / Open for Students
                        </button>
                    </div>
                    
                    <!-- Description Preview -->
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--christ-blue); margin-bottom: 6px;">Description</div>
                        <div style="font-size: 13px; color: #666; line-height: 1.4; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                            ${assignment.description || 'No description provided.'}
                        </div>
                    </div>
                    
                    <!-- Action Button -->
                    <button onclick="viewAssignmentDetails('${assignment.id}')" style="width: 100%; padding: 12px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; transition: background 0.2s;">
                        👁️ View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✓ Submission link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy link. Please copy manually from the input field.');
    });
}

/**
 * View assignment details modal
 */
async function viewAssignmentDetails(assignmentId) {
    try {
        const response = await fetch(`/api/monitoring/assignments/${assignmentId}`);
        const data = await response.json();
        
        if (data.ok) {
            displayAssignmentDetailsModal(data.assignment, data.studentDetails);
        } else {
            alert('Error loading assignment details: ' + data.error);
        }
    } catch (error) {
        console.error('Error loading assignment details:', error);
        alert('Error loading assignment details. Please try again.');
    }
}

/**
 * Display assignment details in modal
 */
function displayAssignmentDetailsModal(assignment, studentDetails) {
    const modal = document.getElementById('assignment-details-modal');
    if (!modal) return;
    
    // Update header
    document.getElementById('modal-assignment-title').textContent = assignment.title;
    
    // Update info section
    const typeEmoji = assignment.type === 'proactive' ? '🔵' : '🔴';
    const typeText = assignment.type === 'proactive' ? 'Proactive' : 'Reactive';
    document.getElementById('modal-type').innerHTML = `${typeEmoji} ${typeText}`;
    document.getElementById('modal-marks').textContent = assignment.maxMarks || '100';
    
    const deadline = new Date(assignment.dueDate);
    const formattedDeadline = deadline.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('modal-deadline').textContent = formattedDeadline;
    
    const now = new Date();
    const status = now > deadline ? '⚠️ Overdue' : '✓ Active';
    document.getElementById('modal-status').textContent = status;
    document.getElementById('modal-description').textContent = assignment.description || 'No description provided.';
    
    // Submission link
    const submissionLink = `${window.location.origin}/student-submission.html?token=${assignment.token}`;
    document.getElementById('modal-link').innerHTML = `
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" readonly value="${submissionLink}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <button onclick="copyToClipboard('${submissionLink}')" style="padding: 8px 12px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer;">
                📋 Copy
            </button>
        </div>
        <button onclick="window.open('${submissionLink}', '_blank')" style="width: 100%; padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
            👉 Test Link / Open for Students
        </button>
    `;
    
    // Update student submissions table
    renderStudentSubmissionsTable(studentDetails, assignment.id);
    
    // Show modal
    modal.style.display = 'block';
}

/**
 * Render student submissions in table format
 */
function renderStudentSubmissionsTable(studentDetails, assignmentId) {
    const tbody = document.getElementById('submissions-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = studentDetails.map(student => {
        let submissionCell = '-';
        let submittedAtCell = '-';
        let statusBadge = '<span style="background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Not Started</span>';
        let marksCell = '-';
        let actionButton = '-';
        
        if (student.status === 'Not Started') {
            statusBadge = '<span style="background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Not Started</span>';
        } else if (student.status === 'Submitted') {
            statusBadge = '<span style="background: #ffc107; color: #333; padding: 4px 8px; border-radius: 4px; font-size: 12px;">⏳ Waiting</span>';
            
            if (student.fileName) {
                submissionCell = `<a href="${student.filePath}" download="${student.fileName}" style="color: var(--christ-blue); text-decoration: none;">📥 ${student.fileName}</a>`;
            } else if (student.linkResponse) {
                submissionCell = `<a href="${student.linkResponse}" target="_blank" style="color: var(--christ-blue); text-decoration: none;">🔗 View Link</a>`;
            } else {
                submissionCell = '<span style="color: #666;">Text submission</span>';
            }
            
            if (student.submissionTimestamp) {
                const submittedDate = new Date(student.submissionTimestamp);
                submittedAtCell = submittedDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            actionButton = `<button onclick="reviewStudentSubmission('${student.submissionId}', '${student.name}')" style="padding: 6px 12px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">📝 Review</button>`;
        } else if (student.status === 'Reviewed') {
            statusBadge = '<span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">✓ Reviewed</span>';
            
            if (student.fileName) {
                submissionCell = `<a href="${student.filePath}" download="${student.fileName}" style="color: var(--christ-blue); text-decoration: none;">📥 ${student.fileName}</a>`;
            } else if (student.linkResponse) {
                submissionCell = `<a href="${student.linkResponse}" target="_blank" style="color: var(--christ-blue); text-decoration: none;">🔗 View Link</a>`;
            } else {
                submissionCell = '<span style="color: #666;">Text submission</span>';
            }
            
            if (student.submissionTimestamp) {
                const submittedDate = new Date(student.submissionTimestamp);
                submittedAtCell = submittedDate.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            marksCell = `<strong style="color: #28a745;">${student.marks}/${100}</strong>`;
            actionButton = `<button onclick="reviewStudentSubmission('${student.submissionId}', '${student.name}')" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">📝 Edit</button>`;
        }
        
        return `
            <tr style="border-bottom: 1px solid #eee; hover {background: #f8f9fa;}">
                <td style="padding: 10px; text-align: left;">${student.name}</td>
                <td style="padding: 10px; text-align: left;">${student.email}</td>
                <td style="padding: 10px; text-align: left; word-break: break-all;">${submissionCell}</td>
                <td style="padding: 10px; text-align: left;">${submittedAtCell}</td>
                <td style="padding: 10px; text-align: center;">${statusBadge}</td>
                <td style="padding: 10px; text-align: center;">${marksCell}</td>
                <td style="padding: 10px; text-align: center;">${actionButton}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Review student submission - open review form
 */
function reviewStudentSubmission(submissionId, studentName) {
    const marks = prompt(`Enter marks for ${studentName} (0-100):`);
    if (marks === null) return;
    
    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
        alert('Please enter a valid number between 0-100');
        return;
    }
    
    const feedback = prompt(`Enter feedback for ${studentName}:`);
    if (feedback === null) return;
    
    submitReview(submissionId, marksNum, feedback);
}

/**
 * Submit review via API
 */
async function submitReview(submissionId, marks, feedback) {
    try {
        const response = await fetch(`/api/monitoring/submissions/${submissionId}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                marks,
                feedback,
                status: 'Reviewed'
            })
        });
        
        const data = await response.json();
        if (data.ok) {
            alert('✓ Review submitted successfully!');
            // Reload the assignment details
            const assignmentId = data.submission?.assignmentId;
            if (assignmentId) {
                viewAssignmentDetails(assignmentId);
            }
        } else {
            alert('Error submitting review: ' + data.error);
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review. Please try again.');
    }
}

/**
 * Close assignment details modal
 */
function closeAssignmentModal() {
    const modal = document.getElementById('assignment-details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Show no assignments message
 */
function showNoAssignmentsMessage() {
    const container = document.getElementById('active-assignment-cards-container');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: #999; background: #f8f9fa; border-radius: 8px;">
                <div style="font-size: 48px; margin-bottom: 12px;">⚠️</div>
                <div>Unable to load assignments. Please refresh the page.</div>
            </div>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initActiveAssignments);

// Auto-refresh assignments every 30 seconds
setInterval(loadActiveAssignments, 30000);
