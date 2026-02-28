/**
 * Student Classification System
 * Automatically fetches student data from Performance Dashboard
 * and classifies students as Proactive (≥50%) or Reactive (<50%)
 */

/**
 * Student Classification Helper
 * Extracts student data from the Performance Dashboard table
 * and classifies them based on percentage
 */
async function getStudentClassificationData() {
    try {
        // Try to fetch from API first
        const response = await fetch('/api/student-performance');
        if (response.ok) {
            const data = await response.json();
            return processStudentData(data.students || []);
        }
    } catch (error) {
        console.warn('API fetch failed, using local data:', error);
    }

    // Fallback: Use locally stored student data from assessments
    return getStudentDataFromLocalStorage();
}

/**
 * Process raw student data and classify
 * @param {Array} students - Array of student objects with marks and totals
 * @returns {Object} Classified students { proactive: [], reactive: [] }
 */
function processStudentData(students) {
    const classified = {
        proactive: [],  // percentage >= 50%
        reactive: []    // percentage < 50%
    };

    students.forEach(student => {
        const percentage = calculatePercentage(student.obtained_marks, student.total_marks);
        
        const studentRecord = {
            id: student.student_id || generateStudentId(student.student_name),
            name: student.student_name,
            email: student.email || `${student.student_id}@christuniversity.in`,
            totalMarks: student.total_marks || 0,
            obtainedMarks: student.obtained_marks || 0,
            percentage: percentage,
            classification: percentage >= 50 ? 'proactive' : 'reactive'
        };

        if (percentage >= 50) {
            classified.proactive.push(studentRecord);
        } else {
            classified.reactive.push(studentRecord);
        }
    });

    return classified;
}

/**
 * Calculate percentage
 * @param {number} obtained - Obtained marks
 * @param {number} total - Total marks
 * @returns {number} Percentage value (0-100)
 */
function calculatePercentage(obtained, total) {
    if (total === 0) return 0;
    return Math.round((obtained / total) * 100);
}

/**
 * Generate unique student ID from name if not provided
 */
function generateStudentId(name) {
    return `student-${name.toLowerCase().replace(/\s+/g, '-')}`;
}

/**
 * Fetch student data from locally stored assessment data
 * Parses the Performance Dashboard table data
 */
