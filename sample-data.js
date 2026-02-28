// Sample classes and subjects data for Christ University - Computer Science department
const classesAndSubjects = {
    'BCA-2A': {
        className: 'BCA - Computer Applications - 2nd Year, Section A (Christ University)',
        subjects: [
            {
                name: 'Data Structures',
                teacher: 'Dr. Anil Verma',
                maxMarks: 100
            },
            {
                name: 'Database Systems',
                teacher: 'Unassigned',
                maxMarks: 100
            },
            {
                name: 'Web Development',
                teacher: 'Dr. Anil Verma',
                maxMarks: 100
            },
            {
                name: 'Others',
                teacher: 'Unassigned',
                maxMarks: 100
            }
        ]
    },
    'BSc-CM-2B': {
        className: 'B.Sc CM - Computer Maintenance - 2nd Year, Section B (Christ University)',
        subjects: [
            {
                name: 'Digital Fundamentals',
                teacher: 'Prof. Suresh Nair',
                maxMarks: 100
            },
            {
                name: 'Computer Maintenance',
                teacher: 'Ms. Anjali Sharma',
                maxMarks: 100
            },
            {
                name: 'Operating Systems',
                teacher: 'Unassigned',
                maxMarks: 100
            },
            {
                name: 'Others',
                teacher: 'Unassigned',
                maxMarks: 100
            }
        ]
    }
};

// Assessment types
const assessments = ['CIA 1', 'CIA 2', 'Mid Sem', 'CIA 3', 'CIA 4', 'End Sem'];

// Function to render classes/subjects based on user role
function initializeDashboard() {
    const user = getCurrentUser();
    if (!user) return;

    // Hide all views first
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('classTeacher-view').style.display = 'none';
    document.getElementById('teacher-view').style.display = 'none';
    document.getElementById('itadmin-view').style.display = 'none';
    document.getElementById('hod-view').style.display = 'none';

    if (user.role === 'itadmin') {
        renderITAdminDashboard(user);
    } else if (user.role === 'admin') {
        renderAdminDashboard(user);
    } else if (user.role === 'classTeacher') {
        renderClassTeacherDashboard(user);
    } else if (user.role === 'teacher') {
        renderTeacherDashboard(user);
        // Render teacher notifications and scheduling selections
        if (typeof renderTeacherNotificationsAndSelections === 'function') {
            renderTeacherNotificationsAndSelections(user.username);
        }
    }
}

// Admin Dashboard - Show all classes and subjects
function renderAdminDashboard(user) {
    document.getElementById('admin-view').style.display = 'block';
    const adminInfo = document.getElementById('admin-info');
    
    // Add management button for HOD
    let infoHTML = `Welcome, ${user.name}! You have full access to all classes and subjects as a ${user.adminRole}.`;
    if (user.adminRole === 'HOD') {
        infoHTML += `<br><button id="manage-teachers-btn" style="margin-top: 12px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Manage Teacher Assignments</button>`;
    }
    adminInfo.innerHTML = infoHTML;

    // Attach HOD management button listener
    const manageBtn = document.getElementById('manage-teachers-btn');
    if (manageBtn) {
        manageBtn.addEventListener('click', function() {
            document.getElementById('admin-view').style.display = 'none';
            renderHODDashboard(user);
        });
    }

    const adminContainer = document.getElementById('admin-classes-container');
    adminContainer.innerHTML = '';

    for (const [classCode, classData] of Object.entries(classesAndSubjects)) {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
            <h3>${classData.className}</h3>
            <div class="subjects-list">
                ${classData.subjects.map(subject => `
                    <button class="subject-btn" data-class="${classCode}" data-subject="${subject.name}">
                        ${subject.name}
                        <span class="teacher-info">by ${subject.teacher}</span>
                    </button>
                `).join('')}
            </div>
            <div class="class-performance-row">
                <strong>Class Performance:</strong>
                <div class="class-performance-buttons">
                    ${assessments.map(a => `
                        <button class="class-perf-btn" data-class="${classCode}" data-assessment="${a}">${a}</button>
                    `).join('')}
                    <button class="class-perf-btn" data-class="${classCode}" data-assessment="Overall">Overall</button>
                </div>
            </div>
        `;
        adminContainer.appendChild(classCard);
    }

    attachSubjectButtonListeners();
}

// Class Teacher Dashboard - Show only their class subjects
function renderClassTeacherDashboard(user) {
    document.getElementById('classTeacher-view').style.display = 'block';
    document.getElementById('ct-info').textContent = 
        `Welcome, ${user.name}! You can view all subjects for your class: ${user.assignedClass}`;

    const ctContainer = document.getElementById('ct-subjects-container');
    ctContainer.innerHTML = '';

    const classData = classesAndSubjects[user.assignedClass];
    if (classData) {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
            <h3>${classData.className}</h3>
            <div class="subjects-list">
                ${classData.subjects.map(subject => `
                    <button class="subject-btn" data-class="${user.assignedClass}" data-subject="${subject.name}">
                        ${subject.name}
                        <span class="teacher-info">by ${subject.teacher}</span>
                    </button>
                `).join('')}
            </div>
            <div class="class-performance-row">
                <strong>Class Performance:</strong>
                <div class="class-performance-buttons">
                    ${assessments.map(a => `
                        <button class="class-perf-btn" data-class="${user.assignedClass}" data-assessment="${a}">${a}</button>
                    `).join('')}
                    <button class="class-perf-btn" data-class="${user.assignedClass}" data-assessment="Overall">Overall</button>
                </div>
            </div>
        `;
        ctContainer.appendChild(classCard);
    }

    attachSubjectButtonListeners();
}

