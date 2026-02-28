// Global variables for charts
let riskChart;
let binsChart;
let studentChart;

// Helper to get the currently active assessment from the tabs
function getActiveAssessment() {
    const activeTab = document.querySelector('#assessment-tabs .tab-btn.active');
    return activeTab ? activeTab.getAttribute('data-assessment') : 'CIA 1';
}

// Utility functions
function calculateStats(scores) {
    if (scores.length === 0) return { min: 0, max: 0, avg: 0, stdev: 0 };

    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Standard deviation
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    const stdev = Math.sqrt(variance);

    return { min: min.toFixed(2), max: max.toFixed(2), avg: avg.toFixed(2), stdev: stdev.toFixed(2) };
}

function getBinCounts(scores, totalValid) {
    const bins = {
        '90': { count: 0, range: '>=90%' },
        '85': { count: 0, range: '85% - 89%' },
        '80': { count: 0, range: '80% - 84%' },
        '75': { count: 0, range: '75% - 79%' },
        '70': { count: 0, range: '70% - 74%' },
        '65': { count: 0, range: '65% - 69%' },
        '60': { count: 0, range: '60% - 64%' },
        '50': { count: 0, range: '50% - 59%' },
        '40': { count: 0, range: '40% - 49%' },
        'below40': { count: 0, range: '< 40%' }
    };

    scores.forEach(score => {
        if (score >= 90) bins['90'].count++;
        else if (score >= 85) bins['85'].count++;
        else if (score >= 80) bins['80'].count++;
        else if (score >= 75) bins['75'].count++;
        else if (score >= 70) bins['70'].count++;
        else if (score >= 65) bins['65'].count++;
        else if (score >= 60) bins['60'].count++;
        else if (score >= 50) bins['50'].count++;
        else if (score >= 40) bins['40'].count++;
        else bins['below40'].count++;
    });

    // Calculate percentages
    Object.keys(bins).forEach(key => {
        const pct = totalValid > 0 ? ((bins[key].count / totalValid) * 100).toFixed(1) : 0;
        bins[key].percentage = pct + '%';
    });

    return bins;
}

function getRiskCounts(scores) {
    const risks = { high: 0, medium: 0, low: 0 };
    scores.forEach(score => {
        if (score < 60) risks.high++;
        else if (score < 80) risks.medium++;
        else risks.low++;
    });
    return risks;
}

function getCriteria(avgPct, risks, totalValid) {
    const highRiskPct = totalValid > 0 ? ((risks.high / totalValid) * 100).toFixed(1) : 0;
    if (avgPct >= 85) return { label: 'EXCELLENT', class: 'excellent', reason: `Outstanding performance (avg ${avgPct.toFixed(1)}%, ${highRiskPct}% high risk). All students are performing well above expectations. Continue with advanced topics and enrichment activities.` };
    else if (avgPct >= 70) return { label: 'MONITOR', class: 'monitor', reason: `Good overall performance (avg ${avgPct.toFixed(1)}%, ${highRiskPct}% high risk), but some students need attention. Focus on medium-risk students (60-80%) to prevent decline. Implement targeted support for improvement.` };
    else if (avgPct >= 60) return { label: 'SATISFACTORY', class: 'satisfactory', reason: `Acceptable performance (avg ${avgPct.toFixed(1)}%, ${highRiskPct}% high risk) with room for growth. High-risk students (<60%) require immediate intervention. Review teaching methods and provide remedial sessions.` };
    else return { label: 'CRITICAL', class: 'critical', reason: `Poor performance (avg ${avgPct.toFixed(1)}%, ${highRiskPct}% high risk) indicating serious issues. Majority in high risk; low average suggests foundational gaps. Urgent actions needed: reassess curriculum, conduct one-on-one tutoring, and parental involvement.` };
}

// Display Excel data in table
function displayExcelDataTable(data, subject, assessment) {
    const table = document.getElementById('data-display-table');
    if (!table) return;

    // Filter data by subject and assessment if columns exist
    let displayData = data;
    if (data.length > 0) {
        if (data[0].hasOwnProperty('Subject')) {
            displayData = displayData.filter(row => row.Subject && row.Subject.toString().trim().toLowerCase() === subject.toLowerCase());
        }
        if (assessment && data[0].hasOwnProperty('Assessment')) {
            displayData = displayData.filter(row => row.Assessment && row.Assessment.toString().trim().toLowerCase() === assessment.toLowerCase());
        }
    }

    if (displayData.length === 0) {
        table.querySelector('tbody').innerHTML = '';
        return;
    }

    // Get column headers from first row
    const headers = Object.keys(displayData[0]);
    const thead = table.querySelector('thead tr');
    thead.innerHTML = headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">${h}</th>`).join('');

    // Populate body rows
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = displayData.map((row, idx) => {
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9f9f9';
        return `<tr style="background: ${bgColor};">` + headers.map(h => {
            const val = row[h] !== null && row[h] !== undefined ? row[h].toString() : '-';
            return `<td style="border: 1px solid #ddd; padding: 8px;">${val}</td>`;
        }).join('') + '</tr>';
    }).join('');
}

// Show/hide upload and data table sections
function setUploadSectionVisibility(isAssessmentView) {
    const uploadSection = document.getElementById('upload-section');
    const dataSection = document.getElementById('data-display-section');
    if (uploadSection) uploadSection.style.display = isAssessmentView ? 'block' : 'none';
    if (dataSection) dataSection.style.display = isAssessmentView ? 'block' : 'none';
}

