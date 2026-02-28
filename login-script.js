// Import teachers credentials (separate file)
// Note: Must be loaded before this script or teachersDatabase will be undefined
// Solutions:
// 1. Load teachers-credentials.js BEFORE login-script.js in HTML:
//    <script src="teachers-credentials.js"></script>
//    <script src="login-script.js"></script>
// 2. Or use this inline if file is not available
if (typeof teachersDatabase === 'undefined') {
    const teachersDatabase = {};
}

// Manage saved logins in localStorage
function getSavedLogins() {
    try {
        const raw = localStorage.getItem('savedLogins');
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        return [];
    }
}

function saveLogninsToStorage(logins) {
    try {
        localStorage.setItem('savedLogins', JSON.stringify(logins));
    } catch (err) {
        console.warn('Unable to save logins to localStorage:', err);
    }
}

function addSavedLogin(username, password) {
    const logins = getSavedLogins();
    const existing = logins.findIndex(l => l.username === username);
    if (existing >= 0) {
        logins[existing].password = password;
    } else {
        logins.push({ username, password });
    }
    saveLogninsToStorage(logins);
}

function removeSavedLogin(username) {
    const logins = getSavedLogins().filter(l => l.username !== username);
    saveLogninsToStorage(logins);
}

function renderSavedLogins() {
    const savedLoginsList = document.getElementById('saved-logins-list');
    const noSavedMsg = document.getElementById('no-saved-logins');
    const logins = getSavedLogins();
    
    if (!savedLoginsList) return;
    
    savedLoginsList.innerHTML = '';
    if (logins.length === 0) {
        if (noSavedMsg) noSavedMsg.style.display = 'block';
        return;
    }
    if (noSavedMsg) noSavedMsg.style.display = 'none';
    
    logins.forEach(login => {
        const btn = document.createElement('div');
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'space-between';
        btn.style.padding = '10px 12px';
        btn.style.background = '#f0f0f0';
        btn.style.border = '1px solid #ddd';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.2s';
        
        const loginBtn = document.createElement('button');
        loginBtn.type = 'button';
        loginBtn.style.flex = '1';
        loginBtn.style.textAlign = 'left';
        loginBtn.style.padding = '0';
        loginBtn.style.border = 'none';
        loginBtn.style.background = 'none';
        loginBtn.style.cursor = 'pointer';
        loginBtn.style.fontSize = '13px';
        loginBtn.style.fontWeight = '500';
        loginBtn.textContent = login.username;
        loginBtn.title = 'Click to login with this account';
        
        loginBtn.addEventListener('click', function() {
            document.getElementById('username').value = login.username;
            document.getElementById('password').value = login.password;
            document.getElementById('login-form').dispatchEvent(new Event('submit'));
        });
        
        loginBtn.addEventListener('mouseover', function() {
            btn.style.background = '#e8e8e8';
            btn.style.borderColor = '#999';
        });
        loginBtn.addEventListener('mouseout', function() {
            btn.style.background = '#f0f0f0';
            btn.style.borderColor = '#ddd';
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.textContent = '\u2715';
        deleteBtn.style.padding = '4px 8px';
        deleteBtn.style.marginLeft = '8px';
        deleteBtn.style.background = '#dc3545';
        deleteBtn.style.color = '#fff';
        deleteBtn.style.border = 'none';
        deleteBtn.style.borderRadius = '4px';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.title = 'Delete this saved login';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm(`Remove saved login for "${login.username}"?`)) {
                removeSavedLogin(login.username);
                renderSavedLogins();
            }
        });
        
        btn.appendChild(loginBtn);
        btn.appendChild(deleteBtn);
        savedLoginsList.appendChild(btn);
    });
}

// Admin and IT credentials database
const adminDatabase = {
    // IT ADMIN USER
    'itadmin_rajesh': {
        password: 'itAdmin2025',
        role: 'itadmin',
        name: 'Mr. Rajesh Kumar',
        adminRole: 'IT Administrator'
    },

    // ADMIN USERS (Christ University)
    'hod_monica': {
        password: 'christHOD2025',
        role: 'admin',
        name: 'Dr. Monica Fernandes',
        adminRole: 'HOD'
    },
    'pc_thomas': {
        password: 'christPC2025',
        role: 'admin',
        name: 'Mr. Thomas Pereira',
        adminRole: 'Program Coordinator'
    }
};

// Merge all databases
const usersDatabase = { ...adminDatabase, ...teachersDatabase };

// Handle login form submission
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const rememberCheckbox = document.getElementById('remember-username');
    const savePasswordCheckbox = document.getElementById('save-password');

    // Render saved logins at page load
    renderSavedLogins();

    // Prefill saved username/password if present (legacy single-login support)
    try {
        const remembered = localStorage.getItem('rememberedUsername');
        const savedPwd = localStorage.getItem('savedPassword');
        const savePwdFlag = localStorage.getItem('savePassword') === 'true';
        if (remembered) {
            document.getElementById('username').value = remembered;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
        if (savePwdFlag && savedPwd) {
            document.getElementById('password').value = savedPwd;
            if (savePasswordCheckbox) savePasswordCheckbox.checked = true;
        }
    } catch (err) {
        console.warn('Unable to access localStorage:', err);
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Clear previous error messages
        errorMessage.textContent = '';
        errorMessage.classList.remove('show');

        // Validate credentials
        if (usersDatabase.hasOwnProperty(username)) {
            const user = usersDatabase[username];
            if (user.password === password) {
                // Successful login
                // Save login if "Save password" is checked
                if (savePasswordCheckbox && savePasswordCheckbox.checked) {
                    addSavedLogin(username, password);
                }

                // Save remember preferences to localStorage (legacy support)
                try {
                    if (rememberCheckbox && rememberCheckbox.checked) {
                        localStorage.setItem('rememberedUsername', username);
                    } else {
                        localStorage.removeItem('rememberedUsername');
                    }

                    if (savePasswordCheckbox && savePasswordCheckbox.checked) {
                        localStorage.setItem('savedPassword', password);
                        localStorage.setItem('savePassword', 'true');
                    } else {
                        localStorage.removeItem('savedPassword');
                        localStorage.setItem('savePassword', 'false');
                    }
                } catch (err) {
                    console.warn('Unable to write to localStorage:', err);
                }

                // Store user data in sessionStorage
                sessionStorage.setItem('currentUser', JSON.stringify({
                    username: username,
                    role: user.role,
                    name: user.name,
                    adminRole: user.adminRole || null,
                    assignedClass: user.assignedClass || null,
                    assignedSubject: user.assignedSubject || null,
                    assignedClasses: user.assignedClasses || null
                }));

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Wrong password
                showError('Incorrect password. Please try again.');
            }
        } else {
            // User not found
            showError('Username not found. Please check your credentials.');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        document.getElementById('password').value = '';
    }
});