function getStudentDataFromLocalStorage() {
    const classified = {
        proactive: [],
        reactive: []
    };

    // Check if we have stored student assessment data
    const storedData = localStorage.getItem('currentClassPerformanceData');
    if (!storedData) {
        console.warn('No student performance data stored. Using sample data.');
        return getSampleStudentClassification();
    }

    try {
        const perfData = JSON.parse(storedData);
        
        // Parse based on structure
        if (Array.isArray(perfData)) {
            perfData.forEach(record => {
                if (record.name && record.percentage !== undefined) {
                    const student = {
                        id: record.roll || `student-${record.name.toLowerCase()}`,
                        name: record.name,
                        email: record.email || `${record.roll}@christuniversity.in`,
                        percentage: record.percentage,
                        classification: record.percentage >= 50 ? 'proactive' : 'reactive'
                    };
                    
                    if (record.percentage >= 50) {
                        classified.proactive.push(student);
                    } else {
                        classified.reactive.push(student);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error parsing stored performance data:', error);
        return getSampleStudentClassification();
    }

    return classified;
}

/**
 * Get sample student classification for demo/testing
 */
function getSampleStudentClassification() {
    return {
        proactive: [
            { id: 'student-001', name: 'Rahul Singh', email: 'rahul.singh@christuniversity.in', percentage: 88, classification: 'proactive' },
            { id: 'student-002', name: 'Anjali Verma', email: 'anjali.verma@christuniversity.in', percentage: 85, classification: 'proactive' },
            { id: 'student-003', name: 'Priya Nair', email: 'priya.nair@christuniversity.in', percentage: 78, classification: 'proactive' },
            { id: 'student-004', name: 'Rohan Gupta', email: 'rohan.gupta@christuniversity.in', percentage: 72, classification: 'proactive' },
            { id: 'student-005', name: 'Arjun Sharma', email: 'arjun.sharma@christuniversity.in', percentage: 82, classification: 'proactive' },
            { id: 'student-006', name: 'Sneha Desai', email: 'sneha.desai@christuniversity.in', percentage: 75, classification: 'proactive' }
        ],
        reactive: [
            { id: 'student-007', name: 'Vikas Kumar', email: 'vikas.kumar@christuniversity.in', percentage: 48, classification: 'reactive' },
            { id: 'student-008', name: 'Neha Patel', email: 'neha.patel@christuniversity.in', percentage: 45, classification: 'reactive' },
            { id: 'student-009', name: 'Mohammad Ali', email: 'mohammad.ali@christuniversity.in', percentage: 38, classification: 'reactive' },
            { id: 'student-010', name: 'Divya Singh', email: 'divya.singh@christuniversity.in', percentage: 52, classification: 'proactive' }
        ]
    };
}

/**
 * Auto-allocate students to assignment based on type
 * @param {string} assignmentType - 'proactive' or 'reactive'
 * @param {Object} classifiedData - Classified student data
 * @returns {Array} List of students to assign
 */
function autoAllocateStudents(assignmentType, classifiedData) {
    if (assignmentType === 'proactive') {
        return classifiedData.proactive || [];
    } else if (assignmentType === 'reactive') {
        return classifiedData.reactive || [];
    }
    return [];
}

/**
 * Format students for assignment storage
 * @param {Array} studentList - Students to format
 * @returns {Array} Formatted student records
 */
function formatStudentsForAssignment(studentList) {
    return studentList.map(student => ({
        id: student.id,
        name: student.name,
        email: student.email,
        percentage: student.percentage || 0
    }));
}

/**
 * Create assignment with auto-classified and auto-allocated students
 * @param {Object} assignmentData - Base assignment data
 * @param {string} assignmentType - 'proactive' or 'reactive'
 * @param {Object} classifiedData - Pre-classified student data
 * @returns {Object} Assignment object with assigned students
 */
async function createAutoAssignedAssignment(assignmentData, assignmentType, classifiedData) {
    // Generate unique token
    const token = `asgn_${Math.random().toString(36).substr(2, 10)}`;
    
    // Auto-allocate students based on type
    const allocatedStudents = autoAllocateStudents(assignmentType, classifiedData);
    
    // Format for storage
    const formattedStudents = formatStudentsForAssignment(allocatedStudents);
    
    // Create assignment object
    const assignment = {
        id: assignmentData.id || `asgn-${assignmentType}-${Date.now()}`,
        token: token,
        title: assignmentData.title,
        description: assignmentData.description,
        type: assignmentType,
        subType: assignmentData.subType || 'standard',
        dueDate: assignmentData.dueDate,
        maxMarks: assignmentData.maxMarks || 100,
        createdBy: assignmentData.createdBy || 'teacher_john',
        dynamicFields: assignmentData.dynamicFields || {},
        assignedStudents: formattedStudents,
        status: 'active',
        createdAt: new Date().toISOString(),
        submissionCount: 0,
        reviewedCount: 0,
        classId: assignmentData.classId || 'default-class',
        autoAllocated: true,  // Mark as auto-allocated
        classification: assignmentType  // Store classification type
    };
    
    return assignment;
}

/**
 * Validate assignment data before creation
 * @param {Object} assignmentData - Assignment to validate
 * @returns {Object} Validation result { valid: boolean, errors: Array }
 */
function validateAssignmentData(assignmentData) {
    const errors = [];
    
    if (!assignmentData.title || assignmentData.title.trim() === '') {
        errors.push('Assignment title is required');
    }
    if (!assignmentData.dueDate) {
        errors.push('Due date is required');
    }
    if (!['proactive', 'reactive'].includes(assignmentData.type)) {
        errors.push('Invalid assignment type');
    }
    if (!assignmentData.createdBy) {
        errors.push('Creator information is required');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Export classification metrics
 * @param {Object} classifiedData - Classified student data
 * @returns {Object} Classification metrics
 */
function getClassificationMetrics(classifiedData) {
    const total = (classifiedData.proactive?.length || 0) + (classifiedData.reactive?.length || 0);
    
    return {
        total: total,
        proactiveCount: classifiedData.proactive?.length || 0,
        reactiveCount: classifiedData.reactive?.length || 0,
        proactivePercentage: total > 0 ? Math.round((classifiedData.proactive?.length || 0) / total * 100) : 0,
        reactivePercentage: total > 0 ? Math.round((classifiedData.reactive?.length || 0) / total * 100) : 0
    };
}