// Main processing function
function processData(subject, data, maxMarks, assessment = null, classCode = null) {
    if (!maxMarks || maxMarks <= 0) {
        alert('Max Marks must be a positive number.');
        return;
    }

    let subjectData = data;

    // If 'Subject' column exists, filter by the input subject
    if (data.length > 0 && data[0].hasOwnProperty('Subject')) {
        subjectData = data.filter(row => row.Subject && row.Subject.toString().trim().toLowerCase() === subject.toLowerCase());
        console.log(`Filtered data for subject '${subject}':`, subjectData.length, 'rows');
    }

    // If Assessment column exists and assessment specified, filter by assessment
    if (assessment && subjectData.length > 0 && subjectData[0].hasOwnProperty('Assessment')) {
        subjectData = subjectData.filter(row => row.Assessment && row.Assessment.toString().trim().toLowerCase() === assessment.toLowerCase());
        console.log(`Filtered data for assessment '${assessment}':`, subjectData.length, 'rows');
    }

    if (subjectData.length === 0) {
        alert('No data found for the selected subject in the Excel sheet.');
        return;
    }

    const notAttended = subjectData.filter(row => 
        !row.Marks || row.Marks.toString().toLowerCase().trim() === 'ab'
    ).length;

    const scores = subjectData
        .filter(row => row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab')
        .map(row => {
            const mark = parseFloat(row.Marks);
            return isNaN(mark) ? 0 : mark;
        })
        .filter(score => score > 0);

    const totalValid = scores.length;
    const stats = calculateStats(scores);
    const percentages = scores.map(score => (score / maxMarks) * 100);
    const bins = getBinCounts(percentages, totalValid);
    const risks = getRiskCounts(percentages);
    const avgPct = totalValid > 0 ? (parseFloat(stats.avg) / maxMarks) * 100 : 0;
    const criteria = getCriteria(avgPct, risks, totalValid);

    // Update dashboard title
    document.getElementById('selected-subject').textContent = subject;
    document.getElementById('dashboard-title').style.display = 'block';

    // Update stats table (raw scores)
    document.getElementById('not-attended').textContent = notAttended;
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${stats.avg} / ${maxMarks} (${avgPct.toFixed(1)}%)`;

    // Update bins table
    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Handle critical students if CRITICAL
    const criticalStudentsEl = document.getElementById('critical-students');
    const lowStudentsBody = document.getElementById('low-students-body');
    if (criteria.label === 'CRITICAL') {
        // Filter low performers <20
        const lowPerformers = subjectData
            .filter(row => {
                const mark = parseFloat(row.Marks);
                return row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab' && !isNaN(mark) && mark < 20;
            })
            .map(row => ({
                roll: row['Roll No'] || 'N/A',
                name: row.Name || 'N/A',
                score: parseFloat(row.Marks).toFixed(2)
            }));

        lowStudentsBody.innerHTML = '';
        if (lowPerformers.length > 0) {
            lowPerformers.forEach(student => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${student.roll}</td><td>${student.name}</td><td>${student.score}</td>`;
                lowStudentsBody.appendChild(tr);
            });
            criticalStudentsEl.style.display = 'block';
        } else {
            criticalStudentsEl.style.display = 'none';
        }
    } else {
        criticalStudentsEl.style.display = 'none';
    }

    // Update risk chart
    const ctx = document.getElementById('risk-chart').getContext('2d');
    if (riskChart) riskChart.destroy();
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High Risk (<60%)', 'Medium Risk (60-80%)', 'Low Risk (>80%)'],
            datasets: [{
                label: 'Student Count',
                data: [risks.high, risks.medium, risks.low],
                backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Risk Distribution' }
            }
        }
    });

    // Update bins chart
    const binsCtx = document.getElementById('bins-chart').getContext('2d');
    if (binsChart) {
        binsChart.destroy();
        binsChart = null;
    }
    const binLabels = Object.keys(bins).map(key => bins[key].range);
    const binCounts = Object.keys(bins).map(key => bins[key].count);
    const binColors = ['#28a745', '#28a745', '#28a745', '#ffc107', '#ffc107', '#ffc107', '#ffc107', '#dc3545', '#dc3545', '#dc3545'];
    binsChart = new Chart(binsCtx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Student Count',
                data: binCounts,
                backgroundColor: binColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Performance Bins Distribution' }
            }
        }
    });

    // Update student marks chart
    const studentCtx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) {
        studentChart.destroy();
        studentChart = null;
    }

    // Prepare student data
    const validRows = subjectData
        .filter(row => row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab')
        .map(row => {
            const score = parseFloat(row.Marks);
            return {
                roll: row['Roll No'] || row.Name || 'Unknown',
                name: row.Name || 'Unknown',
                score: isNaN(score) ? 0 : score
            };
        })
        .filter(item => item.score > 0);

    const studentLabels = validRows.map(item => item.roll);
    const studentScores = validRows.map(item => item.score);
    const studentColors = studentScores.map(score => score < 20 ? '#dc3545' : score < 50 ? '#ffc107' : '#28a745');

    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: {
            labels: studentLabels,
            datasets: [
                {
                    label: 'Student Scores',
                    data: studentScores,
                    backgroundColor: studentColors,
                    borderWidth: 1
                },
                {
                    label: 'Passing Mark (20)',
                    data: Array(studentLabels.length).fill(20),
                    type: 'line',
                    borderColor: '#002147',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: maxMarks,
                    title: { display: true, text: 'Marks' }
                },
                x: {
                    title: { display: true, text: 'Students' }
                }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: 'Individual Student Marks with Passing Line' }
            }
        }
    });

    // --- Learner classification (Proactive / Reactive) ---
    // New rule: students with percentage < 30% are Reactive; all others are Proactive.
    const REACTIVE_PERCENT_THRESHOLD = 30; // percent

    // Build subjectData rows with computed percentage and preserve Roll No/Name
    const enriched = subjectData.map(row => {
        const markRaw = row.Marks;
        let mark = null;
        if (markRaw && markRaw.toString().toLowerCase().trim() !== 'ab') {
            const m = parseFloat(markRaw);
            mark = isNaN(m) ? null : m;
        }
        const pct = (mark !== null && maxMarks > 0) ? ((mark / maxMarks) * 100) : null;
        return {
            roll: row['Roll No'] || row.Roll || row['RollNo'] || 'N/A',
            name: row.Name || row['Name'] || 'N/A',
            mark: mark,
            pct: pct,
            raw: row
        };
    });

    const reactive = enriched.filter(s => s.pct !== null && s.pct < REACTIVE_PERCENT_THRESHOLD);
    const proactive = enriched.filter(s => !(s.pct !== null && s.pct < REACTIVE_PERCENT_THRESHOLD));

    // If the page has the classification updater (integrated local classroom UI), call it
    try {
        if (typeof window !== 'undefined' && typeof window.updateClassificationFromAssessment === 'function') {
            const assessmentRows = enriched.map(e => ({ Roll: e.roll, Name: e.name, Score: e.mark || 0 }));
            // call asynchronously (do not block the dashboard rendering)
            setTimeout(() => { window.updateClassificationFromAssessment(assessmentRows, maxMarks, assessment); }, 10);
        }
    } catch (e) {
        console.warn('classification update hook failed', e);
    }

    // Show/hide upload section based on whether viewing a specific assessment
    const isAssessmentView = assessment !== null && assessment !== 'Overall';
    setUploadSectionVisibility(isAssessmentView);

    // Display Excel data table if assessment view
    if (isAssessmentView) {
        displayExcelDataTable(data, subject, assessment);
    }

    // Scroll to dashboard
    document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
}