// Teacher Dashboard - Show only their subject
function renderTeacherDashboard(user) {
    document.getElementById('teacher-view').style.display = 'block';
    document.getElementById('teacher-info').textContent = 
        `Welcome, ${user.name}! You have access to: ${user.assignedSubject}`;

    const teacherContainer = document.getElementById('teacher-subject-container');
    teacherContainer.innerHTML = '';

    // Find all classes where this teacher teaches this subject
    const classesForSubject = [];
    for (const [classCode, classData] of Object.entries(classesAndSubjects)) {
        const subject = classData.subjects.find(s => s.name === user.assignedSubject);
        if (subject) {
            classesForSubject.push({ classCode, classData, subject });
        }
    }

    classesForSubject.forEach(({ classCode, classData, subject }) => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.innerHTML = `
            <h3>${classData.className}</h3>
            <div class="subjects-list">
                <button class="subject-btn" data-class="${classCode}" data-subject="${subject.name}">
                    ${subject.name}
                    <span class="teacher-info">by ${subject.teacher}</span>
                </button>
            </div>
            <div class="class-performance-row">
                <strong>Class Performance:</strong>
                <div class="class-performance-buttons">
                    ${assessments.map(a => `
                        <button class="class-perf-btn" data-class="${classCode}" data-assessment="${a}">${a}</button>
                    `).join('')}
                    <button class="class-perf-btn" data-class="${classCode}" data-assessment="Overall">Overall</button>
                </div>
            </div>
        `;
        teacherContainer.appendChild(classCard);
    });

    attachSubjectButtonListeners();
}

// Attach click listeners to subject buttons
function attachSubjectButtonListeners() {
    const subjectButtons = document.querySelectorAll('.subject-btn');
    subjectButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const classCode = this.getAttribute('data-class');
                const subject = this.getAttribute('data-subject');
                // Read selected assessment from active tab
                let assessment = 'CIA 1';
                const activeTab = document.querySelector('#assessment-tabs .tab-btn.active');
                if (activeTab) assessment = activeTab.getAttribute('data-assessment');
                
                loadSampleDataAndShowDashboard(classCode, subject, assessment);
            });
    });

    // Attach class performance button listeners
    const classPerfButtons = document.querySelectorAll('.class-perf-btn');
    classPerfButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const classCode = this.getAttribute('data-class');
            const assessment = this.getAttribute('data-assessment');
            const classInfo = classesAndSubjects[classCode];
            const maxPerSubject = classInfo && classInfo.subjects && classInfo.subjects[0] ? classInfo.subjects[0].maxMarks : 100;
            if (!classCode) return;
            if (assessment === 'Overall') {
                if (typeof showOverallClassPerformance === 'function') showOverallClassPerformance(classCode);
            } else {
                if (typeof showClassPerformance === 'function') showClassPerformance(classCode, assessment, maxPerSubject);
            }
        });
    });

    // (removed separate subject 'Performance' buttons - use Performance Panel instead)
}

// Load sample data and show dashboard
function loadSampleDataAndShowDashboard(classCode, subject, assessment = 'CIA 1') {
    const sampleData = generateSampleData(classCode, subject, assessment);
    const maxMarks = classesAndSubjects[classCode].subjects.find(s => s.name === subject).maxMarks;
    
    // Hide main content and show dashboard
    document.getElementById('admin-view').style.display = 'none';
    document.getElementById('classTeacher-view').style.display = 'none';
    document.getElementById('teacher-view').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Process and display data
    // store current class context for class-level views
    document.body.setAttribute('data-current-class', classCode);
    processData(subject, sampleData, maxMarks, assessment, classCode);
}

// Generate sample student data for a class, subject and assessment
function generateSampleData(classCode, subject, assessment = 'CIA 1') {
    // Define sample students for each class
    const studentsMap = {
        'BCA-2A': [
            { 'Roll No': 'BCA-2001', 'Name': 'Rahul Singh' },
            { 'Roll No': 'BCA-2002', 'Name': 'Anjali Verma' },
            { 'Roll No': 'BCA-2003', 'Name': 'Priya Nair' },
            { 'Roll No': 'BCA-2004', 'Name': 'Rohan Gupta' },
            { 'Roll No': 'BCA-2005', 'Name': 'Neha Patel' },
            { 'Roll No': 'BCA-2006', 'Name': 'Arjun Sharma' },
            { 'Roll No': 'BCA-2007', 'Name': 'Sneha Desai' },
            { 'Roll No': 'BCA-2008', 'Name': 'Vikas Kumar' }
        ],
        'BSc-CM-2B': [
            { 'Roll No': 'BSC-2001', 'Name': 'Aditya Kulkarni' },
            { 'Roll No': 'BSC-2002', 'Name': 'Divya Menon' },
            { 'Roll No': 'BSC-2003', 'Name': 'Sameer Joshi' },
            { 'Roll No': 'BSC-2004', 'Name': 'Pooja Reddy' },
            { 'Roll No': 'BSC-2005', 'Name': 'Karan Saxena' },
            { 'Roll No': 'BSC-2006', 'Name': 'Isha Mishra' },
            { 'Roll No': 'BSC-2007', 'Name': 'Harshit Pandey' },
            { 'Roll No': 'BSC-2008', 'Name': 'Meera Sinha' }
        ]
    };

    const students = studentsMap[classCode] || [];
    
    // Generate sample marks (60-95 range, with some low performers) for the given assessment
    return students.map(student => {
        let marks;
        const random = Math.random();

        // 10% chance of absent
        if (random < 0.10) {
            marks = 'ab';
        }
        // 10% low performers (15-30)
        else if (random < 0.20) {
            marks = Math.floor(Math.random() * 16 + 15);
        }
        // 80% normal distribution (55-95)
        else {
            marks = Math.floor(Math.random() * 40 + 55);
        }

        return {
            'Roll No': student['Roll No'],
            'Name': student['Name'],
            'Subject': subject,
            'Assessment': assessment,
            'Marks': marks
        };
    });
}

