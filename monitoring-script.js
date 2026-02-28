// ==================== MONITORING TAB FUNCTIONALITY ====================

// Global variables for monitoring
let allAssignments = [];
let filteredAssignments = [];

// Initialize monitoring when tab is clicked
function initMonitoring() {
    loadAssignmentsForMonitoring();
    
    // Set up filter event listeners
    document.getElementById('monitor-filter-type')?.addEventListener('change', filterAssignments);
    document.getElementById('monitor-filter-status')?.addEventListener('change', filterAssignments);
    document.getElementById('monitor-search')?.addEventListener('input', filterAssignments);
}

// Load assignments from API
async function loadAssignmentsForMonitoring() {
    try {
        const response = await fetch('/api/monitoring/assignments');
        const data = await response.json();
        
        if (data.ok) {
            allAssignments = data.assignments || [];
            updateStats();
            filterAssignments();
        } else {
            console.error('Error loading assignments:', data.error);
            // Try alternate endpoint
            loadAssignmentsWithFallback();
        }
    } catch (error) {
        console.error('Error loading assignments:', error);
        loadAssignmentsWithFallback();
    }
}

// Fallback to load from /api/assignments endpoint
async function loadAssignmentsWithFallback() {
    try {
        const response = await fetch('/api/local/assignments');
        const data = await response.json();
        
        if (data.ok && data.assignments) {
            // Transform to monitoring format
            const submissions = await fetchSubmissions();
            allAssignments = data.assignments.map(assignment => {
                const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
                const totalStudents = assignment.assignedStudents ? assignment.assignedStudents.length : 0;
                const submittedCount = assignmentSubmissions.length;
                const reviewedCount = assignmentSubmissions.filter(s => s.status === 'Reviewed').length;
                
                const now = new Date();
                const dueDate = new Date(assignment.dueDate);
                let status = 'Active';
                if (now > dueDate) {
                    status = 'Overdue';
                }
                
                return {
                    id: assignment.id,
                    title: assignment.title,
                    type: assignment.type || 'regular',
                    totalStudents,
                    submittedCount,
                    reviewedCount,
                    pendingCount: submittedCount - reviewedCount,
                    notSubmittedCount: totalStudents - submittedCount,
                    dueDate: assignment.dueDate,
                    status,
                    progress: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0,
                    description: assignment.description,
                    maxMarks: assignment.maxMarks,
                    token: assignment.token,
                    assignedStudents: assignment.assignedStudents || []
                };
            });
            
            updateStats();
            filterAssignments();
        }
    } catch (error) {
        console.error('Fallback also failed:', error);
    }
}