// Show aggregated class performance for a selected assessment
function showClassPerformance(classCode, assessment, maxMarksPerSubject) {
    // Generate sample class data for the assessment
    const data = generateClassAssessmentData(classCode, assessment);
    if (!data || data.length === 0) {
        alert('No data available for class/assessment.');
        return;
    }

    // Aggregate per student across all subjects for this assessment
    const map = {};
    const subjects = classesAndSubjects[classCode].subjects;
    const subjectCount = subjects.length;

    data.forEach(row => {
        const roll = row['Roll No'];
        const mark = (row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab') ? parseFloat(row.Marks) : 0;
        if (!map[roll]) map[roll] = { roll: roll, name: row.Name || '', total: 0, presentCount: 0 };
        map[roll].total += isNaN(mark) ? 0 : mark;
        if (row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab') map[roll].presentCount++;
    });

    const rows = Object.values(map).map(item => {
        const maxTotal = subjectCount * maxMarksPerSubject;
        const percent = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
        return { roll: item.roll, name: item.name, total: item.total, percentage: percent };
    });

    // Reuse charts: compute stats on percentage values
    const percentages = rows.map(r => r.percentage);
    const stats = calculateStats(percentages.map(p => (p / 100) * maxMarksPerSubject));
    const totalValid = percentages.length;
    const bins = getBinCounts(percentages, totalValid);
    const risks = getRiskCounts(percentages);
    const avgPct = totalValid > 0 ? (percentages.reduce((a,b)=>a+b,0)/totalValid) : 0;
    const criteria = getCriteria(avgPct, risks, totalValid);

    // Update UI
    document.getElementById('selected-subject').textContent = `${classCode} - Class Performance (${assessment})`;
    document.getElementById('dashboard-title').style.display = 'block';

    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${avgPct.toFixed(1)}% (avg across subjects)`;

    // Update bins table counts from bins (already percentage-based)
    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Risk chart
    const ctx = document.getElementById('risk-chart').getContext('2d');
    if (riskChart) riskChart.destroy();
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High Risk (<60%)', 'Medium Risk (60-80%)', 'Low Risk (>80%)'],
            datasets: [{ label: 'Student Count', data: [risks.high, risks.medium, risks.low], backgroundColor: ['#dc3545', '#ffc107', '#28a745'] }]
        },
        options: { indexAxis: 'y', responsive: true }
    });

    // Student percentage chart
    const studentCtx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) studentChart.destroy();
    const labels = rows.map(r => r.roll);
    const dataSet = rows.map(r => r.percentage);
    const colors = dataSet.map(p => p < 40 ? '#dc3545' : p < 70 ? '#ffc107' : '#28a745');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Aggregated %', data: dataSet, backgroundColor: colors }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('dashboard').style.display = 'block';
}

// Show overall class performance across all assessments
function showOverallClassPerformance(classCode) {
    const rows = generateOverallClassData(classCode);
    if (!rows || rows.length === 0) {
        alert('No overall data available for this class.');
        return;
    }

    const percentages = rows.map(r => r.Percentage);
    const stats = calculateStats(percentages.map(p => (p / 100) * 100));
    const totalValid = percentages.length;
    const bins = getBinCounts(percentages, totalValid);
    const risks = getRiskCounts(percentages);
    const avgPct = totalValid > 0 ? (percentages.reduce((a,b)=>a+b,0)/totalValid) : 0;

    document.getElementById('selected-subject').textContent = `${classCode} - Overall Performance (All Exams)`;
    document.getElementById('dashboard-title').style.display = 'block';
    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${avgPct.toFixed(1)}% (averaged across all exams)`;

    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Risk chart
    const ctx = document.getElementById('risk-chart').getContext('2d');
    if (riskChart) riskChart.destroy();
    riskChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['High Risk (<60%)', 'Medium Risk (60-80%)', 'Low Risk (>80%)'], datasets: [{ label: 'Student Count', data: [risks.high, risks.medium, risks.low], backgroundColor: ['#dc3545', '#ffc107', '#28a745'] }] },
        options: { indexAxis: 'y', responsive: true }
    });

    // Student chart
    const studentCtx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) studentChart.destroy();
    const labels = rows.map(r => r['Roll No']);
    const dataSet = rows.map(r => r.Percentage);
    const colors = dataSet.map(p => p < 40 ? '#dc3545' : p < 70 ? '#ffc107' : '#28a745');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Overall %', data: dataSet, backgroundColor: colors }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('dashboard').style.display = 'block';
}