// Generate sample data for entire class for a selected assessment across all subjects
function generateClassAssessmentData(classCode, assessment = 'CIA 1') {
    const classData = classesAndSubjects[classCode];
    if (!classData) return [];

    const allRows = [];
    classData.subjects.forEach(subject => {
        const rows = generateSampleData(classCode, subject.name, assessment);
        allRows.push(...rows);
    });
    return allRows;
}

// Generate overall aggregated data for class across all assessments (averaged)
function generateOverallClassData(classCode) {
    const classData = classesAndSubjects[classCode];
    if (!classData) return [];

    // For each assessment, generate class data, then aggregate per student
    const perAssessment = assessments.map(assess => generateClassAssessmentData(classCode, assess));

    // Map by Roll No to aggregate
    const agg = {};
    perAssessment.forEach(rows => {
        rows.forEach(row => {
            const roll = row['Roll No'];
            if (!agg[roll]) {
                agg[roll] = { Roll: roll, Name: row.Name, total: 0, count: 0 };
            }
            const mark = (row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab') ? parseFloat(row.Marks) : 0;
            agg[roll].total += isNaN(mark) ? 0 : mark;
            agg[roll].count += 1;
        });
    });

    // Convert to array of aggregated percentage values
    const subjectCount = classData.subjects.length;
    const maxPerSubject = classData.subjects[0] ? classData.subjects[0].maxMarks : 100;
    const rows = Object.values(agg).map(item => {
        const avgMark = item.count > 0 ? (item.total / item.count) : 0;
        const percentage = (avgMark / maxPerSubject) * 100;
        return { 'Roll No': item.Roll, 'Name': item.Name, 'AggregatedAvg': avgMark, 'Percentage': percentage };
    });

    return rows;
}

// Generate overall aggregated data for a single subject across all assessments
function generateOverallSubjectData(classCode, subjectName) {
    const classData = classesAndSubjects[classCode];
    if (!classData) return [];

    const maxMarks = (classData.subjects.find(s => s.name === subjectName) || {}).maxMarks || 100;
    const perAssessment = assessments.map(a => generateSampleData(classCode, subjectName, a));

    const agg = {};
    perAssessment.forEach(rows => {
        rows.forEach(row => {
            const roll = row['Roll No'];
            if (!agg[roll]) agg[roll] = { Roll: roll, Name: row.Name, total: 0, count: 0 };
            const mark = (row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab') ? parseFloat(row.Marks) : 0;
            agg[roll].total += isNaN(mark) ? 0 : mark;
            agg[roll].count += 1;
        });
    });

    return Object.values(agg).map(item => {
        const avgMark = item.count > 0 ? (item.total / item.count) : 0;
        const percentage = (avgMark / maxMarks) * 100;
        return { 'Roll No': item.Roll, 'Name': item.Name, 'AvgMark': avgMark, 'Percentage': percentage };
    });
}

// IT Admin Dashboard - Teacher profile management
function renderITAdminDashboard(user) {
    document.getElementById('itadmin-view').style.display = 'block';
    document.getElementById('itadmin-info').textContent = 
        `Welcome, ${user.name}! You can create, edit, and manage teacher profiles across the system.`;
    
    const container = document.getElementById('teachers-list-container');
    container.innerHTML = '';

    for (const [username, userData] of Object.entries(usersDatabase)) {
        if (userData.role === 'teacher') {
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.style.padding = '12px';
            card.style.border = '1px solid #ddd';
            card.style.borderRadius = '4px';
            card.style.marginBottom = '8px';
            card.style.background = '#fff';
            card.innerHTML = `
                <h4 style="margin-bottom: 8px;">${userData.name}</h4>
                <p style="margin: 4px 0; font-size: 0.9em; color: #666;">
                    <strong>Username:</strong> ${username}<br>
                    <strong>Subject:</strong> ${userData.assignedSubject || 'Not Assigned'}<br>
                    <strong>Classes:</strong> ${(userData.assignedClasses || []).join(', ') || 'Not Assigned'}
                </p>
                <button class="edit-teacher-btn" data-username="${username}" style="padding: 6px 12px; background: #002147; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px;">Edit</button>
                <button class="delete-teacher-btn" data-username="${username}" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">Delete</button>
            `;
            container.appendChild(card);
        }
    }

    // Attach event listeners
    attachITAdminEventListeners();

    // Initialize scheduling UI
    initSchedulingUI();
}

// Schedules persistence and rendering
function loadSchedules() {
    const raw = localStorage.getItem('examSchedules');
    try { return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
}

function saveSchedules(schedules) {
    localStorage.setItem('examSchedules', JSON.stringify(schedules || []));
}

function initSchedulingUI() {
    const saveBtn = document.getElementById('save-schedule-btn');
    const schedulesList = document.getElementById('schedules-list');
    const scopeSelect = document.getElementById('schedule-scope');
    const classWrap = document.getElementById('schedule-class-wrap');
    const subjectWrap = document.getElementById('schedule-subject-wrap');
    const classSelect = document.getElementById('schedule-class');
    const subjectSelect = document.getElementById('schedule-subject');
    const calPrev = document.getElementById('cal-prev');
    const calNext = document.getElementById('cal-next');
    const calMonthYear = document.getElementById('cal-month-year');
    const calContainer = document.getElementById('schedule-calendar');
    if (!saveBtn || !schedulesList) return;

    function renderSchedules() {
        const schedules = loadSchedules();
        schedulesList.innerHTML = '';
        if (schedules.length === 0) schedulesList.innerHTML = '<div style="color:#666">No schedules created.</div>';
        schedules.forEach((s, idx) => {
            const el = document.createElement('div');
            el.style.padding = '8px';
            el.style.border = '1px solid #e0e0e0';
            el.style.borderRadius = '4px';
            el.style.marginBottom = '8px';
            const scopeInfo = s.scope === 'all' ? 'All classes' : (`Class: ${s.class || 'N/A'} · Subject: ${s.subject || 'N/A'}`);
            el.innerHTML = `
                <strong>${s.exam}</strong> &middot; ${s.start} → ${s.end} &middot; Upload by: ${s.deadline} &middot; ${scopeInfo}
                <div style="margin-top:6px;"><button class="delete-schedule-btn" data-idx="${idx}" style="padding:6px 8px;background:#dc3545;color:#fff;border:none;border-radius:4px;cursor:pointer;">Delete</button></div>`;

            // Show if a teacher has already picked a date for this schedule
            try {
                const global = getGlobalSelections();
                const schedKey = s.createdAt ? ('sched_' + s.createdAt) : null;
                if (schedKey && global[schedKey]) {
                    const info = global[schedKey];
                    const pickedDiv = document.createElement('div');
                    pickedDiv.style.marginTop = '8px';
                    pickedDiv.style.fontSize = '0.95em';
                    pickedDiv.style.color = '#333';
                    pickedDiv.innerHTML = `<strong>Picked:</strong> ${info.date} by <strong>${info.teacher}</strong>`;
                    el.appendChild(pickedDiv);
                }
            } catch (e) { /* ignore */ }
            schedulesList.appendChild(el);
        });

        // attach delete handlers
        schedulesList.querySelectorAll('.delete-schedule-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.getAttribute('data-idx'));
                const s = loadSchedules();
                s.splice(idx,1);
                saveSchedules(s);
                renderSchedules();
            });
        });
    }

    saveBtn.addEventListener('click', function() {
        const exam = document.getElementById('schedule-exam').value;
        const start = document.getElementById('schedule-start').value;
        const end = document.getElementById('schedule-end').value;
        const deadline = document.getElementById('schedule-deadline').value;
        if (!exam || !start || !end || !deadline) return alert('Please fill all schedule fields.');
        if (new Date(start) > new Date(end)) return alert('Start date must be before end date');
        if (new Date(deadline) < new Date(end)) return alert('Upload deadline should be on or after the end date');

        const scope = (scopeSelect && scopeSelect.value) || 'all';
        const targetClass = (classSelect && classSelect.value) || '';
        const targetSubject = (subjectSelect && subjectSelect.value) || '';

        const schedules = loadSchedules();
        const newSched = { exam, start, end, deadline, scope, class: targetClass, subject: targetSubject, createdAt: new Date().toISOString() };
        schedules.push(newSched);
        saveSchedules(schedules);
        renderSchedules();
        notifyRelevantTeachersAboutSchedule(newSched);
        alert('Schedule saved and relevant teachers notified.');
        // clear inputs
        document.getElementById('schedule-start').value = '';
        document.getElementById('schedule-end').value = '';
        document.getElementById('schedule-deadline').value = '';
    });

    renderSchedules();

    // Populate class select and subject select
    classSelect.innerHTML = '<option value="">Select Class...</option>';
    Object.keys(classesAndSubjects).forEach(cc => {
        const opt = document.createElement('option'); opt.value = cc; opt.textContent = cc + ' - ' + classesAndSubjects[cc].className; classSelect.appendChild(opt);
    });
    // subjects list: gather unique subject names across classes
    const subjSet = new Set();
    Object.values(classesAndSubjects).forEach(cd => cd.subjects.forEach(s => subjSet.add(s.name)));
    subjectSelect.innerHTML = '<option value="">Select Subject...</option>';
    Array.from(subjSet).forEach(sname => { const o = document.createElement('option'); o.value = sname; o.textContent = sname; subjectSelect.appendChild(o); });

    // show/hide custom selectors based on scope
    if (scopeSelect) scopeSelect.addEventListener('change', function() {
        if (this.value === 'custom') { classWrap.style.display = 'block'; subjectWrap.style.display = 'block'; }
        else { classWrap.style.display = 'none'; subjectWrap.style.display = 'none'; }
    });

    // Calendar month view helpers
    let viewDate = new Date();
    function renderCalendar(monthDate) {
        if (!calContainer) return;
        const schedules = loadSchedules();
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        calMonthYear.textContent = monthDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        // first day of month
        const first = new Date(year, month, 1);
        const startDay = first.getDay(); // 0=Sun
        const daysInMonth = new Date(year, month+1, 0).getDate();

        let html = '<table style="width:100%; border-collapse:collapse;"><thead><tr>';
        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<th style="padding:6px;border-bottom:1px solid #ddd;text-align:left">${d}</th>`);
        html += '</tr></thead><tbody>';

        let day = 1 - startDay;
        for (let week=0; week<6; week++) {
            html += '<tr>';
            for (let dow=0; dow<7; dow++) {
                if (day < 1 || day > daysInMonth) {
                    html += '<td style="padding:8px;vertical-align:top;background:#fafafa;height:90px"></td>';
                } else {
                    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    // find schedules that include this date
                    const daySchedules = schedules.filter(s => (new Date(s.start) <= new Date(dateStr)) && (new Date(s.end) >= new Date(dateStr)));
                    let cellHtml = `<div style="font-weight:600;margin-bottom:6px">${day}</div>`;
                    daySchedules.forEach(ds => {
                        // display scope summary
                        const label = ds.scope === 'all' ? `${ds.exam}` : `${ds.exam} (${ds.class || ''} ${ds.subject || ''})`;
                        cellHtml += `<div style="background:#e9f5ff;border:1px solid #cfeaff;padding:2px 4px;margin-bottom:4px;border-radius:4px;font-size:12px;">${label}</div>`;
                    });
                    html += `<td style="padding:8px;vertical-align:top;height:90px">${cellHtml}</td>`;
                }
                day++;
            }
            html += '</tr>';
            if (day > daysInMonth) break;
        }
        html += '</tbody></table>';
        calContainer.innerHTML = html;
    }

    if (calPrev) calPrev.addEventListener('click', () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderCalendar(viewDate); });
    if (calNext) calNext.addEventListener('click', () => { viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderCalendar(viewDate); });
    renderCalendar(viewDate);
}

// Notifications: store per-user notifications in localStorage
function notifyRelevantTeachersAboutSchedule(schedule) {
    // schedule.scope: 'all' or 'custom'
    const schedId = schedule.createdAt ? ('sched_' + schedule.createdAt) : ('sched_' + Date.now());
    if (schedule.scope === 'all') {
        for (const [username, userData] of Object.entries(usersDatabase)) {
            if (userData.role === 'teacher') {
                const key = `notifications_${username}`;
                const raw = localStorage.getItem(key);
                let notes = [];
                try { notes = raw ? JSON.parse(raw) : []; } catch(e){ notes = []; }
                notes.unshift({ id: schedId, exam: schedule.exam, start: schedule.start, end: schedule.end, deadline: schedule.deadline, message: `${schedule.exam} scheduled ${schedule.start} → ${schedule.end}. Upload deadline ${schedule.deadline}. Please pick a date within the window.`, createdAt: schedule.createdAt || new Date().toISOString(), read: false });
                localStorage.setItem(key, JSON.stringify(notes));
            }
        }
    } else if (schedule.scope === 'custom') {
        // notify teachers teaching the subject OR assigned to class
        for (const [username, userData] of Object.entries(usersDatabase)) {
            if (userData.role !== 'teacher') continue;
            let notify = false;
            if (schedule.class && userData.assignedClasses && userData.assignedClasses.includes(schedule.class)) notify = true;
            if (schedule.subject && userData.assignedSubject === schedule.subject) notify = true;
            if (notify) {
                const key = `notifications_${username}`;
                const raw = localStorage.getItem(key);
                let notes = [];
                try { notes = raw ? JSON.parse(raw) : []; } catch(e){ notes = []; }
                notes.unshift({ id: schedId, exam: schedule.exam, start: schedule.start, end: schedule.end, deadline: schedule.deadline, message: `${schedule.exam} scheduled ${schedule.start} → ${schedule.end} for ${schedule.class || schedule.subject}. Upload deadline ${schedule.deadline}. Please pick a date within the window.`, createdAt: schedule.createdAt || new Date().toISOString(), read: false });
                localStorage.setItem(key, JSON.stringify(notes));
            }
        }
    }
}

// Helpers for teacher notifications and selections
function getNotificationsForUser(username) {
    const raw = localStorage.getItem(`notifications_${username}`);
    try { return raw ? JSON.parse(raw) : []; } catch(e){ return []; }
}

function saveNotificationsForUser(username, notes) {
    localStorage.setItem(`notifications_${username}`, JSON.stringify(notes || []));
}

function getTeacherSelections(username) {
    const raw = localStorage.getItem(`teacherSelections_${username}`);
    try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
}

function saveTeacherSelections(username, obj) {
    localStorage.setItem(`teacherSelections_${username}`, JSON.stringify(obj || {}));
}

// Global selections (schedule -> { teacher, date }) to ensure uniqueness across teachers
function globalSelectionsKey() { return 'globalScheduleSelections'; }
function getGlobalSelections() {
    const raw = localStorage.getItem(globalSelectionsKey());
    try { return raw ? JSON.parse(raw) : {}; } catch(e) { return {}; }
}
function saveGlobalSelections(obj) {
    try { localStorage.setItem(globalSelectionsKey(), JSON.stringify(obj || {})); } catch(e) { console.warn('Could not save global selections', e); }
}

// Render teacher notifications and allow picking dates for scheduled exams
function renderTeacherNotificationsAndSelections(username) {
    if (!username) return;
    const notes = getNotificationsForUser(username);
    const selections = getTeacherSelections(username);

    // Create or update a notifications area in teacher view
    let notifArea = document.getElementById('teacher-notifications');
    if (!notifArea) {
        notifArea = document.createElement('div');
        notifArea.id = 'teacher-notifications';
        notifArea.style.margin = '12px 0';
        const teacherView = document.getElementById('teacher-view');
        if (teacherView) teacherView.insertBefore(notifArea, teacherView.querySelector('.upload-section'));
    }
    notifArea.innerHTML = '<h3>Notifications & Scheduling</h3>';

    if (notes.length === 0) {
        notifArea.innerHTML += '<div style="color:#666">No notifications.</div>';
    } else {
        const list = document.createElement('div');
        notes.forEach(n => {
            const div = document.createElement('div');
            div.style.border = '1px solid #eee';
            div.style.padding = '8px';
            div.style.marginBottom = '8px';
            div.innerHTML = `<div style="font-weight:600">${n.exam}</div><div style="color:#444">${n.message}</div><div style="font-size:0.9em;color:#666;margin-top:6px">Scheduled: ${n.start} → ${n.end} · Upload by: ${n.deadline}</div>`;

            // Use global selections to ensure uniqueness across teachers
            const global = getGlobalSelections();
            const globalEntry = global[n.id];
            const selectionsObj = selections || {};
            if (globalEntry) {
                if (globalEntry.teacher === username) {
                    // teacher picked this one
                    div.innerHTML += `<div style="margin-top:8px;color:var(--christ-blue)">Selected date: ${globalEntry.date} (you)</div>`;
                } else {
                    div.innerHTML += `<div style="margin-top:8px;color:#666">Selected by <strong>${globalEntry.teacher}</strong>: ${globalEntry.date}</div>`;
                }
            } else {
                // Not yet picked by any teacher — allow picking but check again at click
                const pickDiv = document.createElement('div');
                pickDiv.style.marginTop = '8px';
                const input = document.createElement('input');
                input.type = 'date';
                input.min = n.start;
                input.max = n.end;
                input.style.marginRight = '8px';
                const btn = document.createElement('button');
                btn.textContent = 'Pick Date';
                btn.className = 'btn-submit';
                btn.addEventListener('click', function() {
                    if (!input.value) return alert('Select a date within the scheduled window.');
                    // Re-check global selections to prevent race conditions
                    const g = getGlobalSelections();
                    if (g[n.id]) return alert('This schedule has already been picked by ' + g[n.id].teacher + ' on ' + g[n.id].date + '. Please coordinate with them or pick another schedule.');
                    // Save selection globally and per-user for compatibility
                    g[n.id] = { teacher: username, date: input.value };
                    saveGlobalSelections(g);
                    const obj = getTeacherSelections(username);
                    obj[n.id] = input.value;
                    saveTeacherSelections(username, obj);
                    alert('Date selected: ' + input.value + '. Please ensure you upload marks before the deadline.');
                    renderTeacherNotificationsAndSelections(username);
                });
                pickDiv.appendChild(input);
                pickDiv.appendChild(btn);
                div.appendChild(pickDiv);
            }

            list.appendChild(div);
        });
        notifArea.appendChild(list);
    }
}

// HOD Dashboard - Manage teacher assignments to subjects and classes
function renderHODDashboard(user) {
    document.getElementById('hod-view').style.display = 'block';
    document.getElementById('hod-info').textContent = 
        `Welcome, ${user.name}! Manage teacher assignments to subjects and classes.`;
    
    const container = document.getElementById('hod-teachers-container');
    container.innerHTML = '';

    // Populate HOD teacher selector
    const hodTeacherSelect = document.getElementById('hod-teacher-select');
    hodTeacherSelect.innerHTML = '<option value="">Select Teacher...</option>';

    for (const [username, userData] of Object.entries(usersDatabase)) {
        if (userData.role === 'teacher') {
            const opt = document.createElement('option');
            opt.value = username;
            opt.textContent = `${userData.name} (${username})`;
            hodTeacherSelect.appendChild(opt);

            // Display teacher card
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.style.padding = '12px';
            card.style.border = '2px solid #002147';
            card.style.borderRadius = '4px';
            card.style.marginBottom = '8px';
            card.style.background = '#f8f9fa';
            card.innerHTML = `
                <h4 style="margin-bottom: 8px;">${userData.name}</h4>
                <p style="margin: 4px 0; font-size: 0.9em;">
                    <strong>Subject:</strong> <span style="color: #002147;">${userData.assignedSubject || 'Not Assigned'}</span><br>
                    <strong>Classes:</strong> <span style="color: #002147;">${(userData.assignedClasses || []).join(', ') || 'Not Assigned'}</span>
                </p>
                <button class="change-assignment-btn" data-username="${username}" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Change Assignment</button>
            `;
            container.appendChild(card);
        }
    }

    // Populate list of unassigned subjects so HOD can easily pick and assign
    const unassignedContainer = document.getElementById('hod-unassigned-container');
    if (unassignedContainer) {
        unassignedContainer.innerHTML = '';
        for (const [cc, cd] of Object.entries(classesAndSubjects)) {
            cd.subjects.forEach(sub => {
                const teacherLabel = (sub.teacher || '').toString().toLowerCase();
                if (!sub.teacher || teacherLabel.includes('unassign') || teacherLabel === 'not assigned') {
                    const item = document.createElement('div');
                    item.className = 'unassigned-card';
                    item.style.padding = '8px';
                    item.style.border = '1px dashed #ccc';
                    item.style.borderRadius = '4px';
                    item.style.marginBottom = '8px';
                    item.style.background = '#fff';
                    item.innerHTML = `
                        <strong>${sub.name}</strong>
                        <div style="font-size:0.9em;color:#666;">${cc} - ${cd.className}</div>
                        <div style="margin-top:8px;"><button class="assign-subject-btn" data-class="${cc}" data-subject="${sub.name}" style="padding:6px 10px;background:var(--christ-blue);color:#fff;border:none;border-radius:4px;cursor:pointer;">Assign</button></div>
                    `;
                    unassignedContainer.appendChild(item);
                }
            });
        }
    }

    attachHODEventListeners();
    // Render schedules and calendar for HOD (read-only)
    renderHODSchedulesAndCalendar();
}

// Render schedules and calendar for HOD (read-only)
function renderHODSchedulesAndCalendar() {
    // Schedules list
    const schedulesList = document.getElementById('hod-schedules-list');
    if (schedulesList) {
        const schedules = loadSchedules();
        schedulesList.innerHTML = '';
        if (schedules.length === 0) schedulesList.innerHTML = '<div style="color:#666">No schedules created.</div>';
        schedules.forEach((s) => {
            const el = document.createElement('div');
            el.style.padding = '8px';
            el.style.border = '1px solid #e0e0e0';
            el.style.borderRadius = '4px';
            el.style.marginBottom = '8px';
            const scopeInfo = s.scope === 'all' ? 'All classes' : (`Class: ${s.class || 'N/A'} · Subject: ${s.subject || 'N/A'}`);
            el.innerHTML = `<strong>${s.exam}</strong> &middot; ${s.start} → ${s.end} &middot; Upload by: ${s.deadline} &middot; ${scopeInfo}`;
            schedulesList.appendChild(el);
        });
    }

    // Calendar month view (copy logic from initSchedulingUI, but use HOD elements)
    const calPrev = document.getElementById('hod-cal-prev');
    const calNext = document.getElementById('hod-cal-next');
    const calMonthYear = document.getElementById('hod-cal-month-year');
    const calContainer = document.getElementById('hod-schedule-calendar');
    if (!calPrev || !calNext || !calMonthYear || !calContainer) return;

    // Calendar state
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();

    function renderCalendar(month, year) {
        calMonthYear.textContent = `${year} - ${String(month+1).padStart(2,'0')}`;
        // First day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month+1, 0);
        let html = '<table class="calendar-table" style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr>';
        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<th>${d}</th>`);
        html += '</tr></thead><tbody><tr>';
        let dayOfWeek = firstDay.getDay();
        for (let i=0; i<dayOfWeek; i++) html += '<td></td>';
        for (let d=1; d<=lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            // Find schedules for this date
            const daySchedules = loadSchedules().filter(s => dateStr >= s.start && dateStr <= s.end);
            html += `<td style="vertical-align:top;min-width:80px;max-width:120px;padding:4px;border:1px solid #eee;${daySchedules.length ? 'background:rgba(0, 33, 71, 0.05);' : ''}">`;
            html += `<div style="font-weight:600;">${d}</div>`;
            daySchedules.forEach(s => {
                html += `<div style="font-size:11px;color:var(--christ-blue);margin-top:2px;border-radius:3px;padding:2px 4px;background:rgba(0, 33, 71, 0.1);">${s.exam}<br><span style="font-size:10px;color:#555;">${s.scope==='all'?'All':s.class+'-'+s.subject}</span></div>`;
                try {
                    const global = getGlobalSelections();
                    const sk = s.createdAt ? ('sched_' + s.createdAt) : null;
                    if (sk && global[sk]) {
                        const info = global[sk];
                        html += `<div style="font-size:11px;color:#333;margin-top:4px;padding:2px 4px;border-radius:3px;background:#fff8e1;">Picked: ${info.date} by ${info.teacher}</div>`;
                    }
                } catch(e) { /* ignore */ }
            });
            html += '</td>';
            if ((dayOfWeek+d)%7===0) html += '</tr><tr>';
        }
        html += '</tr></tbody></table>';
        calContainer.innerHTML = html;
    }

    renderCalendar(currentMonth, currentYear);
    calPrev.onclick = function() {
        currentMonth--;
        if (currentMonth<0) { currentMonth=11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    };
    calNext.onclick = function() {
        currentMonth++;
        if (currentMonth>11) { currentMonth=0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    };
// End of renderHODSchedulesAndCalendar
}

// Helper: Attach event listeners for IT Admin functions
function attachITAdminEventListeners() {
    const createBtn = document.getElementById('create-teacher-btn');
    const cancelBtn = document.getElementById('cancel-teacher-btn');
    const form = document.getElementById('teacher-management-form');

    if (createBtn) {
        createBtn.addEventListener('click', function() {
            document.getElementById('teacher-form-section').style.display = 'block';
            document.getElementById('form-title').textContent = 'Create New Teacher Profile';
            form.reset();
            form.setAttribute('data-mode', 'create');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.getElementById('teacher-form-section').style.display = 'none';
        });
    }

    if (form) {
        form.addEventListener('submit', handleTeacherFormSubmit);
    }

    // Edit teacher buttons
    document.querySelectorAll('.edit-teacher-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            const userData = usersDatabase[username];
            if (!userData) return;

            document.getElementById('form-title').textContent = `Edit Teacher: ${userData.name}`;
            document.getElementById('teacher-name-input').value = userData.name;
            document.getElementById('teacher-username-input').value = username;
            document.getElementById('teacher-username-input').disabled = true;
            document.getElementById('teacher-password-input').value = userData.password || '';
            // Keep assignment empty here; HOD will assign subjects/classes
            
            form.setAttribute('data-mode', 'edit');
            form.setAttribute('data-username', username);
            document.getElementById('teacher-form-section').style.display = 'block';
        });
    });

    // Delete teacher buttons
    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            if (confirm(`Delete teacher ${usersDatabase[username].name}?`)) {
                delete usersDatabase[username];
                renderITAdminDashboard(getCurrentUser());
            }
        });
    });
}

