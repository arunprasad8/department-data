// Global variables for charts
let riskChart;
let binsChart;
let studentChart;

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

// Main processing function
function processData(subject, data, maxMarks) {
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
    const binColors = ['#28a745', '#28a745', '#28a745', '#ffc107', '#ffc107', '#ffc107', '#ffc107', '#dc3545', '#dc3545', '#dc3545']; // Green to red gradient
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
                    borderColor: '#007bff',
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

    // Show dashboard, hide upload
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('loading').style.display = 'none';
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('upload-form');
    const resetBtn = document.getElementById('reset-btn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const subject = document.getElementById('subject-input').value.trim();
        const maxMarks = parseFloat(document.getElementById('max-marks-input').value);
        const file = document.getElementById('file-input').files[0];

        if (!subject || !file || isNaN(maxMarks) || maxMarks <= 0) {
            alert('Please enter subject name, a positive max marks value, and select a file.');
            return;
        }

        document.getElementById('loading').style.display = 'block';

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                console.log('File size:', data.length);
                const workbook = XLSX.read(data, { type: 'array', WTF: true, cellDates: false, cellNF: false, cellHTML: false, raw: true, bookVBA: false });
                console.log('Workbook sheet names:', workbook.SheetNames);
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                console.log('Parsed JSON data:', jsonData);
                console.log('First row keys:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');

                // Assume columns: Roll No, Name, Subject, Marks (adjust if needed)
                processData(subject, jsonData, maxMarks);
            } catch (error) {
                console.error('Detailed parsing error:', error);
                console.error('Error stack:', error.stack);
                alert('Error processing file: ' + error.message);
                document.getElementById('loading').style.display = 'none';
            }
        };
        reader.readAsArrayBuffer(file);
    });

    resetBtn.addEventListener('click', function() {
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
        form.reset();
        if (riskChart) {
            riskChart.destroy();
            riskChart = null;
        }
        if (binsChart) {
            binsChart.destroy();
            binsChart = null;
        }
        if (studentChart) {
            studentChart.destroy();
            studentChart = null;
        }
        document.getElementById('critical-students').style.display = 'none';
    });
});