// Show assessment dashboard aggregated across all classes (class averages per assessment)
function showAssessmentDashboardForAllClasses(assessment) {
    const classCodes = Object.keys(classesAndSubjects);
    const labels = [];
    const averages = [];

    classCodes.forEach(cc => {
        const data = generateClassAssessmentData(cc, assessment);
        if (!data || data.length === 0) {
            labels.push(cc);
            averages.push(0);
            return;
        }

        // For each student compute total across subjects then average percentage
        const map = {};
        const classInfo = classesAndSubjects[cc];
        const subjectCount = classInfo.subjects.length;
        const maxPerSubject = classInfo.subjects[0] ? classInfo.subjects[0].maxMarks : 100;

        data.forEach(row => {
            const roll = row['Roll No'];
            const mark = (row.Marks && row.Marks.toString().toLowerCase().trim() !== 'ab') ? parseFloat(row.Marks) : 0;
            if (!map[roll]) map[roll] = { total: 0, count: 0 };
            map[roll].total += isNaN(mark) ? 0 : mark;
            map[roll].count += 1;
        });

        const studentPercents = Object.values(map).map(item => {
            const maxTotal = subjectCount * maxPerSubject;
            return maxTotal > 0 ? (item.total / maxTotal) * 100 : 0;
        });

        const classAvg = studentPercents.length > 0 ? (studentPercents.reduce((a,b)=>a+b,0)/studentPercents.length) : 0;
        labels.push(cc);
        averages.push(parseFloat(classAvg.toFixed(2)));
    });

    // Render chart showing average % per class for the assessment
    document.getElementById('selected-subject').textContent = `Class Averages - ${assessment}`;
    document.getElementById('dashboard-title').style.display = 'block';

    // Update stats using averages
    const stats = calculateStats(averages.map(a => (a / 100) * 100));
    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${(averages.reduce((a,b)=>a+b,0)/averages.length || 0).toFixed(1)}% (avg across classes)`;

    // Bins and risk based on averages
    const totalValid = averages.length;
    const bins = getBinCounts(averages, totalValid);
    const risks = getRiskCounts(averages);

    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Chart
    const binsCtx = document.getElementById('bins-chart').getContext('2d');
    if (binsChart) { binsChart.destroy(); binsChart = null; }
    binsChart = new Chart(binsCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: `Class Avg % - ${assessment}`, data: averages, backgroundColor: '#002147' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('dashboard').style.display = 'block';
}

// Show overall performance across all assessments for all classes
function showOverallForAllClasses() {
    const classCodes = Object.keys(classesAndSubjects);
    const labels = [];
    const averages = [];

    classCodes.forEach(cc => {
        const rows = generateOverallClassData(cc);
        const avg = rows.length > 0 ? (rows.reduce((s,r)=>s+(r.Percentage||0),0)/rows.length) : 0;
        labels.push(cc);
        averages.push(parseFloat(avg.toFixed(2)));
    });

    document.getElementById('selected-subject').textContent = `Overall (All Exams) - Class Averages`;
    document.getElementById('dashboard-title').style.display = 'block';

    const stats = calculateStats(averages.map(a => (a / 100) * 100));
    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${(averages.reduce((a,b)=>a+b,0)/averages.length || 0).toFixed(1)}% (avg across classes)`;

    const totalValid = averages.length;
    const bins = getBinCounts(averages, totalValid);
    const risks = getRiskCounts(averages);

    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Chart
    const binsCtx = document.getElementById('bins-chart').getContext('2d');
    if (binsChart) { binsChart.destroy(); binsChart = null; }
    binsChart = new Chart(binsCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: `Overall Class Avg % (All Exams)`, data: averages, backgroundColor: '#20c997' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('dashboard').style.display = 'block';
}

// Show per-assessment breakdown and overall for a single subject in a class
function showSubjectPerformance(classCode, subject) {
    if (!classCode || !subject) return;
    const classInfo = classesAndSubjects[classCode];
    if (!classInfo) {
        alert('Class data not found for ' + classCode);
        return;
    }

    // Per-assessment averages for this subject
    const assessmentLabels = assessments.slice();
    const assessmentAverages = assessmentLabels.map(assess => {
        const rows = generateSampleData(classCode, subject, assess);
        const valid = rows.filter(r => r.Marks && r.Marks.toString().toLowerCase().trim() !== 'ab').map(r => parseFloat(r.Marks) || 0);
        if (valid.length === 0) return 0;
        const avg = valid.reduce((a,b)=>a+b,0)/valid.length;
        const maxMarks = (classInfo.subjects.find(s => s.name === subject) || {}).maxMarks || 100;
        return (avg / maxMarks) * 100;
    });

    // Overall per-student aggregated across assessments for this subject
    const overallRows = generateOverallSubjectData(classCode, subject);
    const studentLabels = overallRows.map(r => r['Roll No']);
    const studentPercents = overallRows.map(r => r.Percentage || 0);

    // Update UI
    document.getElementById('selected-subject').textContent = `${subject} - Subject Performance`;
    document.getElementById('dashboard-title').style.display = 'block';
    document.body.setAttribute('data-current-class', classCode);

    // Stats based on assessment averages
    const stats = calculateStats(assessmentAverages.map(a => (a / 100) * 100));
    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    const overallAvg = assessmentAverages.length > 0 ? (assessmentAverages.reduce((a,b)=>a+b,0)/assessmentAverages.length) : 0;
    document.getElementById('avg-display').textContent = `${overallAvg.toFixed(1)}% (avg across assessments)`;

    // Update bins table using student percentages (overall)
    const totalValid = studentPercents.length;
    const bins = getBinCounts(studentPercents, totalValid);
    const risks = getRiskCounts(studentPercents);

    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Render assessment averages chart in bins-chart canvas
    const binsCtx = document.getElementById('bins-chart').getContext('2d');
    if (binsChart) { binsChart.destroy(); binsChart = null; }
    binsChart = new Chart(binsCtx, {
        type: 'bar',
        data: { labels: assessmentLabels, datasets: [{ label: `${subject} - Avg % per Assessment`, data: assessmentAverages, backgroundColor: '#002147' }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    // Render per-student overall percentages in student-chart
    const studentCtx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) { studentChart.destroy(); studentChart = null; }
    const colors = studentPercents.map(p => p < 40 ? '#dc3545' : p < 70 ? '#ffc107' : '#28a745');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: { labels: studentLabels, datasets: [{ label: `${subject} - Overall % (across assessments)`, data: studentPercents, backgroundColor: colors }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    // Risk chart showing counts of students by risk category for this subject overall
    const riskCtx = document.getElementById('risk-chart').getContext('2d');
    if (riskChart) riskChart.destroy();
    riskChart = new Chart(riskCtx, { type: 'bar', data: { labels: ['High Risk (<60%)','Medium Risk (60-80%)','Low Risk (>80%)'], datasets: [{ label: 'Student Count', data: [risks.high, risks.medium, risks.low], backgroundColor: ['#dc3545','#ffc107','#28a745'] }] }, options: { indexAxis: 'y', responsive: true } });

    document.getElementById('dashboard').style.display = 'block';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('dashboard').style.display = 'none';
            document.getElementById('admin-view').style.display = 'none';
            document.getElementById('classTeacher-view').style.display = 'none';
            document.getElementById('teacher-view').style.display = 'none';
            document.getElementById('itadmin-view').style.display = 'none';
            document.getElementById('hod-view').style.display = 'none';
            
            const user = getCurrentUser();
            if (user.role === 'itadmin') {
                renderITAdminDashboard(user);
            } else if (user.role === 'admin') {
                // Check if this admin is actually a HOD
                if (user.adminRole === 'HOD') {
                    document.getElementById('hod-view').style.display = 'block';
                } else {
                    document.getElementById('admin-view').style.display = 'block';
                }
            } else if (user.role === 'classTeacher') {
                document.getElementById('classTeacher-view').style.display = 'block';
            } else if (user.role === 'hod') {
                document.getElementById('hod-view').style.display = 'block';
            } else if (user.role === 'teacher') {
                document.getElementById('teacher-view').style.display = 'block';
            }
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Attach upload form handlers
    const adminForm = document.getElementById('admin-upload-form');
    if (adminForm) {
        adminForm.addEventListener('submit', handleFileUpload);
    }

    const ctForm = document.getElementById('ct-upload-form');
    if (ctForm) {
        ctForm.addEventListener('submit', handleFileUpload);
    }

    const teacherForm = document.getElementById('teacher-upload-form');
    if (teacherForm) {
        teacherForm.addEventListener('submit', handleFileUpload);
    }

    // Assessment-specific upload form handler
    const assessmentForm = document.getElementById('assessment-upload-form');
    if (assessmentForm) {
        assessmentForm.addEventListener('submit', handleAssessmentFileUpload);
    }

    // Assessment tabs and class/overall buttons in dashboard (if present)
    const assessmentTabsContainer = document.getElementById('assessment-tabs');
    const classPerfBtn = document.getElementById('class-performance-btn');
    const overallPerfBtn = document.getElementById('overall-performance-btn');

    if (assessmentTabsContainer) {
        assessmentTabsContainer.addEventListener('click', function(e) {
            if (!e.target.matches('.tab-btn')) return;

            // Update active state
            assessmentTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // If dashboard is showing a subject, re-run processData with new assessment
            const subject = document.getElementById('selected-subject').textContent;
            if (!subject) return;
            if (subject.includes('Class Performance') || subject.includes('Overall Performance')) return;

            const currentClass = document.body.getAttribute('data-current-class');
            const currentSubject = subject.trim();
            const assessment = e.target.getAttribute('data-assessment');
            if (currentClass) {
                const sampleData = generateSampleData(currentClass, currentSubject, assessment);
                const maxMarks = classesAndSubjects[currentClass].subjects.find(s => s.name === currentSubject).maxMarks;
                processData(currentSubject, sampleData, maxMarks, assessment, currentClass);
            }
        });
    }

    if (classPerfBtn) {
        classPerfBtn.addEventListener('click', function() {
            const currentClass = document.body.getAttribute('data-current-class');
            const assessment = getActiveAssessment();
            if (!currentClass) {
                alert('Class context not available. Open dashboard from a class subject first.');
                return;
            }
            const classInfo = classesAndSubjects[currentClass];
            const maxPerSubject = classInfo.subjects[0] ? classInfo.subjects[0].maxMarks : 100;
            showClassPerformance(currentClass, assessment, maxPerSubject);
        });
    }

    if (overallPerfBtn) {
        overallPerfBtn.addEventListener('click', function() {
            const currentClass = document.body.getAttribute('data-current-class');
            if (!currentClass) {
                alert('Class context not available. Open dashboard from a class subject first.');
                return;
            }
            showOverallClassPerformance(currentClass);
        });
    }

    // Per-assessment buttons for all classes
    const assessmentButtons = document.querySelectorAll('.assessment-btn');
    const allClassesOverallBtn = document.getElementById('all-classes-overall-btn');

    if (assessmentButtons && assessmentButtons.length > 0) {
        assessmentButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const assessment = this.getAttribute('data-assessment');
                showAssessmentDashboardForAllClasses(assessment);
            });
        });
    }

    if (allClassesOverallBtn) {
        allClassesOverallBtn.addEventListener('click', function() {
            showOverallForAllClasses();
        });
    }

    // Main view tabs (Performance vs Classroom)
    const mainViewTabsContainer = document.getElementById('subject-view-tabs');
    if (mainViewTabsContainer) {
        mainViewTabsContainer.addEventListener('click', function(e) {
            if (!e.target.matches('.tab-btn')) return;

            // Update active tab button
            mainViewTabsContainer.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const view = e.target.getAttribute('data-view');
            const performanceWrapper = document.getElementById('performance-content-wrapper');
            const classroomWrapper = document.getElementById('classroom-content-wrapper');

            if (view === 'classroom') {
                if (performanceWrapper) performanceWrapper.style.display = 'none';
                if (classroomWrapper) classroomWrapper.style.display = 'block';
            } else { // default to performance
                if (performanceWrapper) performanceWrapper.style.display = 'block';
                if (classroomWrapper) classroomWrapper.style.display = 'none';
            }
        });
    }

    // Initialize Performance Panel controls
    initPerformancePanel();
});

// Initialize the Performance Panel UI and wiring
function initPerformancePanel() {
    const panel = document.getElementById('performance-panel');
    const classSelect = document.getElementById('performance-class-select');
    const subjectSelect = document.getElementById('performance-subject-select');
    const openBtn = document.getElementById('open-performance-view');
    const closeBtn = document.getElementById('close-performance-panel');
    const tabBtns = document.querySelectorAll('#subject-tabs .tab-btn');

    if (!panel || !classSelect || !subjectSelect) return;

    // Populate class select
    classSelect.innerHTML = '';
    Object.keys(classesAndSubjects).forEach(cc => {
        const opt = document.createElement('option');
        opt.value = cc;
        opt.textContent = `${cc} - ${classesAndSubjects[cc].className}`;
        classSelect.appendChild(opt);
    });

    // On class change populate subjects
    function populateSubjects() {
        const cc = classSelect.value;
        subjectSelect.innerHTML = '';
        const classData = classesAndSubjects[cc];
        if (!classData) return;
        classData.subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.name;
            opt.textContent = s.name;
            subjectSelect.appendChild(opt);
        });
    }
    classSelect.addEventListener('change', populateSubjects);
    populateSubjects();

    // Show panel toggle: we'll show the panel when user clicks a 'Performance Dashboard' action
    // For convenience, expose a function to open the panel for a class
    window.openPerformancePanelForClass = function(classCode) {
        if (!classCode) return;
        panel.style.display = 'block';
        classSelect.value = classCode;
        populateSubjects();
    };

    // Open performance view using currently selected tab
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            const cc = classSelect.value;
            const subj = subjectSelect.value;
            // find active tab
            const activeTab = document.querySelector('#subject-tabs .tab-btn.active') || document.querySelector('#subject-tabs .tab-btn');
            const assess = activeTab ? activeTab.getAttribute('data-assessment') : 'CIA 1';
            if (!cc || !subj) return alert('Select a class and subject.');
            if (assess === 'Overall') {
                renderSubjectOverall(cc, subj);
            } else {
                renderSubjectAssessment(cc, subj, assess);
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() { panel.style.display = 'none'; });
    }

    // Tab button behavior
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Also expose a helper to open panel and auto-select subject
    window.openPerformanceForSubject = function(classCode, subjectName) {
        openPerformancePanelForClass(classCode);
        // slight delay to ensure subjects populated
        setTimeout(() => {
            subjectSelect.value = subjectName;
        }, 10);
    };
}

