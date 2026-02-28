// Authentication utility functions

function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    if (!userStr) {
        // Redirect to login if no user found
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(userStr);
}

function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function isUserLoggedIn() {
    return sessionStorage.getItem('currentUser') !== null;
}

// Initialize user info in navbar
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name;
        
        let roleText = '';
        if (user.role === 'admin') {
            if (user.adminRole === 'HOD') {
                roleText = 'HOD';
            } else {
                roleText = `Admin (${user.adminRole})`;
            }
        } else if (user.role === 'classTeacher') {
            roleText = 'Class Teacher';
        } else if (user.role === 'hod') {
            roleText = 'HOD';
        } else if (user.role === 'teacher') {
            roleText = 'Teacher';
        } else if (user.role === 'itadmin') {
            roleText = 'IT Admin';
        }
        
        document.getElementById('user-role').textContent = roleText;
    }

    // Logout button handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                logoutUser();
            }
        });
    }
});