// Helper: Attach event listeners for HOD functions
function attachHODEventListeners() {
    const form = document.getElementById('hod-assignment-form');
    const cancelBtn = document.getElementById('cancel-assignment-btn');
    const teacherSelect = document.getElementById('hod-teacher-select');

    if (teacherSelect) {
        teacherSelect.addEventListener('change', function() {
            const username = this.value;
            if (!username) {
                document.getElementById('hod-subject-input').value = '';
                document.getElementById('hod-class-input').value = '';
                return;
            }

            const userData = usersDatabase[username];
            document.getElementById('hod-subject-input').value = userData.assignedSubject || 'Not Assigned';
            document.getElementById('hod-class-input').value = (userData.assignedClasses && userData.assignedClasses[0]) || 'Not Assigned';
        });
    }

    if (form) {
        form.addEventListener('submit', handleHODAssignmentSubmit);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            document.getElementById('hod-assignment-form-section').style.display = 'none';
        });
    }

    // Change assignment buttons
    document.querySelectorAll('.change-assignment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            document.getElementById('hod-teacher-select').value = username;
            document.getElementById('hod-teacher-select').dispatchEvent(new Event('change'));
            document.getElementById('hod-assignment-form-section').style.display = 'block';
        });
    });

    // Assign button for unassigned subjects
    document.querySelectorAll('.assign-subject-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const classCode = this.getAttribute('data-class');
            const subject = this.getAttribute('data-subject');
            const newSubjectSelect = document.getElementById('hod-new-subject-select');
            const newClassSelect = document.getElementById('hod-new-class-select');
            if (newSubjectSelect) newSubjectSelect.value = subject;
            if (newClassSelect) newClassSelect.value = classCode;
            // Show assignment form and focus teacher select so HOD can pick a teacher
            document.getElementById('hod-assignment-form-section').style.display = 'block';
            const teacherSelect = document.getElementById('hod-teacher-select');
            if (teacherSelect) teacherSelect.focus();
        });
    });
}

