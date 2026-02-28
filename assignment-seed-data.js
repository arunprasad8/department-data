/**
 * Assignment Seed Data Generator
 * Creates 6-8 sample assignments with auto-classified students
 * and realistic deadlines
 */

/**
 * Generate seed assignments with auto-allocated students
 * @param {Object} classifiedData - Pre-classified student data
 * @param {string} teacherId - ID of the teacher creating assignments
 * @returns {Array} Array of seed assignment objects
 */
async function generateSeedAssignments(classifiedData, teacherId = 'teacher_john') {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 7); // Start from next week
    
    const sampleAssignments = [
        // ========== PROACTIVE ASSIGNMENTS ==========
        {
            id: 'asgn-proactive-research-001',
            title: 'Research Paper – Artificial Intelligence Ethics',
            description: 'Write a comprehensive research paper on the ethical implications of AI in modern society, including case studies and recommendations.',
            type: 'proactive',
            subType: 'research-paper',
            dueDate: addDays(baseDate, 21),
            maxMarks: 100,
            createdBy: teacherId,
            classId: 'proactive-class-001',
            dynamicFields: {
                wordCount: '3000-4000 words',
                format: 'APA',
                minReferences: 10,
                plagiarismLimit: '10%',
                components: ['Introduction', 'Literature Review', 'Analysis', 'Recommendations', 'Conclusion']
            }
        },
        {
            id: 'asgn-proactive-hackathon-001',
            title: 'Hackathon – Smart Campus App Development',
            description: 'Develop an innovative smart campus application. Work in teams to create a functional prototype with documentation and demo video.',
            type: 'proactive',
            subType: 'hackathon',
            dueDate: addDays(baseDate, 28),
            maxMarks: 150,
            createdBy: teacherId,
            classId: 'proactive-class-001',
            dynamicFields: {
                teamSize: '2-3 students',
                duration: '3 weeks',
                phases: ['Ideation', 'Design', 'Development', 'Testing', 'Demo'],
                deliverables: ['GitHub Repository', 'Prototype', 'Documentation', 'Demo Video'],
                technologies: 'Open choice (Web/Mobile/IoT)'
            }
        },
        {
            id: 'asgn-proactive-mini-project-001',
            title: 'Mini Project – Complete E-Commerce Platform',
            description: 'Build a fully functional e-commerce system with user authentication, product catalog, shopping cart, and payment integration.',
            type: 'proactive',
            subType: 'mini-project',
            dueDate: addDays(baseDate, 35),
            maxMarks: 120,
            createdBy: teacherId,
            classId: 'proactive-class-002',
            dynamicFields: {
                stack: 'Full Stack (Frontend: React/Vue, Backend: Node/Django, Database: MySQL/MongoDB)',
                features: ['Authentication', 'Product Management', 'Cart System', 'Payment Gateway', 'Admin Dashboard'],
                documentation: 'Technical and User Documentation required',
                codeQuality: 'Must include comments, error handling, and best practices'
            }
        },
        {
            id: 'asgn-proactive-workshop-001',
            title: 'Technical Workshop – Full Stack Development Mastery',
            description: 'Complete comprehensive workshop on full-stack development. Learn and implement modern web technologies from backend to frontend.',
            type: 'proactive',
            subType: 'technical-workshop',
            dueDate: addDays(baseDate, 14),
            maxMarks: 80,
            createdBy: teacherId,
            classId: 'proactive-class-002',
            dynamicFields: {
                modules: ['Backend API Design', 'Database Modeling', 'Frontend Framework', 'Authentication', 'Testing'],
                duration: '2 weeks',
                practicalAssignments: 'Build a mini project applying learned concepts',
                certification: 'Completion certificate upon success'
            }
        },

        // ========== REACTIVE ASSIGNMENTS ==========
        {
            id: 'asgn-reactive-remedial-001',
            title: 'Remedial Assignment – Data Structures Fundamentals',
            description: 'Complete remedial assignment covering essential Data Structures concepts. Solve fundamental problems on arrays, linked lists, stacks, and queues.',
            type: 'reactive',
            subType: 'remedial',
            dueDate: addDays(baseDate, 7),
            maxMarks: 50,
            createdBy: teacherId,
            classId: 'reactive-class-001',
            dynamicFields: {
                topic: 'Data Structures Basics',
                difficulty: 'Easy to Medium',
                problemCount: 20,
                resources: ['Class notes', 'Textbook Chapters 1-4', 'Video tutorials'],
                instructions: 'Solve all problems. Show working for each. Submit as documented notebook.'
            }
        },
        {
            id: 'asgn-reactive-retest-001',
            title: 'Re-test – Operating Systems: Process Management & Scheduling',
            description: 'Re-test opportunity for Operating Systems Unit 1. Test covers process management, CPU scheduling algorithms, and synchronization.',
            type: 'reactive',
            subType: 'retest',
            dueDate: addDays(baseDate, 3),
            maxMarks: 30,
            createdBy: teacherId,
            classId: 'reactive-class-001',
            dynamicFields: {
                subject: 'Operating Systems',
                unit: 'Unit 1: Fundamentals',
                duration: '1 hour',
                format: 'MCQ + Short Answer',
                passingMarks: 15,
                mode: 'Online'
            }
        },
        {
            id: 'asgn-reactive-coding-001',
            title: 'Basic Coding Practice – C Programming: Loops & Functions',
            description: 'Practice basic C programming with focus on loops and user-defined functions. Implement 10 programs demonstrating loop constructs and function design.',
            type: 'reactive',
            subType: 'coding-practice',
            dueDate: addDays(baseDate, 10),
            maxMarks: 30,
            createdBy: teacherId,
            classId: 'reactive-class-002',
            dynamicFields: {
                language: 'C',
                topic: 'Loops & Functions',
                programs: 10,
                requirements: ['Well-commented code', 'Test cases documented', 'Submit as .c file'],
                expectedOutput: 'Working programs with sample outputs'
            }
        },
        {
            id: 'asgn-reactive-seminar-001',
            title: 'Seminar – Introduction to Database Management Systems',
            description: 'Prepare and deliver a 10-minute seminar on Database Management Systems. Cover basic concepts, DBMS types, and SQL fundamentals.',
            type: 'reactive',
            subType: 'seminar',
            dueDate: addDays(baseDate, 14),
            maxMarks: 25,
            createdBy: teacherId,
            classId: 'reactive-class-002',
            dynamicFields: {
                topic: 'DBMS Introduction',
                duration: '10 minutes',
                slides: '12-15 slides minimum',
                content: ['DBMS Definition', 'DBMS vs RDBMS', 'Features', 'Importance', 'Applications'],
                evaluation: ['Content Accuracy', 'Presentation Skills', 'Visual Design', 'Q&A Handling']
            }
        }
    ];

    // Create assignments with auto-allocated students
    const assignmentsWithStudents = await Promise.all(
        sampleAssignments.map(async (assignment) => {
            return await createAutoAssignedAssignment(assignment, assignment.type, classifiedData);
        })
    );

    return assignmentsWithStudents;
}

