// Teachers Credentials Database
// All teacher login credentials for the system

const teachersDatabase = {
    // CLASS TEACHER USERS
    'ct_asha': {
        password: 'ctChrist2025',
        role: 'classTeacher',
        name: 'Ms. Asha Nandakumar',
        assignedClass: 'BCA-2A'
    },
    'ct_kiran': {
        password: 'ctChrist2025',
        role: 'classTeacher',
        name: 'Mr. Kiran Mathew',
        assignedClass: 'BSc-CM-2B'
    },

    // TEACHER USERS
    'teacher_anil': {
        password: 'teacherChrist2025',
        role: 'teacher',
        name: 'Dr. Anil Verma',
        assignedSubject: 'Data Structures',
        assignedClasses: ['BCA-2A']
    },
    'teacher_ravi': {
        password: 'teacherChrist2025',
        role: 'teacher',
        name: 'Mr. Ravi Patel',
        assignedSubject: 'Database Systems',
        assignedClasses: ['BCA-2A']
    },
    'teacher_suresh': {
        password: 'teacherChrist2025',
        role: 'teacher',
        name: 'Prof. Suresh Nair',
        assignedSubject: 'Digital Fundamentals',
        assignedClasses: ['BSc-CM-2B']
    },
    'teacher_anjali': {
        password: 'teacherChrist2025',
        role: 'teacher',
        name: 'Ms. Anjali Sharma',
        assignedSubject: 'Computer Maintenance',
        assignedClasses: ['BSc-CM-2B']
    }
};

// Export for use in login-script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = teachersDatabase;
}