// Fetch submissions from API
async function fetchSubmissions() {
    try {
        const response = await fetch('/api/local/submissions');
        const data = await response.json();
        return data.submissions || [];
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
}

// Sample assignments for demo purposes
function getSampleAssignments() {
    return [
        {
            id: 'asgn-proactive-001',
            token: 'asgn_a1b2c3d4',
            title: 'Research Paper on AI Ethics',
            type: 'proactive',
            subType: 'research-paper',
            dueDate: '2025-02-15',
            maxMarks: 100,
            description: 'Write a comprehensive research paper on the ethical implications of Artificial Intelligence.',
            totalStudentsAssigned: 4,
            submissionsReceived: 2,
            pendingSubmissions: 2,
            reviewedCount: 0,
            status: 'active'
        },
        {
            id: 'asgn-proactive-002',
            token: 'asgn_e5f6g7h8',
            title: 'Hackathon – Smart Campus Solution',
            type: 'proactive',
            subType: 'hackathon',
            dueDate: '2025-02-28',
            maxMarks: 100,
            description: 'Participate in a 48-hour hackathon to develop innovative solutions for a smart campus.',
            totalStudentsAssigned: 4,
            submissionsReceived: 1,
            pendingSubmissions: 3,
            reviewedCount: 0,
            status: 'active'
        },
        {
            id: 'asgn-proactive-003',
            token: 'asgn_i9j0k1l2',
            title: 'Technical Workshop – Full Stack Development',
            type: 'proactive',
            subType: 'workshop',
            dueDate: '2025-03-10',
            maxMarks: 100,
            description: 'Attend and complete a 5-day intensive workshop on Full Stack Development.',
            totalStudentsAssigned: 4,
            submissionsReceived: 0,
            pendingSubmissions: 4,
            reviewedCount: 0,
            status: 'active'
        },
        {
            id: 'asgn-proactive-004',
            token: 'asgn_m3n4o5p6',
            title: 'Mini Project – Inventory Management System',
            type: 'proactive',
            subType: 'mini-project',
            dueDate: '2025-03-20',
            maxMarks: 100,
            description: 'Develop a complete Inventory Management System with features for stock tracking.',
            totalStudentsAssigned: 5,
            submissionsReceived: 1,
            pendingSubmissions: 4,
            reviewedCount: 0,
            status: 'active'
        },
        {
            id: 'asgn-reactive-001',
            token: 'asgn_q7r8s9t0',
            title: 'Remedial Assignment – Data Structures Basics',
            type: 'reactive',
            subType: 'remedial',
            dueDate: '2025-02-10',
            maxMarks: 50,
            description: 'Complete this remedial assignment covering fundamental Data Structures concepts.',
            totalStudentsAssigned: 2,
            submissionsReceived: 1,
            pendingSubmissions: 1,
            reviewedCount: 0,
            status: 'active'
        },
        {
            id: 'asgn-reactive-002',
            token: 'asgn_u1v2w3x4',
            title: 'Re-test – Operating Systems Unit 1',
            type: 'reactive',
            subType: 'retest',
            dueDate: '2025-02-05',
            maxMarks: 30,
            description: 'Re-test for Operating Systems Unit 1 covering Process Management.',
            totalStudentsAssigned: 3,
            submissionsReceived: 0,
            pendingSubmissions: 3,
            reviewedCount: 0,
            status: 'overdue'
        },
        {
            id: 'asgn-reactive-003',
            token: 'asgn_y5z6a7b8',
            title: 'Basic Coding Practice – Loops & Functions',
            type: 'reactive',
            subType: 'basic-coding',
            dueDate: '2025-02-12',
            maxMarks: 30,
            description: 'Practice basic coding problems focusing on loops and functions.',
            totalStudentsAssigned: 2,
            submissionsReceived: 2,
            pendingSubmissions: 0,
            reviewedCount: 1,
            status: 'active'
        },
        {
            id: 'asgn-reactive-004',
            token: 'asgn_c9d0e1f2',
            title: 'Seminar – Introduction to DBMS',
            type: 'reactive',
            subType: 'seminar',
            dueDate: '2025-02-20',
            maxMarks: 25,
            description: 'Prepare and deliver a 10-minute seminar on Introduction to DBMS.',
            totalStudentsAssigned: 2,
            submissionsReceived: 0,
            pendingSubmissions: 2,
            reviewedCount: 0,
            status: 'active'
        }
    ];
}

// Update statistics cards
function updateStats() {
    const total = allAssignments.length;
    const active = allAssignments.filter(a => a.status === 'Active').length;
    const overdue = allAssignments.filter(a => a.status === 'Overdue').length;
    const submissions = allAssignments.reduce((sum, a) => sum + (a.submittedCount || 0), 0);
    
    document.getElementById('monitor-total').textContent = total;
    document.getElementById('monitor-active').textContent = active;
    document.getElementById('monitor-overdue').textContent = overdue;
    document.getElementById('monitor-submissions').textContent = submissions;
}

// Filter assignments based on user selection
function filterAssignments() {
    const typeFilter = document.getElementById('monitor-filter-type')?.value || '';
    const statusFilter = document.getElementById('monitor-filter-status')?.value || '';
    const searchTerm = document.getElementById('monitor-search')?.value.toLowerCase() || '';
    
    filteredAssignments = allAssignments.filter(assignment => {
        // Type filter
        if (typeFilter && assignment.type !== typeFilter) return false;
        
        // Status filter - handle both 'active'/'overdue' and 'Active'/'Overdue'
        if (statusFilter) {
            const normalizedFilter = statusFilter.toLowerCase();
            const normalizedStatus = assignment.status.toLowerCase();
            if (normalizedStatus !== normalizedFilter) return false;
        }
        
        // Search filter
        if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm)) return false;
        
        return true;
    });
    
    renderAssignmentsTable();
}