/**
 * Add days to a date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return toISODate(result);
}

/**
 * Convert date to ISO format (full datetime string for API)
 */
function toISODate(date) {
    if (typeof date === 'string') return date;
    // Return full ISO datetime string at 11:59 PM for completion deadline
    const isoDate = date.toISOString();
    // Set time to 23:59:59 for end-of-day deadline
    return isoDate.replace(/T\d{2}:\d{2}:\d{2}/, 'T23:59:59');
}

/**
 * Get current teacher ID from localStorage or default
 */
function getCurrentTeacherId() {
    const user = getCurrentUser();
    if (user && user.username) {
        return user.username;
    }
    return 'teacher_john';
}

/**
 * Create seed data and save to backend
 */
async function initializeSeededAssignments() {
    try {
        console.log('🌱 Starting seed initialization...');
        
        // Get classified student data
        const classifiedData = await getStudentClassificationData();
        console.log('📚 Classified student data:', classifiedData);
        
        if (!classifiedData || Object.keys(classifiedData).length === 0) {
            console.error('❌ No student classification data available');
            return {
                success: false,
                message: 'Failed to fetch student classification data',
                assignments: []
            };
        }
        
        // Generate seed assignments
        const teacherId = getCurrentTeacherId();
        console.log('👨‍🏫 Teacher ID:', teacherId);
        const assignments = await generateSeedAssignments(classifiedData, teacherId);
        console.log('📝 Generated', assignments.length, 'seed assignments:', assignments);
        
        if (!assignments || assignments.length === 0) {
            console.error('❌ Failed to generate assignments');
            return {
                success: false,
                message: 'Failed to generate seed assignments',
                assignments: []
            };
        }
        
        // Try to save via API first, but use local fallback if it fails
        try {
            console.log('📤 Attempting to save via API endpoint...');
            const response = await fetch('/api/assignments/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: assignments,
                    classifiedStudents: classifiedData,
                    metrics: getClassificationMetrics(classifiedData)
                })
            });
            
            console.log('📡 API response status:', response.status);
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ API response:', result);
                if (result.ok) {
                    console.log('✅ Seed assignments created successfully via API');
                    // Wait a moment for file system to sync
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Refresh Active Assignments
                    if (typeof loadActiveAssignments === 'function') {
                        console.log('🔄 Refreshing Active Assignments display...');
                        await loadActiveAssignments();
                    }
                    return {
                        success: true,
                        message: 'Seed assignments created and saved',
                        assignments: assignments,
                        count: assignments.length
                    };
                }
            }
        } catch (apiError) {
            console.warn('⚠️ API call failed:', apiError.message, '- using local storage fallback');
        }
        
        // Fallback: Save directly to localStorage and localAssignments.json
        console.log('💾 Using local storage fallback...');
        return await saveAssignmentsLocally(assignments);
        
    } catch (error) {
        console.error('❌ Error initializing seed assignments:', error);
        return {
            success: false,
            message: 'Error initializing seed assignments: ' + error.message,
            assignments: []
        };
    }
}