// Handle teacher form submission
function handleTeacherFormSubmit(e) {
    e.preventDefault();
    const mode = e.target.getAttribute('data-mode');
    const name = document.getElementById('teacher-name-input').value;
    const username = document.getElementById('teacher-username-input').value;
    const password = document.getElementById('teacher-password-input').value;

    if (!password || !username || !name) {
        alert('Please provide name, username and password');
        return;
    }

    if (mode === 'create') {
        if (usersDatabase[username]) {
            alert('Username already exists!');
            return;
        }
        // New teacher created without assigned subject/classes; HOD will assign
        usersDatabase[username] = {
            password: password,
            role: 'teacher',
            name: name,
            assignedSubject: '',
            assignedClasses: []
        };
    } else if (mode === 'edit') {
        const editUsername = e.target.getAttribute('data-username');
        const userData = usersDatabase[editUsername];
        if (!userData) {
            alert('User not found for edit');
            return;
        }
        userData.name = name;
        userData.password = password;
    }

    alert(mode === 'create' ? 'Teacher profile saved successfully!' : 'Teacher profile updated successfully!');
    document.getElementById('teacher-form-section').style.display = 'none';
    document.getElementById('teacher-username-input').disabled = false;
    e.target.reset();
    renderITAdminDashboard(getCurrentUser());
}

// Handle HOD assignment submission
function handleHODAssignmentSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('hod-teacher-select').value;
    const newSubject = document.getElementById('hod-new-subject-select').value;
    const newClass = document.getElementById('hod-new-class-select').value;

    if (!username || !newSubject || !newClass) {
        alert('Please select all fields!');
        return;
    }

    const userData = usersDatabase[username];
    userData.assignedSubject = newSubject;
    userData.assignedClasses = [newClass];

    alert('Teacher assignment updated successfully!');
    document.getElementById('hod-assignment-form-section').style.display = 'none';
    e.target.reset();
    renderHODDashboard(getCurrentUser());
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    // Home button: return to role main view from any subpage
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            // hide any detail/dashboard panels
            const dashboardPanel = document.getElementById('dashboard');
            if (dashboardPanel) dashboardPanel.style.display = 'none';

            // hide form sections
            const teacherForm = document.getElementById('teacher-form-section');
            if (teacherForm) teacherForm.style.display = 'none';
            const hodForm = document.getElementById('hod-assignment-form-section');
            if (hodForm) hodForm.style.display = 'none';

            // Call initialize to show the user's main role view
            initializeDashboard();
            window.scrollTo(0,0);
        });
    }
});