// Render the assignments table
function renderAssignmentsTable() {
    const tbody = document.getElementById('monitoring-tbody');
    if (!tbody) return;
    
    if (filteredAssignments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="padding: 40px; text-align: center; color: #666;">
                    No assignments found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredAssignments.map(assignment => {
        const typeLabel = assignment.type === 'proactive' ? '🔵 Proactive' : '🔴 Reactive';
        const typeColor = assignment.type === 'proactive' ? '#d4edda' : '#f8d7da';
        const typeTextColor = assignment.type === 'proactive' ? '#155724' : '#721c24';
        
        const statusLabel = assignment.status === 'Overdue' ? '🔴 Overdue' : '🟢 Active';
        const statusColor = assignment.status === 'Overdue' ? '#f8d7da' : '#d4edda';
        const statusTextColor = assignment.status === 'Overdue' ? '#721c24' : '#155724';
        
        const deadline = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No deadline';
        
        // Calculate progress percentage
        const progress = assignment.progress || 0;
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px;">
                    <strong>${assignment.title}</strong>
                    <div style="font-size: 11px; color: #999; margin-top: 2px;">ID: ${assignment.id.substring(0, 12)}...</div>
                </td>
                <td style="padding: 12px;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${typeColor}; color: ${typeTextColor};">
                        ${typeLabel}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center; font-weight: 600;">${assignment.totalStudents}</td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <div style="width: 50px; height: 6px; background: #e9ecef; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${progress}%; height: 100%; background: #28a745;"></div>
                        </div>
                        <span style="font-weight: 600; color: #28a745;">${assignment.submittedCount}</span>
                    </div>
                    <div style="font-size: 10px; color: #666; margin-top: 2px;">${progress}%</div>
                </td>
                <td style="padding: 12px; text-align: center; font-weight: 600; color: #dc3545;">${assignment.pendingCount}</td>
                <td style="padding: 12px; white-space: nowrap;">${deadline}</td>
                <td style="padding: 12px; text-align: center;">
                    <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${statusColor}; color: ${statusTextColor};">
                        ${statusLabel}
                    </span>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <button onclick="viewAssignmentDetails('${assignment.id}')" style="padding: 6px 12px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600;">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// View assignment details
async function viewAssignmentDetails(assignmentId) {
    const assignment = allAssignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    try {
        // Get detailed data from API
        const response = await fetch(`/api/monitoring/assignments/${assignmentId}`);
        const data = await response.json();
        
        if (!data.ok) {
            console.error('Error loading details:', data.error);
            return;
        }
        
        const detailedAssignment = data.assignment;
        const studentDetails = data.studentDetails;
        
        // Update modal content
        document.getElementById('modal-assignment-title').textContent = detailedAssignment.title;
        document.getElementById('modal-type').textContent = detailedAssignment.type === 'proactive' ? 'Proactive' : 'Reactive';
        document.getElementById('modal-marks').textContent = detailedAssignment.maxMarks || 'N/A';
        document.getElementById('modal-deadline').textContent = detailedAssignment.dueDate ? new Date(detailedAssignment.dueDate).toLocaleDateString() : 'No deadline';
        
        const now = new Date();
        const dueDate = new Date(detailedAssignment.dueDate);
        const statusText = now > dueDate ? 'Overdue' : 'Active';
        const statusColor = now > dueDate ? '#dc3545' : '#28a745';
        document.getElementById('modal-status').innerHTML = `<span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>`;
        document.getElementById('modal-description').textContent = detailedAssignment.description || 'No description';
        
        // Generate shareable link
        const baseUrl = window.location.origin;
        const shareLink = `${baseUrl}/assignment.html?token=${detailedAssignment.token}`;
        document.getElementById('modal-link').innerHTML = `<code style="background: #f0f0f0; padding: 4px 8px; border-radius: 3px; word-break: break-all;">${shareLink}</code>`;
        
        // Render submissions
        renderSubmissionsForAssignment(studentDetails, detailedAssignment.maxMarks);
        
        // Show modal
        document.getElementById('assignment-details-modal').style.display = 'block';
    } catch (error) {
        console.error('Error viewing details:', error);
        alert('Error loading assignment details');
    }
}

// Render submissions for an assignment
function renderSubmissionsForAssignment(studentDetails, maxMarks) {
    const tbody = document.getElementById('submissions-tbody');
    if (!tbody) return;
    
    if (studentDetails.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #666;">
                    No student details available.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = studentDetails.map(student => {
        const statusClass = student.status === 'Reviewed' ? 'reviewed' : (student.status === 'Submitted' ? 'submitted' : 'not-started');
        const statusColor = student.status === 'Reviewed' ? '#d4edda' : (student.status === 'Submitted' ? '#fff3cd' : '#f0f0f0');
        const statusTextColor = student.status === 'Reviewed' ? '#155724' : (student.status === 'Submitted' ? '#856404' : '#495057');
        
        const submittedAt = student.submissionTimestamp ? new Date(student.submissionTimestamp).toLocaleString('en-IN') : '-';
        
        let submissionInfo = '-';
        if (student.filePath) {
            submissionInfo = `<a href="/${student.filePath}" target="_blank" style="color: var(--christ-blue);">📥 Download</a>`;
        } else if (student.linkResponse) {
            submissionInfo = `<a href="${student.linkResponse}" target="_blank" style="color: var(--christ-blue);">🔗 Link</a>`;
        }
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px; font-weight: 600;">
                    ${student.name}
                </td>
                <td style="padding: 10px; color: #666; font-size: 12px;">${student.email}</td>
                <td style="padding: 10px;">${submissionInfo}</td>
                <td style="padding: 10px; font-size: 12px;">${submittedAt}</td>
                <td style="padding: 10px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background: ${statusColor}; color: ${statusTextColor};">
                        ${student.status === 'Reviewed' ? '✓ Reviewed' : (student.status === 'Submitted' ? '⏳ Waiting' : '○ Not Started')}
                    </span>
                </td>
                <td style="padding: 10px; text-align: center; font-weight: 600;">
                    ${student.marks !== null ? `${student.marks}/${maxMarks || 'N/A'}` : '<span style="color: #999;">-</span>'}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <button onclick="reviewSubmissionAPI('${student.submissionId}', '${student.name}')" style="padding: 4px 8px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
                        ${student.marks !== null ? 'Edit' : 'Review'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Sample submissions
function getSampleSubmissions(assignmentId) {
    const submissionsMap = {
        'asgn-proactive-001': [
            { id: 'sub-001', studentName: 'Rahul Singh', studentEmail: 'rahul.singh@christuniversity.in', submissionType: 'file', fileName: 'AI_Ethics_Research_Paper.pdf', submittedAt: '2025-02-10T14:30:00.000Z', status: 'Submitted', marks: null, feedback: null },
            { id: 'sub-002', studentName: 'Anjali Verma', studentEmail: 'anjali.verma@christuniversity.in', submissionType: 'file', fileName: 'AI_Ethics_Anjali.pdf', submittedAt: '2025-02-12T09:15:00.000Z', status: 'Submitted', marks: null, feedback: null }
        ],
        'asgn-proactive-002': [
            { id: 'sub-003', studentName: 'Arjun Sharma', studentEmail: 'arjun.sharma@christuniversity.in', submissionType: 'link', linkResponse: 'https://github.com/arjunhacks/smart-campus-app', submittedAt: '2025-02-27T23:45:00.000Z', status: 'Submitted', marks: null, feedback: null }
        ],
        'asgn-reactive-001': [
            { id: 'sub-005', studentName: 'Vikas Kumar', studentEmail: 'vikas.kumar@christuniversity.in', submissionType: 'file', fileName: 'Data_Structures_Basics_Answers.pdf', submittedAt: '2025-02-08T11:00:00.000Z', status: 'Submitted', marks: null, feedback: null }
        ],
        'asgn-reactive-003': [
            { id: 'sub-006', studentName: 'Neha Patel', studentEmail: 'neha.patel@christuniversity.in', submissionType: 'file', fileName: 'Loops_Functions_Practice.c', submittedAt: '2025-02-11T15:30:00.000Z', status: 'Reviewed', marks: 25, feedback: 'Good work! However, you could improve on the recursive function implementation.' },
            { id: 'sub-007', studentName: 'Mohammad Ali', studentEmail: 'mohammad.ali@christuniversity.in', submissionType: 'text', textResponse: '1. Sum of digits using while loop...\n2. Fibonacci series using for loop...', submittedAt: '2025-02-10T20:00:00.000Z', status: 'Submitted', marks: null, feedback: null }
        ]
    };
    
    return submissionsMap[assignmentId] || [];
}

// Render submissions in modal
function renderSubmissions(submissions, maxMarks) {
    const tbody = document.getElementById('submissions-tbody');
    if (!tbody) return;
    
    if (submissions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="padding: 40px; text-align: center; color: #666;">
                    No submissions yet.
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = submissions.map(sub => {
        const submittedAt = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '-';
        const statusClass = sub.status === 'Reviewed' ? 'reviewed' : 'submitted';
        
        let submissionInfo = '';
        if (sub.submissionType === 'file' && sub.fileName) {
            submissionInfo = `<a href="/uploads/${sub.filePath || ''}" target="_blank">${sub.fileName}</a>`;
        } else if (sub.submissionType === 'link' && sub.linkResponse) {
            submissionInfo = `<a href="${sub.linkResponse}" target="_blank">${sub.linkResponse}</a>`;
        } else if (sub.submissionType === 'text' && sub.textResponse) {
            submissionInfo = `<span style="cursor: pointer; color: var(--christ-blue);" onclick="alert('${sub.textResponse.replace(/'/g, "\\'").substring(0, 100)}...')">View Text Response</span>`;
        }
        
        return `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <strong>${sub.studentName}</strong>
                </td>
                <td style="padding: 10px; color: #666;">${sub.studentEmail}</td>
                <td style="padding: 10px;">${submissionInfo}</td>
                <td style="padding: 10px; font-size: 12px;">${submittedAt}</td>
                <td style="padding: 10px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; background: ${sub.status === 'Reviewed' ? '#d4edda' : '#fff3cd'}; color: ${sub.status === 'Reviewed' ? '#155724' : '#856404'};">
                        ${sub.status}
                    </span>
                </td>
                <td style="padding: 10px; text-align: center;">
                    ${sub.marks !== null ? `<strong>${sub.marks}</strong>/${maxMarks}` : '<span style="color: #999;">-</span>'}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <button onclick="reviewSubmission('${sub.id}')" style="padding: 4px 8px; background: var(--christ-blue); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">
                        ${sub.status === 'Reviewed' ? 'Edit Review' : 'Review'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Close assignment modal
function closeAssignmentModal() {
    document.getElementById('assignment-details-modal').style.display = 'none';
}

// Review submission via API
async function reviewSubmissionAPI(submissionId, studentName) {
    if (!submissionId) {
        alert('Cannot review this submission (no submission ID)');
        return;
    }
    
    const marks = prompt(`Enter marks for ${studentName}:`, '0');
    if (marks === null) return;
    
    const feedback = prompt(`Enter feedback for ${studentName} (optional):`, '');
    
    try {
        const response = await fetch(`/api/monitoring/submissions/${submissionId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                marks: parseInt(marks),
                feedback: feedback || '',
                status: 'Reviewed'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            alert('Submission reviewed successfully!');
            // Reload monitoring data
            loadAssignmentsForMonitoring();
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Error submitting review: ' + error.message);
    }
}

// Handle tab switching for monitoring
function setupMonitoringTab() {
    const tabButtons = document.querySelectorAll('#subject-view-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.getAttribute('data-view');
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide content
            document.getElementById('performance-content-wrapper').style.display = view === 'performance' ? 'block' : 'none';
            document.getElementById('classroom-content-wrapper').style.display = view === 'classroom' ? 'block' : 'none';
            document.getElementById('monitoring-content-wrapper').style.display = view === 'monitoring' ? 'block' : 'none';
            
            // Initialize monitoring if selected
            if (view === 'monitoring') {
                initMonitoring();
            }
        });
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    setupMonitoringTab();
});