/**
 * Save assignments locally as fallback and display
 */
async function saveAssignmentsLocally(assignments) {
    try {
        console.log('💾 Saving', assignments.length, 'assignments locally...');
        
        // Fetch existing assignments
        const response = await fetch('/api/local/assignments');
        const data = await response.json();
        
        console.log('📦 Fetched existing data:', data);
        
        let existingAssignments = [];
        if (Array.isArray(data)) {
            existingAssignments = data;
        } else if (data.assignments && Array.isArray(data.assignments)) {
            existingAssignments = data.assignments;
        }
        
        console.log('📋 Found', existingAssignments.length, 'existing assignments');
        
        if (!Array.isArray(existingAssignments)) {
            console.warn('⚠️ Existing assignments not an array, starting fresh');
            existingAssignments = [];
        }
        
        // Filter out any duplicate IDs
        const newIds = new Set(assignments.map(a => a.id));
        existingAssignments = existingAssignments.filter(a => !newIds.has(a.id));
        
        console.log('👥 After deduplication:', existingAssignments.length, 'existing assignments');
        
        // Combine with new assignments
        const allAssignments = [...existingAssignments, ...assignments];
        console.log('🎯 Total assignments to save:', allAssignments.length);
        
        // Save back via POST endpoint
        const saveResponse = await fetch('/api/local/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assignments: allAssignments })
        });
        
        console.log('💾 POST response status:', saveResponse.status, saveResponse.statusText);
        
        if (saveResponse.ok) {
            const saveResult = await saveResponse.json();
            console.log('✅ Save result:', saveResult);
            
            // Wait a moment then refresh Active Assignments
            if (typeof loadActiveAssignments === 'function') {
                console.log('⏰ Scheduling Active Assignments refresh in 500ms...');
                setTimeout(() => {
                    console.log('🔄 Calling loadActiveAssignments()...');
                    loadActiveAssignments();
                }, 500);
            } else {
                console.warn('⚠️ loadActiveAssignments function not available');
            }
            
            return {
                success: true,
                message: 'Seed assignments saved locally',
                assignments: assignments,
                count: assignments.length
            };
        } else {
            const errorText = await saveResponse.text();
            console.error('❌ Save failed:', errorText);
            throw new Error('Failed to save: ' + saveResponse.statusText);
        }
    } catch (error) {
        console.error('❌ Error saving locally:', error);
        return {
            success: false,
            message: 'Failed to save assignments: ' + error.message,
            assignments: []
        };
    }
}

/**
 * Display seed initialization UI message
 */
function displaySeedInitResult(result) {
    const messageStatus = result.success ? '✅ Success' : '⚠️ Note';
    const message = result.message || 'Operation completed';
    
    if (result.success) {
        console.log('✅ ' + message);
        if (document.getElementById('seed-status')) {
            document.getElementById('seed-status').innerHTML = `
                <div style="padding: 12px; background: #d4edda; color: #155724; border-radius: 4px; margin: 10px 0; border-left: 4px solid #28a745;">
                    <strong>${messageStatus}:</strong> ${message}<br/>
                    <small>Loading ${result.count} assignments...</small>
                </div>
            `;
        }
    } else {
        console.error('❌ ' + message);
        if (document.getElementById('seed-status')) {
            document.getElementById('seed-status').innerHTML = `
                <div style="padding: 12px; background: #f8d7da; color: #721c24; border-radius: 4px; margin: 10px 0; border-left: 4px solid #dc3545;">
                    <strong>${messageStatus}:</strong> ${message}<br/>
                    <small>Check browser console for details.</small>
                </div>
            `;
        }
    }
}

/**
 * Export metrics and statistics
 */
function exportClassificationReport(classifiedData) {
    const metrics = getClassificationMetrics(classifiedData);
    
    return {
        timestamp: new Date().toISOString(),
        summary: {
            totalStudents: metrics.total,
            proactiveStudents: metrics.proactiveCount,
            reactiveStudents: metrics.reactiveCount,
            proactivePercentage: metrics.proactivePercentage,
            reactivePercentage: metrics.reactivePercentage
        },
        proactiveList: classifiedData.proactive || [],
        reactiveList: classifiedData.reactive || [],
        allocationSummary: {
            proactiveAssignmentCount: 4,
            reactiveAssignmentCount: 4,
            totalAssignmentCount: 8
        }
    };
}