// Render a single subject for a given assessment (uses existing processData)
function renderSubjectAssessment(classCode, subject, assessment) {
    const sampleData = generateSampleData(classCode, subject, assessment);
    const maxMarks = classesAndSubjects[classCode].subjects.find(s => s.name === subject).maxMarks;
    document.body.setAttribute('data-current-class', classCode);
    document.body.setAttribute('data-current-subject', subject);
    document.body.setAttribute('data-current-assessment', assessment);
    processData(subject, sampleData, maxMarks, assessment, classCode);
}

// Render overall subject performance across assessments
function renderSubjectOverall(classCode, subject) {
    const overallRows = generateOverallSubjectData(classCode, subject);
    if (!overallRows || overallRows.length === 0) {
        alert('No data available for this subject overall.');
        return;
    }

    // Hide upload and data sections for overall view
    setUploadSectionVisibility(false);

    const studentLabels = overallRows.map(r => r['Roll No']);
    const studentPercents = overallRows.map(r => r.Percentage || 0);

    document.getElementById('selected-subject').textContent = `${subject} - Overall (All Exams)`;
    document.getElementById('dashboard-title').style.display = 'block';
    document.body.setAttribute('data-current-class', classCode);

    const stats = calculateStats(studentPercents.map(p => (p / 100) * 100));
    document.getElementById('not-attended').textContent = '-';
    document.getElementById('min-score').textContent = stats.min;
    document.getElementById('max-score').textContent = stats.max;
    document.getElementById('avg-score').textContent = stats.avg;
    document.getElementById('stdev-score').textContent = stats.stdev;
    document.getElementById('avg-display').textContent = `${(studentPercents.reduce((a,b)=>a+b,0)/studentPercents.length || 0).toFixed(1)}% (avg across assessments)`;

    const bins = getBinCounts(studentPercents, studentPercents.length);
    document.getElementById('bin-90').textContent = bins['90'].count;
    document.getElementById('pct-90').textContent = bins['90'].percentage;
    document.getElementById('bin-85').textContent = bins['85'].count;
    document.getElementById('pct-85').textContent = bins['85'].percentage;
    document.getElementById('bin-80').textContent = bins['80'].count;
    document.getElementById('pct-80').textContent = bins['80'].percentage;
    document.getElementById('bin-75').textContent = bins['75'].count;
    document.getElementById('pct-75').textContent = bins['75'].percentage;
    document.getElementById('bin-70').textContent = bins['70'].count;
    document.getElementById('pct-70').textContent = bins['70'].percentage;
    document.getElementById('bin-65').textContent = bins['65'].count;
    document.getElementById('pct-65').textContent = bins['65'].percentage;
    document.getElementById('bin-60').textContent = bins['60'].count;
    document.getElementById('pct-60').textContent = bins['60'].percentage;
    document.getElementById('bin-50').textContent = bins['50'].count;
    document.getElementById('pct-50').textContent = bins['50'].percentage;
    document.getElementById('bin-40').textContent = bins['40'].count;
    document.getElementById('pct-40').textContent = bins['40'].percentage;
    document.getElementById('bin-below40').textContent = bins['below40'].count;
    document.getElementById('pct-below40').textContent = bins['below40'].percentage;

    // Student chart
    const studentCtx = document.getElementById('student-chart').getContext('2d');
    if (studentChart) studentChart.destroy();
    const colors = studentPercents.map(p => p < 40 ? '#dc3545' : p < 70 ? '#ffc107' : '#28a745');
    studentChart = new Chart(studentCtx, {
        type: 'bar',
        data: { labels: studentLabels, datasets: [{ label: `${subject} - Overall % (across assessments)`, data: studentPercents, backgroundColor: colors }] },
        options: { responsive: true, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('dashboard').style.display = 'block';
}

// Handle file upload
function handleFileUpload(e) {
    e.preventDefault();
    
    let subject, maxMarks, fileInput;
    
    if (e.target.id === 'admin-upload-form') {
        subject = document.getElementById('admin-subject-input').value.trim();
        maxMarks = parseFloat(document.getElementById('admin-max-marks-input').value);
        fileInput = document.getElementById('admin-file-input');
    } else if (e.target.id === 'ct-upload-form') {
        subject = document.getElementById('ct-subject-input').value.trim();
        maxMarks = parseFloat(document.getElementById('ct-max-marks-input').value);
        fileInput = document.getElementById('ct-file-input');
    } else if (e.target.id === 'teacher-upload-form') {
        const user = getCurrentUser();
        subject = user.assignedSubject;
        maxMarks = parseFloat(document.getElementById('teacher-max-marks-input').value);
        fileInput = document.getElementById('teacher-file-input');
    }

    if (!subject || !fileInput.files[0] || isNaN(maxMarks) || maxMarks <= 0) {
        alert('Please fill in all required fields.');
        return;
    }
    // If a teacher is uploading, ensure upload is before scheduled deadline for the selected assessment
    if (e.target.id === 'teacher-upload-form') {
        const assessmentSelected = getActiveAssessment();
        const schedules = typeof loadSchedules === 'function' ? loadSchedules() : [];
        const user = getCurrentUser();
        const sched = schedules.find(s => {
            if (s.exam !== assessmentSelected) return false;
            if (s.scope === 'all') return true;
            if (s.scope === 'custom') {
                // check class or subject match for this teacher
                const classMatch = s.class && user && user.assignedClasses && user.assignedClasses.includes(s.class);
                const subjectMatch = s.subject && user && user.assignedSubject && user.assignedSubject === s.subject;
                return classMatch || subjectMatch;
            }
            return false;
        });
        if (sched) {
            const today = new Date();
            const deadline = new Date(sched.deadline + 'T23:59:59');
            if (today > deadline) {
                alert(`Upload deadline for ${assessmentSelected} has passed (${sched.deadline}). You cannot upload.`);
                return;
            }
            // Ensure teacher has chosen a date for this schedule before uploading
            const user = getCurrentUser();
            const schedId = sched.createdAt ? ('sched_' + sched.createdAt) : null;
            const globalSelections = typeof getGlobalSelections === 'function' ? getGlobalSelections() : {};
            if (schedId) {
                const sel = globalSelections[schedId];
                if (!sel) {
                    alert('Please choose a date for this exam from your Notifications area before uploading marks.');
                    return;
                }
                if (sel.teacher !== user.username) {
                    alert(`This exam date was selected by ${sel.teacher}. Only that teacher may upload marks for this schedule.`);
                    return;
                }
            }
        }
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', WTF: true, cellDates: false, cellNF: false, cellHTML: false, raw: true, bookVBA: false });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

            // Hide main views and show dashboard
            document.getElementById('admin-view').style.display = 'none';
            document.getElementById('classTeacher-view').style.display = 'none';
            document.getElementById('teacher-view').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';

            // Determine current class context
            let currentClass = null;
            if (e.target.id === 'admin-upload-form') {
                currentClass = document.getElementById('admin-class-input').value.trim();
            } else {
                const user = getCurrentUser();
                if (user && user.assignedClass) currentClass = user.assignedClass;
            }
            if (currentClass) document.body.setAttribute('data-current-class', currentClass);

            const assessment = getActiveAssessment() || null;
            processData(subject, jsonData, maxMarks, assessment, currentClass);
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}


// Learner classification functions removed (local classroom system now handles classification/grouping)

// Handle assessment-specific file upload for updating dashboard
function handleAssessmentFileUpload(e) {
    e.preventDefault();

    const maxMarks = parseFloat(document.getElementById('assessment-max-marks-input').value);
    const fileInput = document.getElementById('assessment-upload-file');

    if (!fileInput.files[0] || isNaN(maxMarks) || maxMarks <= 0) {
        alert('Please fill in all required fields.');
        return;
    }

    const currentSubject = document.body.getAttribute('data-current-subject');
    const currentClass = document.body.getAttribute('data-current-class');
    const currentAssessment = document.body.getAttribute('data-current-assessment');

    if (!currentSubject || !currentClass || !currentAssessment) {
        alert('Missing context. Please open a subject dashboard first.');
        return;
    }

    // Check schedule for this assessment and prevent upload if deadline passed
    const schedules = typeof loadSchedules === 'function' ? loadSchedules() : [];
    const schedForAssess = schedules.find(s => {
        if (s.exam !== currentAssessment) return false;
        if (s.scope === 'all') return true;
        if (s.scope === 'custom') {
            // match by class or subject
            if (s.class && s.class === currentClass) return true;
            if (s.subject && s.subject === currentSubject) return true;
        }
        return false;
    });
    if (schedForAssess) {
        const today = new Date();
        const deadline = new Date(schedForAssess.deadline + 'T23:59:59');
        if (today > deadline) {
            alert(`Upload deadline for ${currentAssessment} has passed (${schedForAssess.deadline}). Cannot update dashboard.`);
            return;
        }
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', WTF: true, cellDates: false, cellNF: false, cellHTML: false, raw: true, bookVBA: false });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

            // Reprocess dashboard with updated data
            processData(currentSubject, jsonData, maxMarks, currentAssessment, currentClass);
            alert('Dashboard updated successfully!');
            // Clear file input
            fileInput.value = '';
        } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file: ' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// ========== Learner Classification Functions ==========

// Get current class ID from context (set when dashboard opened)
function getCurrentClassIdForClassification() {
    return document.body.getAttribute('data-current-class-id') || localStorage.getItem('current-class-id');
}

// Set current class ID (call when opening a class dashboard)
function setCurrentClassIdForClassification(classId) {
    document.body.setAttribute('data-current-class-id', classId);
    localStorage.setItem('current-class-id', classId);
}

// Upload student data (Roll, Name, Email) for current class
async function handleStudentDataUpload(file, classId) {
    if (!classId) { alert('Class ID not set. Please open a class dashboard first.'); return; }
    
    try {
        const data = new Uint8Array(await file.arrayBuffer());
        const workbook = XLSX.read(data, { type: 'array', defval: '' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

        // Validate required columns: Roll, Name, Email
        if (jsonData.length === 0) { alert('Excel file is empty.'); return; }
        const requiredCols = ['Roll', 'Name', 'Email'];
        const headers = Object.keys(jsonData[0]);
        const missing = requiredCols.filter(col => !headers.some(h => h.toLowerCase() === col.toLowerCase()));
        if (missing.length > 0) { alert('Missing columns in Excel: ' + missing.join(', ')); return; }

        // Send to server
        const res = await fetch('/api/local/student-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classId, students: jsonData })
        });
        const j = await res.json();
        if (j.ok) {
            document.getElementById('student-data-status').textContent = 'Student data uploaded successfully!';
            document.getElementById('student-data-status').style.color = '#28a745';
            // Reload uploaded students display
            await displayUploadedStudents(classId);
            // Clear file input
            document.getElementById('student-data-file').value = '';
        } else {
            alert('Server error: ' + (j.error || JSON.stringify(j)));
        }
    } catch (e) {
        console.error(e);
        alert('Error uploading student data: ' + e.message);
    }
}

// Display uploaded students from server
async function displayUploadedStudents(classId) {
    try {
        const res = await fetch('/api/local/student-data?classId=' + encodeURIComponent(classId));
        const j = await res.json();
        if (!j.ok || !j.data || !j.data.students) {
            document.getElementById('no-students-msg').style.display = 'block';
            document.getElementById('uploaded-students-table').style.display = 'none';
            return;
        }

        const students = j.data.students;
        if (students.length === 0) {
            document.getElementById('no-students-msg').style.display = 'block';
            document.getElementById('uploaded-students-table').style.display = 'none';
            return;
        }

        document.getElementById('no-students-msg').style.display = 'none';
        document.getElementById('uploaded-students-table').style.display = 'table';
        const tbody = document.getElementById('uploaded-students-body');
        tbody.innerHTML = '';
        students.forEach(student => {
            const roll = student.Roll || student.roll || '-';
            const name = student.Name || student.name || '-';
            const email = student.Email || student.email || '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td style="padding: 8px; border: 1px solid #ddd;">${roll}</td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td>`;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

// Classify students based on assessment marks (>= 30% = Proactive, < 30% = Reactive)
function classifyStudentsFromAssessment(assessmentData, maxMarks, uploadedStudents) {
    // assessmentData: array from processData, with Roll, Name, Score
    // uploadedStudents: from server, with Roll, Name, Email
    // Returns: { proactive: [...], reactive: [...] } each with Roll, Name, Email, Score

    const proactive = [];
    const reactive = [];
    const threshold = (maxMarks * 30) / 100; // 30% of max marks

    // Map uploaded students by Roll for easy lookup
    const studentMap = {};
    if (uploadedStudents && Array.isArray(uploadedStudents)) {
        uploadedStudents.forEach(s => {
            const roll = (s.Roll || s.roll || '').toString().trim();
            studentMap[roll] = s;
        });
    }

    // Classify assessment data
    assessmentData.forEach(row => {
        const roll = (row.Roll || row.roll || '').toString().trim();
        const score = parseFloat(row.Score || row.score || 0);
        const student = studentMap[roll] || { Roll: roll, Name: row.Name || row.name || '-', Email: '' };
        const recordWithScore = { ...student, Score: score };

        if (score >= threshold) {
            proactive.push(recordWithScore);
        } else {
            reactive.push(recordWithScore);
        }
    });

    return { proactive, reactive };
}

// Display classification results (Proactive vs Reactive)
function displayClassificationResults(proactive, reactive) {
    const proactiveList = document.getElementById('proactive-list');
    const reactiveList = document.getElementById('reactive-list');

    // Proactive list
    if (proactive.length === 0) {
        proactiveList.innerHTML = '<div style="color: #666; padding: 8px;">No proactive students.</div>';
    } else {
        proactiveList.innerHTML = '';
        proactive.forEach(s => {
            const div = document.createElement('div');
            div.style.padding = '6px';
            div.style.borderBottom = '1px solid rgba(40, 167, 69, 0.3)';
            div.innerHTML = `<strong>${s.Name || '-'}</strong> (Roll: ${s.Roll || '-'}) - ${s.Score ? s.Score.toFixed(1) : '-'} pts`;
            proactiveList.appendChild(div);
        });
    }

    // Reactive list
    if (reactive.length === 0) {
        reactiveList.innerHTML = '<div style="color: #666; padding: 8px;">No reactive students.</div>';
    } else {
        reactiveList.innerHTML = '';
        reactive.forEach(s => {
            const div = document.createElement('div');
            div.style.padding = '6px';
            div.style.borderBottom = '1px solid rgba(220, 53, 69, 0.3)';
            div.innerHTML = `<strong>${s.Name || '-'}</strong> (Roll: ${s.Roll || '-'}) - ${s.Score ? s.Score.toFixed(1) : '-'} pts`;
            reactiveList.appendChild(div);
        });
    }
}

// Create local class and bulk-invite students
async function createClassAndBulkInvite(groupName, students, currentClassId, assignmentTitle) {
    const user = getCurrentUser ? getCurrentUser() : null;
    if (!user) { alert('Please log in first'); return; }

    const newClassName = groupName + ' - ' + (document.body.getAttribute('data-current-class') || 'Class');
    try {
        // Create local class
        const createRes = await fetch('/api/local/create-class', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newClassName, description: groupName + ' learners group', owner: user.username })
        });
        const createJ = await createRes.json();
        if (!createJ.ok) { alert('Error creating class: ' + (createJ.error || JSON.stringify(createJ))); return; }

        const newClassId = createJ.class.id;
        // create assignment in the newly created class if assignmentTitle provided
        if (assignmentTitle) {
            try {
                const assignRes = await fetch('/api/local/create-assignment', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId: newClassId, title: assignmentTitle, description: `${groupName} group assignment`, dueDate: null, createdBy: user.username })
                });
                const assignJ = await assignRes.json();
                if (assignJ && assignJ.ok) {
                    console.log('Created assignment for', newClassName, assignJ.assignment.id);
                }
            } catch (e) { console.warn('create assignment failed', e); }
        }

        // Bulk invite students
        let inviteCount = 0;
        for (const student of students) {
            const email = student.Email || student.email || '';
            if (!email) continue;
            try {
                const inviteRes = await fetch('/api/local/invite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId: newClassId, email, message: 'You have been added to the ' + groupName + ' group. Please submit your assignment using the provided link.' })
                });
                const inviteJ = await inviteRes.json();
                if (inviteJ.ok) inviteCount++;
            } catch (e) { console.warn('Invite failed for ' + email, e); }
        }
        alert(`Class created and ${inviteCount} invites sent for ${groupName} group.`);
    } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
    }
}

// Setup learner classification UI event listeners
document.addEventListener('DOMContentLoaded', function() {
    const classificationSection = document.getElementById('learner-classification-section');
    const studentDataForm = document.getElementById('student-data-upload-form');
    const createProactiveBtn = document.getElementById('create-proactive-class-btn');
    const createReactiveBtn = document.getElementById('create-reactive-class-btn');
    const bulkInviteProactiveBtn = document.getElementById('bulk-invite-proactive-btn');
    const bulkInviteReactiveBtn = document.getElementById('bulk-invite-reactive-btn');

    if (!classificationSection || !studentDataForm) return;

    // Store classification data globally for button handlers
    let currentClassificationData = null;

    // Student data upload form
    studentDataForm.addEventListener('submit', async function(ev) {
        ev.preventDefault();
        const fileInput = document.getElementById('student-data-file');
        if (!fileInput.files[0]) { alert('Please select a file'); return; }
        const classId = getCurrentClassIdForClassification();
        if (!classId) { alert('Class ID not found. Open a class dashboard first.'); return; }
        await handleStudentDataUpload(fileInput.files[0], classId);
    });

    // Create Proactive Class button
    if (createProactiveBtn) {
        createProactiveBtn.addEventListener('click', async function() {
            if (!currentClassificationData || !currentClassificationData.proactive) {
                alert('No classification data available. Upload student data and assessment marks first.');
                return;
            }
            if (currentClassificationData.proactive.length === 0) { alert('No proactive students in this group.'); return; }
            const classId = getCurrentClassIdForClassification();
            await createClassAndBulkInvite('Proactive', currentClassificationData.proactive, classId);
        });
    }

    // Create Reactive Class button
    if (createReactiveBtn) {
        createReactiveBtn.addEventListener('click', async function() {
            if (!currentClassificationData || !currentClassificationData.reactive) {
                alert('No classification data available. Upload student data and assessment marks first.');
                return;
            }
            if (currentClassificationData.reactive.length === 0) { alert('No reactive students in this group.'); return; }
            const classId = getCurrentClassIdForClassification();
            await createClassAndBulkInvite('Reactive', currentClassificationData.reactive, classId);
        });
    }

    // Bulk invite functions (store data from current classification)
    if (bulkInviteProactiveBtn) {
        bulkInviteProactiveBtn.addEventListener('click', async function() {
            if (!currentClassificationData || !currentClassificationData.proactive) {
                alert('No proactive students available.');
                return;
            }
            const classId = getCurrentClassIdForClassification();
            // Create class (which will also invite) or just invite to existing?
            // For now, we'll just send invites (assumes class already created)
            let count = 0;
            for (const student of currentClassificationData.proactive) {
                const email = student.Email || student.email || '';
                if (email) count++;
            }
            alert(`Ready to bulk-invite ${count} proactive students. Create the Proactive Class first, then this button will invite them.`);
        });
    }

    if (bulkInviteReactiveBtn) {
        bulkInviteReactiveBtn.addEventListener('click', async function() {
            if (!currentClassificationData || !currentClassificationData.reactive) {
                alert('No reactive students available.');
                return;
            }
            const classId = getCurrentClassIdForClassification();
            let count = 0;
            for (const student of currentClassificationData.reactive) {
                const email = student.Email || student.email || '';
                if (email) count++;
            }
            alert(`Ready to bulk-invite ${count} reactive students. Create the Reactive Class first, then this button will invite them.`);
        });
    }

    // Store a global function to update classification data from assessment upload
    window.updateClassificationFromAssessment = async function(assessmentDataRows, maxMarks, assessmentName) {
        const classId = getCurrentClassIdForClassification();
        if (!classId) { console.warn('Class ID not set for classification'); return; }

        // Fetch uploaded students from server
        try {
            const res = await fetch('/api/local/student-data?classId=' + encodeURIComponent(classId));
            const j = await res.json();
            const uploadedStudents = j.ok && j.data ? j.data.students : [];

            // Classify
            const classification = classifyStudentsFromAssessment(assessmentDataRows, maxMarks, uploadedStudents);
            currentClassificationData = classification;

            // Show classification section and results
            classificationSection.style.display = 'block';
            displayClassificationResults(classification.proactive, classification.reactive);
            // Offer to create separate classes and assignments automatically
            try {
                const proactiveCount = (classification.proactive || []).length;
                const reactiveCount = (classification.reactive || []).length;
                if (proactiveCount + reactiveCount > 0) {
                    const ok = confirm(`Classification done. Create separate classes and assignments?\nProactive: ${proactiveCount} students\nReactive: ${reactiveCount} students`);
                    if (ok) {
                        // Send classification to server for application-level auto-split
                        try {
                            const resp = await fetch('/api/local/auto-split', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ baseClassId: classId, proactive: classification.proactive, reactive: classification.reactive, assessmentName: assessmentName, createdBy: (getCurrentUser && getCurrentUser() && getCurrentUser().username) || null })
                            });
                            const jr = await resp.json();
                            if (jr.ok) {
                                alert('Auto-split completed. Created ' + (jr.summary.createdClasses || []).length + ' classes and sent ' + (jr.summary.invites || []).length + ' invites.');
                                if (typeof loadLocalClassesForTeacher === 'function') loadLocalClassesForTeacher();
                            } else {
                                alert('Auto-split failed: ' + (jr.error || JSON.stringify(jr)));
                            }
                        } catch (e) { console.error('auto-split error', e); alert('Auto-split request failed: ' + e.message); }
                    }
                }
            } catch (e) { console.warn('auto-create classes failed', e); }
        } catch (e) {
            console.error('Error updating classification:', e);
        }
    };
});
