require('dotenv').config();
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { JWT } = require('google-auth-library');
const nodemailer = require('nodemailer');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
const COURSES_FILE = path.join(__dirname, 'data', 'createdCourses.json');
const LOCAL_CLASSES_FILE = path.join(__dirname, 'data', 'localClasses.json');
const INVITES_FILE = path.join(__dirname, 'data', 'invites.json');
const SUBMISSIONS_FILE = path.join(__dirname, 'data', 'submissions.json');
const STUDENT_DATA_FILE = path.join(__dirname, 'data', 'studentData.json');
const LOCAL_ASSIGNMENTS_FILE = path.join(__dirname, 'data', 'localAssignments.json');
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
const EVENTS_FILE = path.join(__dirname, 'data', 'events.json');
const EVENT_COMMENTS_FILE = path.join(__dirname, 'data', 'eventComments.json');
const EVENT_NOTIFICATIONS_FILE = path.join(__dirname, 'data', 'eventNotifications.json');
const TEACHERS_FILE = path.join(__dirname, 'data', 'teachers.json');
const EVENT_SUBMISSIONS_FILE = path.join(__dirname, 'data', 'eventSubmissions.json');
const EVENT_TASKS_FILE = path.join(__dirname, 'data', 'eventTasks.json');
const CLASSROOM_BASE = 'https://classroom.googleapis.com/v1';

// Ensure data file exists
if (!fs.existsSync(COURSES_FILE)) {
  try { fs.writeFileSync(COURSES_FILE, '[]', 'utf8'); } catch (e) { console.warn('Could not create data file', e); }
}
// Ensure local storage files and folders
if (!fs.existsSync(LOCAL_CLASSES_FILE)) { try { fs.writeFileSync(LOCAL_CLASSES_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(INVITES_FILE)) { try { fs.writeFileSync(INVITES_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(SUBMISSIONS_FILE)) { try { fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(STUDENT_DATA_FILE)) { try { fs.writeFileSync(STUDENT_DATA_FILE, '{}', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(LOCAL_ASSIGNMENTS_FILE)) { try { fs.writeFileSync(LOCAL_ASSIGNMENTS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(EVENTS_FILE)) { try { fs.writeFileSync(EVENTS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(EVENT_COMMENTS_FILE)) { try { fs.writeFileSync(EVENT_COMMENTS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(EVENT_NOTIFICATIONS_FILE)) { try { fs.writeFileSync(EVENT_NOTIFICATIONS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
// teacher / role file
if (!fs.existsSync(TEACHERS_FILE)) { try { fs.writeFileSync(TEACHERS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
// event submissions (report workflow)
if (!fs.existsSync(EVENT_SUBMISSIONS_FILE)) { try { fs.writeFileSync(EVENT_SUBMISSIONS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
// internal event tasks
if (!fs.existsSync(EVENT_TASKS_FILE)) { try { fs.writeFileSync(EVENT_TASKS_FILE, '[]', 'utf8'); } catch(e){console.warn(e);} }
if (!fs.existsSync(UPLOADS_DIR)) { try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch(e){console.warn(e);} }

// Multer setup for uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const classId = req.body.classId || 'misc';
    const dir = path.join(UPLOADS_DIR, classId);
    try { fs.mkdirSync(dir, { recursive: true }); } catch(e){}
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2,8);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Simple JSON helpers
function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]'); } catch(e) { return []; }
}
function writeJson(filePath, obj) {
  try { fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), 'utf8'); return true; } catch(e) { console.warn('writeJson error', e); return false; }
}

// Nodemailer transporter factory (uses SMTP env vars)
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user) return null;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function getAccessTokenFromEnvOrHeader(req) {
  // 1) If service account JSON is provided in env (stringified JSON), and GOOGLE_IMPERSONATE_USER is set,
  //    use JWT with subject to obtain an access token (requires domain-wide delegation setup).
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_IMPERSONATE_USER) {
    try {
      const sa = typeof process.env.GOOGLE_SERVICE_ACCOUNT_JSON === 'string'
        ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
        : process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
      const scopes = [
        'https://www.googleapis.com/auth/classroom.courses',
        'https://www.googleapis.com/auth/classroom.rosters',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.coursework.me'
      ];
      const client = new JWT({
        email: sa.client_email,
        key: sa.private_key,
        scopes,
        subject: process.env.GOOGLE_IMPERSONATE_USER
      });
      const tokens = await client.authorize();
      return tokens && tokens.access_token;
    } catch (err) {
      console.error('Service account token error:', err);
      return null;
    }
  }

  // 2) Otherwise, expect client to forward a Bearer token in Authorization header
  const auth = req.headers.authorization || '';
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.substring(7).trim();

  // 3) Or accept access_token in body or query as fallback (less secure)
  if (req.body && req.body.access_token) return req.body.access_token;
  if (req.query && req.query.access_token) return req.query.access_token;

  return null;
}

async function proxyToGoogle(req, res, method, url, body) {
  try {
    const token = await getAccessTokenFromEnvOrHeader(req);
    if (!token) return res.status(401).json({ error: 'No Google access token available. Provide a Bearer token or configure service account.' });

    const response = await axios({
      method,
      url,
      headers: { Authorization: `Bearer ${token}` },
      data: body,
      timeout: 20000
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error('proxy error', err && err.response ? err.response.data || err.response.statusText : err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const data = err.response && err.response.data ? err.response.data : { message: err.message };
    return res.status(status).json({ error: data });
  }
}

// Create course endpoint
app.post('/api/create-course', async (req, res) => {
  const body = req.body || {};
  const payload = {
    name: body.name || 'Unnamed Course',
    section: body.section || '',
    descriptionHeading: body.descriptionHeading || '',
    description: body.description || '',
    ownerId: body.ownerId || 'me'
  };

  // Proxy to Google Classroom create course
  try {
    const url = `${CLASSROOM_BASE}/courses`;
    const token = await getAccessTokenFromEnvOrHeader(req);
    if (!token) return res.status(401).json({ error: 'No access token' });
    const resp = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });

    // Persist created course metadata locally
    try {
      const existing = JSON.parse(fs.readFileSync(COURSES_FILE, 'utf8') || '[]');
      existing.push({ createdAt: new Date().toISOString(), request: payload, course: resp.data });
      fs.writeFileSync(COURSES_FILE, JSON.stringify(existing, null, 2), 'utf8');
    } catch (e) { console.warn('Could not persist created course', e); }

    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error('create-course error', err && err.response ? err.response.data : err.message);
    const status = err.response && err.response.status ? err.response.status : 500;
    const data = err.response && err.response.data ? err.response.data : { message: err.message };
    return res.status(status).json({ error: data });
  }
});

// Enroll students endpoint
app.post('/api/enroll-students', async (req, res) => {
  const { courseId, students } = req.body || {};
  if (!courseId || !Array.isArray(students)) return res.status(400).json({ error: 'Missing courseId or students array' });
  try {
    const token = await getAccessTokenFromEnvOrHeader(req);
    if (!token) return res.status(401).json({ error: 'No access token' });

    const results = [];
    for (const email of students) {
      try {
        const url = `${CLASSROOM_BASE}/courses/${encodeURIComponent(courseId)}/students`;
        const resp = await axios.post(url, { userId: email }, { headers: { Authorization: `Bearer ${token}` } });
        results.push({ email, status: 'ok', data: resp.data });
      } catch (err) {
        results.push({ email, status: 'error', error: (err.response && err.response.data) || err.message });
      }
    }
    return res.json({ results });
  } catch (err) {
    console.error('enroll-students error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create coursework endpoint
app.post('/api/create-coursework', async (req, res) => {
  const { courseId, coursework } = req.body || {};
  if (!courseId || !coursework) return res.status(400).json({ error: 'Missing courseId or coursework object' });
  const url = `${CLASSROOM_BASE}/courses/${encodeURIComponent(courseId)}/courseWork`;
  return proxyToGoogle(req, res, 'post', url, coursework);
});

// List persisted created courses
app.get('/api/courses', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(COURSES_FILE, 'utf8') || '[]');
    return res.json({ courses: data });
  } catch (e) {
    return res.status(500).json({ error: 'Could not read courses file' });
  }
});

app.get('/', (req, res) => res.json({ message: 'CIA Classroom proxy running' }));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// ------------------ Local classroom endpoints ------------------

// Create a local class (teacher creates a class inside our app)
app.post('/api/local/create-class', (req, res) => {
  const { name, description, owner } = req.body || {};
  if (!name || !owner) return res.status(400).json({ error: 'Missing name or owner' });
  const classes = readJson(LOCAL_CLASSES_FILE);
  const classId = uuidv4();
  const cls = { id: classId, name, description: description || '', owner, createdAt: new Date().toISOString() };
  classes.push(cls);
  writeJson(LOCAL_CLASSES_FILE, classes);
  return res.json({ ok: true, class: cls });
});

// Invite a student by email (sends an email with a join link)
app.post('/api/local/invite', async (req, res) => {
  const { classId, email, message } = req.body || {};
  if (!classId || !email) return res.status(400).json({ error: 'Missing classId or email' });
  const classes = readJson(LOCAL_CLASSES_FILE);
  const cls = classes.find(c => c.id === classId);
  if (!cls) return res.status(404).json({ error: 'Class not found' });
  const invites = readJson(INVITES_FILE);
  const token = uuidv4();
  const invite = { token, classId, email, message: message || '', createdAt: new Date().toISOString(), used: false };
  invites.push(invite);
  writeJson(INVITES_FILE, invites);

  // build link
  const host = req.get('host');
  const proto = req.protocol;
  const link = `${proto}://${host}/invite.html?token=${token}`;

  // send email if transporter configured
  const transporter = createTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: `Invitation to join class: ${cls.name}`, text: `You have been invited to join ${cls.name}. Click to join: ${link}\n\n${invite.message}` });
    } catch (e) {
      console.warn('email send failed', e);
      // still return success but include warning
      return res.json({ ok: true, invite, warning: 'Email send failed. Check SMTP settings.' });
    }
  }

  return res.json({ ok: true, invite, link });
});

// Lookup invite info by token
app.get('/api/local/invite', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const invites = readJson(INVITES_FILE);
  const invite = invites.find(i => i.token === token);
  if (!invite) return res.status(404).json({ error: 'Invite not found' });
  const classes = readJson(LOCAL_CLASSES_FILE);
  const cls = classes.find(c => c.id === invite.classId) || null;
  return res.json({ ok: true, invite, class: cls });
});

// Upload submission (students use token to upload)
app.post('/api/local/upload', upload.single('file'), (req, res) => {
  const token = req.body.token;
  const name = req.body.name || '';
  const email = req.body.email || '';
  if (!token) return res.status(400).json({ error: 'Missing token' });
  const invites = readJson(INVITES_FILE);
  const invite = invites.find(i => i.token === token && i.email.toLowerCase() === (email || '').toLowerCase());
  if (!invite) return res.status(400).json({ error: 'Invalid token or email mismatch' });
  const clsId = invite.classId;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const submissions = readJson(SUBMISSIONS_FILE);
  const entry = { id: uuidv4(), classId: clsId, uploaderName: name, uploaderEmail: email, filename: req.file.originalname, storedPath: path.relative(__dirname, req.file.path), createdAt: new Date().toISOString() };
  submissions.push(entry);
  writeJson(SUBMISSIONS_FILE, submissions);
  return res.json({ ok: true, submission: entry });
});

// List submissions for a class (teachers)
app.get('/api/local/submissions', (req, res) => {
  const classId = req.query.classId;
  if (!classId) return res.status(400).json({ error: 'Missing classId' });
  const subs = readJson(SUBMISSIONS_FILE).filter(s => s.classId === classId);
  return res.json({ ok: true, submissions: subs });
});

// Serve uploaded files statically (for teachers to download)
app.use('/uploads', express.static(UPLOADS_DIR));

// List local classes (for dashboard integration)
app.get('/api/local/classes', (req, res) => {
  const classes = readJson(LOCAL_CLASSES_FILE);
  return res.json({ ok: true, classes });
});

// Store student data for a class (Excel parse results)
app.post('/api/local/student-data', (req, res) => {
  const { classId, students } = req.body || {};
  if (!classId || !Array.isArray(students)) return res.status(400).json({ error: 'Missing classId or students array' });
  const data = readJson(STUDENT_DATA_FILE) || {};
  data[classId] = { students, createdAt: new Date().toISOString() };
  writeJson(STUDENT_DATA_FILE, data);
  return res.json({ ok: true, count: students.length });
});

// Retrieve student data for a class
app.get('/api/local/student-data', (req, res) => {
  const classId = req.query.classId;
  if (!classId) return res.status(400).json({ error: 'Missing classId' });
  const data = readJson(STUDENT_DATA_FILE) || {};
  const classData = data[classId] || { students: [] };
  return res.json({ ok: true, students: classData.students });
});

// ========== NEW: STUDENT CLASSIFICATION & SEED ASSIGNMENT ENDPOINTS ==========

// GET student performance data with auto-classification
app.get('/api/student-performance', (req, res) => {
  try {
    const perfDataFile = path.join(__dirname, 'data', 'performanceData.json');
    if (fs.existsSync(perfDataFile)) {
      const perfData = readJson(perfDataFile);
      return res.json({ 
        ok: true, 
        students: [
          ...(perfData.proactive || []),
          ...(perfData.reactive || [])
        ],
        metadata: perfData.classification_metadata || {}
      });
    }
    
    // Fallback: return sample classification data
    return res.json({
      ok: true,
      students: [],
      metadata: { message: 'No performance data available. Use seed assignments.' }
    });
  } catch (error) {
    console.error('student-performance error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// POST seed assignments - Creates 8 sample assignments with auto-allocated students
app.post('/api/assignments/seed', (req, res) => {
  try {
    const { assignments = [], classifiedStudents = {}, metrics = {} } = req.body || {};
    
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'No assignments provided' });
    }

    // Read existing assignments
    const existingAssignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    
    // Filter out duplicates (by ID) from existing
    const existingIds = new Set(existingAssignments.map(a => a.id));
    const newAssignments = assignments.filter(a => !existingIds.has(a.id));
    
    // Combine
    const allAssignments = [
      ...existingAssignments,
      ...newAssignments
    ];
    
    // Save to localAssignments.json
    const saved = writeJson(LOCAL_ASSIGNMENTS_FILE, allAssignments);
    
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save assignments' });
    }

    // Log seed initialization
    console.log(`✅ Seeded ${newAssignments.length} assignments with auto-classified students`);
    console.log(`   - Proactive: ${metrics.proactiveCount || 0} students`);
    console.log(`   - Reactive: ${metrics.reactiveCount || 0} students`);

    return res.json({
      ok: true,
      message: `Successfully seeded ${newAssignments.length} assignments`,
      assignments: newAssignments,
      totalCount: allAssignments.length,
      metrics: metrics
    });
  } catch (error) {
    console.error('seed assignments error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET student classification summary
app.get('/api/assignments/classification/summary', (req, res) => {
  try {
    const perfDataFile = path.join(__dirname, 'data', 'performanceData.json');
    if (fs.existsSync(perfDataFile)) {
      const perfData = readJson(perfDataFile);
      const metadata = perfData.classification_metadata || {};
      
      return res.json({
        ok: true,
        summary: {
          totalStudents: (perfData.proactive || []).length + (perfData.reactive || []).length,
          proactiveCount: (perfData.proactive || []).length,
          reactiveCount: (perfData.reactive || []).length,
          threshold: metadata.threshold || 50,
          lastUpdated: metadata.lastUpdated
        }
      });
    }
    
    return res.json({
      ok: true,
      summary: { totalStudents: 0, proactiveCount: 0, reactiveCount: 0 }
    });
  } catch (error) {
    console.error('classification summary error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Create a local assignment (metadata only) for a class
app.post('/api/local/create-assignment', (req, res) => {
  const { classId, title, description, dueDate, createdBy } = req.body || {};
  if (!classId || !title) return res.status(400).json({ error: 'Missing classId or title' });
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const entry = { id: uuidv4(), classId, title, description: description || '', dueDate: dueDate || null, createdBy: createdBy || 'system', createdAt: new Date().toISOString() };
    assignments.push(entry);
    writeJson(LOCAL_ASSIGNMENTS_FILE, assignments);
    return res.json({ ok: true, assignment: entry });
  } catch (e) {
    console.error('create-assignment error', e);
    return res.status(500).json({ error: e.message });
  }
});

// List assignments for a class
app.get('/api/local/assignments', (req, res) => {
  const classId = req.query.classId;
  // If classId provided, filter by class; otherwise return all
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    if (classId) {
      const filtered = assignments.filter(a => a.classId === classId);
      return res.json({ ok: true, assignments: filtered });
    } else {
      // Return all assignments when no classId specified
      return res.json({ ok: true, assignments: assignments });
    }
  } catch (e) {
    console.error('list-assignments error', e);
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/local/assignments - Save/update assignments (used by fallback save in seed-data)
app.post('/api/local/assignments', (req, res) => {
  const { assignments = [] } = req.body || {};
  if (!Array.isArray(assignments)) {
    return res.status(400).json({ error: 'Assignments must be an array' });
  }
  try {
    const saved = writeJson(LOCAL_ASSIGNMENTS_FILE, assignments);
    if (!saved) {
      return res.status(500).json({ error: 'Failed to save assignments' });
    }
    return res.json({ ok: true, message: `Saved ${assignments.length} assignments`, count: assignments.length });
  } catch (e) {
    console.error('save-assignments error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Auto-split classification: create Proactive/Reactive classes, create assignment, and invite students
app.post('/api/local/auto-split', async (req, res) => {
  const { baseClassId, proactive = [], reactive = [], assessmentName, createdBy } = req.body || {};
  if (!baseClassId) return res.status(400).json({ error: 'Missing baseClassId' });

  try {
    const classes = readJson(LOCAL_CLASSES_FILE) || [];
    const results = { createdClasses: [], invites: [], assignments: [] };

    // Helper to create class
    function createLocalClass(name, owner) {
      const id = uuidv4();
      const cls = { id, name, description: `${name} (auto-created)`, owner: owner || 'system', createdAt: new Date().toISOString() };
      classes.push(cls);
      writeJson(LOCAL_CLASSES_FILE, classes);
      return cls;
    }

    // Helper to create assignment
    function createAssignment(classId, title, desc, creator) {
      const assigns = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
      const entry = { id: uuidv4(), classId, title, description: desc || '', dueDate: null, createdBy: creator || 'system', createdAt: new Date().toISOString() };
      assigns.push(entry);
      writeJson(LOCAL_ASSIGNMENTS_FILE, assigns);
      return entry;
    }

    // Helper to invite via existing invite endpoint logic (but send mail here)
    const transporter = createTransporter();

    async function createInviteAndSend(classId, email, message) {
      const invites = readJson(INVITES_FILE) || [];
      const token = uuidv4();
      const invite = { token, classId, email, message: message || '', createdAt: new Date().toISOString(), used: false };
      invites.push(invite);
      writeJson(INVITES_FILE, invites);

      const host = req.get('host');
      const proto = req.protocol;
      const link = `${proto}://${host}/invite.html?token=${token}`;

      if (transporter) {
        try {
          await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: `Invitation to join class`, text: `You have been invited. Click to join: ${link}\n\n${invite.message}` });
        } catch (e) {
          // log but continue
          console.warn('email send failed for', email, e && e.message);
        }
      }
      return { invite, link };
    }

    // Determine owner for new classes: if baseClass exists use its owner
    const baseClasses = readJson(LOCAL_CLASSES_FILE) || [];
    const baseCls = baseClasses.find(c => c.id === baseClassId) || null;
    const owner = (baseCls && baseCls.owner) ? baseCls.owner : (createdBy || 'system');

    // Create Proactive class and assignment + invites
    if (Array.isArray(proactive) && proactive.length > 0) {
      const name = `Proactive - ${assessmentName || baseCls && baseCls.name || baseClassId}`;
      const newCls = createLocalClass(name, owner);
      results.createdClasses.push(newCls);
      const assignment = createAssignment(newCls.id, `${assessmentName || 'Assignment'} - Proactive`, 'Auto-created assignment for proactive learners', owner);
      results.assignments.push(assignment);
      for (const s of proactive) {
        const email = (s.Email || s.email || '').toString();
        if (!email) continue;
        const inv = await createInviteAndSend(newCls.id, email, `You have been added to ${newCls.name}. Please submit your work.`);
        results.invites.push({ email, classId: newCls.id, link: inv.link });
      }
    }

    // Create Reactive class and assignment + invites
    if (Array.isArray(reactive) && reactive.length > 0) {
      const name = `Reactive - ${assessmentName || baseCls && baseCls.name || baseClassId}`;
      const newCls = createLocalClass(name, owner);
      results.createdClasses.push(newCls);
      const assignment = createAssignment(newCls.id, `${assessmentName || 'Assignment'} - Reactive`, 'Auto-created assignment for reactive learners', owner);
      results.assignments.push(assignment);
      for (const s of reactive) {
        const email = (s.Email || s.email || '').toString();
        if (!email) continue;
        const inv = await createInviteAndSend(newCls.id, email, `You have been added to ${newCls.name}. Please submit your work.`);
        results.invites.push({ email, classId: newCls.id, link: inv.link });
      }
    }

    return res.json({ ok: true, summary: results });
  } catch (e) {
    console.error('auto-split error', e);
    return res.status(500).json({ error: e.message });
  }
});

// ==================== EVENTS MANAGEMENT ====================

// Create a new event (teacher submits event details with files)
app.post('/api/events/create', upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'venueConfirmation', maxCount: 1 },
  { name: 'guestConfirmation', maxCount: 1 }
]), async (req, res) => {
  const { name, description, venue, date, startTime, endTime, createdBy, department, isHOD } = req.body || {};
  if (!name || !description || !venue || !date || !startTime || !endTime || !createdBy) {
    return res.status(400).json({ error: 'Missing required fields: name, description, venue, date, startTime, endTime, createdBy' });
  }

  try {
    const events = readJson(EVENTS_FILE) || [];
    const eventId = uuidv4();
    
    // If created by HOD, auto-approve; otherwise set to pending
    const isHODCreated = isHOD === 'true' || isHOD === true;
    
    const event = {
      id: eventId,
      name,
      description,
      venue,
      date,
      startTime,
      endTime,
      department: department || 'General',
      createdBy,
      status: isHODCreated ? 'approved' : 'pending', // auto-approved if HOD creates it
      isHODCreated: isHODCreated,
      poster: req.files && req.files.poster ? req.files.poster[0].filename : null,
      venueConfirmation: req.files && req.files.venueConfirmation ? req.files.venueConfirmation[0].filename : null,
      guestConfirmation: req.files && req.files.guestConfirmation ? req.files.guestConfirmation[0].filename : null,
      createdAt: new Date().toISOString(),
      approvedAt: isHODCreated ? new Date().toISOString() : null,
      approvedBy: isHODCreated ? createdBy : null,
      hodComments: []
    };
    
    events.push(event);
    writeJson(EVENTS_FILE, events);

    // Create notification
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    
    if (isHODCreated) {
      // If HOD created it, notify all teachers
      const classes = readJson(LOCAL_CLASSES_FILE) || [];
      const teachers = [...new Set(classes.map(c => c.owner))];
      
      for (const teacher of teachers) {
        notifications.push({
          id: uuidv4(),
          type: 'event_notification',
          eventId,
          message: `New event: "${name}" on ${date}`,
          recipient: teacher,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    } else {
      // If teacher created it, notify HOD
      notifications.push({
        id: uuidv4(),
        type: 'event_submitted',
        eventId,
        message: `New event "${name}" submitted by ${createdBy} for approval`,
        recipient: 'HOD',
        createdAt: new Date().toISOString(),
        read: false
      });
    }
    
    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);

    return res.json({ ok: true, event });
  } catch (e) {
    console.error('create event error', e);
    return res.status(500).json({ error: e.message });
  }
});

// ---------- helper utilities for new features ----------

function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getHOD() {
  const teachers = readJson(TEACHERS_FILE) || [];
  return teachers.find(t => t.role === 'HOD');
}

function getNewsletterInCharge() {
  const teachers = readJson(TEACHERS_FILE) || [];
  return teachers.find(t => t.role === 'Newsletter In-Charge');
}

function ensureTeacherData() {
  let teachers = readJson(TEACHERS_FILE) || [];
  if (teachers.length === 0) {
    teachers = [
      { id: 't1', name: 'Alice Smith', email: 'alice@example.com', role: 'Teacher' },
      { id: 't2', name: 'Bob Johnson', email: 'bob@example.com', role: 'Newsletter In-Charge' },
      { id: 'hod1', name: 'Dr. HOD', email: 'hod@example.com', role: 'HOD' }
    ];
    writeJson(TEACHERS_FILE, teachers);
  }
}

function seedSampleEvents() {
  const events = readJson(EVENTS_FILE) || [];
  if (events.length === 0) {
    const sample = [
      {
        id: uuidv4(),
        name: 'Technical Workshop on AI',
        description: 'Hands-on workshop introducing AI tools and applications.',
        venue: 'Auditorium A',
        date: '2026-03-10',
        startTime: '10:00',
        endTime: '13:00',
        department: 'Computer Science',
        createdBy: 'Alice Smith',
        hostedBy: 'Alice Smith',
        eventType: 'Workshop',
        status: 'Upcoming',
        isHODCreated: false,
        poster: null,
        venueConfirmation: null,
        guestConfirmation: null,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Coding Hackathon 2026',
        description: '24‑hour team coding challenge.',
        venue: 'Lab 204',
        date: '2026-04-05',
        startTime: '09:00',
        endTime: '09:00',
        department: 'Computer Science',
        createdBy: 'Bob Johnson',
        hostedBy: 'Bob Johnson',
        eventType: 'Hackathon',
        status: 'Upcoming',
        isHODCreated: false,
        poster: null,
        venueConfirmation: null,
        guestConfirmation: null,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Guest Lecture on Cybersecurity',
        description: 'Expert talk on modern cybersecurity threats.',
        venue: 'Conference Hall',
        date: '2026-03-20',
        startTime: '11:00',
        endTime: '12:30',
        department: 'Computer Science',
        createdBy: 'Alice Smith',
        hostedBy: 'Alice Smith',
        eventType: 'Lecture',
        status: 'Upcoming',
        isHODCreated: false,
        poster: null,
        venueConfirmation: null,
        guestConfirmation: null,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Project Expo',
        description: 'Showcase of student projects.',
        venue: 'Exhibition Gallery',
        date: '2026-05-15',
        startTime: '14:00',
        endTime: '17:00',
        department: 'Computer Science',
        createdBy: 'Bob Johnson',
        hostedBy: 'Bob Johnson',
        eventType: 'Expo',
        status: 'Upcoming',
        isHODCreated: false,
        poster: null,
        venueConfirmation: null,
        guestConfirmation: null,
        createdAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        name: 'Seminar on Cloud Computing',
        description: 'In-depth seminar covering cloud platforms.',
        venue: 'Seminar Room 1',
        date: '2026-03-25',
        startTime: '15:00',
        endTime: '17:00',
        department: 'Computer Science',
        createdBy: 'Alice Smith',
        hostedBy: 'Alice Smith',
        eventType: 'Seminar',
        status: 'Upcoming',
        isHODCreated: false,
        poster: null,
        venueConfirmation: null,
        guestConfirmation: null,
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(EVENTS_FILE, sample);
  }
}

// call seeds during startup
ensureTeacherData();
seedSampleEvents();

// update overdue detection helper
function updateOverdueSubmissions() {
  const events = readJson(EVENTS_FILE) || [];
  const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
  const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
  const hod = getHOD();
  let dirty = false;

  events.forEach(event => {
    if (event.status === 'completed') {
      const deadline = new Date(addDays(event.date, 3));
      const now = new Date();
      const submission = submissions.find(s => s.event_id === event.id);
      if (!submission && now > deadline) {
        if (!event.overdueNotified) {
          dirty = true;
          event.overdueNotified = true;
          notifications.push({
            id: uuidv4(),
            type: 'report_overdue',
            eventId: event.id,
            message: `Report deadline passed for event "${event.name}"`,
            recipient: event.createdBy,
            createdAt: new Date().toISOString(),
            read: false
          });
          if (hod) {
            notifications.push({
              id: uuidv4(),
              type: 'report_overdue',
              eventId: event.id,
              message: `Report deadline passed for event "${event.name}"`,
              recipient: hod.name || 'HOD',
              createdAt: new Date().toISOString(),
              read: false
            });
          }
        }
      }
    }
  });
  if (dirty) {
    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);
    writeJson(EVENTS_FILE, events);
  }
}

// run overdue check periodically (every hour)
setInterval(updateOverdueSubmissions, 1000 * 60 * 60);


// Get all events (with filtering options)
app.get('/api/events', (req, res) => {
  const { status, department, createdBy } = req.query;
  try {
    let events = readJson(EVENTS_FILE) || [];
    
    if (status) events = events.filter(e => e.status === status);
    if (department) events = events.filter(e => e.department === department);
    if (createdBy) events = events.filter(e => e.createdBy === createdBy);
    
    return res.json({ ok: true, events });
  } catch (e) {
    console.error('list events error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get single event with comments
app.get('/api/events/:eventId', (req, res) => {
  const { eventId } = req.params;
  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    const comments = readJson(EVENT_COMMENTS_FILE) || [];
    const eventComments = comments.filter(c => c.eventId === eventId);
    
    return res.json({ ok: true, event, comments: eventComments });
  } catch (e) {
    console.error('get event error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Add comment/reply to event (HOD or teacher can comment)
app.post('/api/events/:eventId/comment', (req, res) => {
  const { eventId } = req.params;
  const { text, author, role } = req.body || {}; // role: 'teacher' or 'hod'
  
  if (!text || !author || !role) {
    return res.status(400).json({ error: 'Missing text, author, or role' });
  }

  try {
    const comments = readJson(EVENT_COMMENTS_FILE) || [];
    const comment = {
      id: uuidv4(),
      eventId,
      author,
      role,
      text,
      createdAt: new Date().toISOString()
    };
    comments.push(comment);
    writeJson(EVENT_COMMENTS_FILE, comments);

    // Create notification for the other party
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (event) {
      const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
      const recipient = role === 'hod' ? event.createdBy : 'HOD';
      notifications.push({
        id: uuidv4(),
        type: 'event_comment',
        eventId,
        message: `New comment on event "${event.name}" from ${author}`,
        recipient,
        createdAt: new Date().toISOString(),
        read: false
      });
      writeJson(EVENT_NOTIFICATIONS_FILE, notifications);
    }

    return res.json({ ok: true, comment });
  } catch (e) {
    console.error('add comment error', e);
    return res.status(500).json({ error: e.message });
  }
});

// HOD approves/rejects event
app.post('/api/events/:eventId/approve', async (req, res) => {
  const { eventId } = req.params;
  const { approved, hodName } = req.body || {};
  
  if (approved === undefined) {
    return res.status(400).json({ error: 'Missing approved status' });
  }

  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.status = approved ? 'approved' : 'rejected';
    event.approvedBy = hodName || 'HOD';
    event.approvedAt = new Date().toISOString();
    writeJson(EVENTS_FILE, events);

    // Notify teacher of approval/rejection
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    notifications.push({
      id: uuidv4(),
      type: 'event_' + (approved ? 'approved' : 'rejected'),
      eventId,
      message: `Your event "${event.name}" has been ${approved ? 'approved' : 'rejected'}`,
      recipient: event.createdBy,
      createdAt: new Date().toISOString(),
      read: false
    });

    // If approved, notify all teachers
    if (approved) {
      const classes = readJson(LOCAL_CLASSES_FILE) || [];
      const teachers = [...new Set(classes.map(c => c.owner))];
      
      for (const teacher of teachers) {
        if (teacher !== event.createdBy) { // Don't notify the creator
          notifications.push({
            id: uuidv4(),
            type: 'event_notification',
            eventId,
            message: `New event: "${event.name}" on ${event.date}`,
            recipient: teacher,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      }
    }

    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);

    return res.json({ ok: true, event });
  } catch (e) {
    console.error('approve event error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get notifications for user
app.get('/api/events/notifications/:user', (req, res) => {
  const { user } = req.params;
  try {
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    const userNotifications = notifications.filter(n => n.recipient === user || n.recipient === 'HOD');
    return res.json({ ok: true, notifications: userNotifications });
  } catch (e) {
    console.error('get notifications error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Mark notification as read
app.post('/api/events/notifications/:notificationId/read', (req, res) => {
  const { notificationId } = req.params;
  try {
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    
    notification.read = true;
    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);
    
    return res.json({ ok: true, notification });
  } catch (e) {
    console.error('mark read error', e);
    return res.status(500).json({ error: e.message });
  }
});

// ==================== ENHANCED ASSIGNMENTS & SUBMISSIONS ====================

// Generate unique assignment token
function generateAssignmentToken() {
  return 'asgn_' + uuidv4().slice(0, 8);
}

// Create enhanced assignment with unique token
app.post('/api/assignments/create', (req, res) => {
  const { 
    classId, title, description, type, subType, dueDate, maxMarks, 
    createdBy, dynamicFields, assignedStudents 
  } = req.body || {};
  
  if (!classId || !title) {
    return res.status(400).json({ error: 'Missing classId or title' });
  }

  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignmentId = uuidv4();
    const assignmentToken = generateAssignmentToken();
    
    const assignment = {
      id: assignmentId,
      token: assignmentToken,
      classId,
      title,
      description: description || '',
      type: type || 'general', // 'proactive' or 'reactive'
      subType: subType || '',
      dueDate: dueDate || null,
      maxMarks: maxMarks || 100,
      createdBy: createdBy || 'system',
      dynamicFields: dynamicFields || {},
      assignedStudents: assignedStudents || [],
      status: 'active', // 'active', 'closed', 'overdue'
      createdAt: new Date().toISOString(),
      submissionCount: 0,
      reviewedCount: 0
    };
    
    assignments.push(assignment);
    writeJson(LOCAL_ASSIGNMENTS_FILE, assignments);
    
    return res.json({ ok: true, assignment });
  } catch (e) {
    console.error('create assignment error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get all assignments with submission stats
app.get('/api/assignments', (req, res) => {
  const { classId, type, status } = req.query;
  try {
    let assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    
    // Filter assignments
    if (classId) assignments = assignments.filter(a => a.classId === classId);
    if (type) assignments = assignments.filter(a => a.type === type);
    if (status) assignments = assignments.filter(a => a.status === status);
    
    // Calculate stats for each assignment
    const assignmentsWithStats = assignments.map(a => {
      const assignmentSubmissions = submissions.filter(s => s.assignmentId === a.id);
      const totalStudents = a.assignedStudents ? a.assignedStudents.length : 0;
      const received = assignmentSubmissions.length;
      const pending = totalStudents - received;
      const reviewed = assignmentSubmissions.filter(s => s.status === 'Reviewed').length;
      
      // Determine status based on due date
      let currentStatus = a.status;
      if (a.dueDate && new Date(a.dueDate) < new Date()) {
        currentStatus = 'overdue';
      }
      
      return {
        ...a,
        totalStudentsAssigned: totalStudents,
        submissionsReceived: received,
        pendingSubmissions: pending,
        reviewedCount: reviewed,
        status: currentStatus
      };
    });
    
    return res.json({ ok: true, assignments: assignmentsWithStats });
  } catch (e) {
    console.error('list assignments error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get single assignment with full details
app.get('/api/assignments/:id', (req, res) => {
  const { id } = req.params;
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === id);
    
    return res.json({ 
      ok: true, 
      assignment,
      submissions: assignmentSubmissions 
    });
  } catch (e) {
    console.error('get assignment error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Submit assignment (student submission)
app.post('/api/assignments/submit', upload.single('file'), (req, res) => {
  const { assignmentToken, studentName, studentEmail, submissionType, textResponse, linkResponse } = req.body || {};
  
  if (!assignmentToken || !studentName || !studentEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.token === assignmentToken);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Check deadline
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
      return res.status(400).json({ error: 'Deadline has passed' });
    }
    
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    const submission = {
      id: uuidv4(),
      assignmentId: assignment.id,
      assignmentToken: assignmentToken,
      studentName,
      studentEmail,
      submissionType: submissionType || 'file', // 'file', 'text', 'link'
      filePath: null,
      fileName: null,
      textResponse: textResponse || null,
      linkResponse: linkResponse || null,
      submittedAt: new Date().toISOString(),
      status: 'Submitted', // 'Submitted', 'Reviewed'
      marks: null,
      feedback: null,
      reviewedAt: null,
      reviewedBy: null
    };
    
    // Handle file upload
    if (req.file) {
      const classId = assignment.classId;
      const dir = path.join(UPLOADS_DIR, 'assignments', classId);
      try { fs.mkdirSync(dir, { recursive: true }); } catch(e){}
      const unique = Date.now() + '-' + Math.random().toString(36).slice(2,8);
      const newFilename = unique + '-' + req.file.originalname;
      const destPath = path.join(dir, newFilename);
      fs.copyFileSync(req.file.path, destPath);
      submission.filePath = path.relative(__dirname, destPath);
      submission.fileName = req.file.originalname;
    }
    
    submissions.push(submission);
    writeJson(SUBMISSIONS_FILE, submissions);
    
    // Update assignment submission count
    assignment.submissionCount = (assignment.submissionCount || 0) + 1;
    writeJson(LOCAL_ASSIGNMENTS_FILE, assignments);
    
    return res.json({ ok: true, submission });
  } catch (e) {
    console.error('submit assignment error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Update submission (marks, feedback, status)
app.post('/api/assignments/submission/:id/update', (req, res) => {
  const { id } = req.params;
  const { marks, feedback, status, reviewedBy } = req.body || {};
  
  try {
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    const submission = submissions.find(s => s.id === id);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    
    if (marks !== undefined) submission.marks = marks;
    if (feedback !== undefined) submission.feedback = feedback;
    if (status !== undefined) {
      submission.status = status;
      if (status === 'Reviewed') {
        submission.reviewedAt = new Date().toISOString();
        submission.reviewedBy = reviewedBy || 'Teacher';
      }
    }
    
    writeJson(SUBMISSIONS_FILE, submissions);
    
    // Update reviewed count in assignment
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.id === submission.assignmentId);
    if (assignment) {
      const reviewedCount = submissions.filter(s => s.assignmentId === assignment.id && s.status === 'Reviewed').length;
      assignment.reviewedCount = reviewedCount;
      writeJson(LOCAL_ASSIGNMENTS_FILE, assignments);
    }
    
    return res.json({ ok: true, submission });
  } catch (e) {
    console.error('update submission error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get assignment by token (for student view)
app.get('/api/assignments/token/:token', (req, res) => {
  const { token } = req.params;
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.token === token);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    return res.json({ ok: true, assignment });
  } catch (e) {
    console.error('get assignment by token error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get submission stats for monitoring
app.get('/api/assignments/stats', (req, res) => {
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    
    const stats = {
      totalAssignments: assignments.length,
      activeAssignments: assignments.filter(a => a.status === 'active').length,
      overdueAssignments: assignments.filter(a => a.dueDate && new Date(a.dueDate) < new Date()).length,
      totalSubmissions: submissions.length,
      reviewedSubmissions: submissions.filter(s => s.status === 'Reviewed').length,
      pendingSubmissions: submissions.filter(s => s.status !== 'Reviewed').length
    };
    
    return res.json({ ok: true, stats });
  } catch (e) {
    console.error('get stats error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get monitoring data for all assignments
app.get('/api/monitoring/assignments', (req, res) => {
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    
    const monitoringData = assignments.map(assignment => {
      const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignment.id);
      const totalStudents = assignment.assignedStudents ? assignment.assignedStudents.length : 0;
      const submittedCount = assignmentSubmissions.length;
      const reviewedCount = assignmentSubmissions.filter(s => s.status === 'Reviewed').length;
      const pendingCount = submittedCount - reviewedCount;
      
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
        token: assignment.token,
        totalStudents,
        submittedCount,
        reviewedCount,
        pendingCount,
        notSubmittedCount: totalStudents - submittedCount,
        dueDate: assignment.dueDate,
        status,
        progress: totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0
      };
    });
    
    return res.json({ ok: true, assignments: monitoringData });
  } catch (e) {
    console.error('monitoring assignments error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get detailed view for a specific assignment
app.get('/api/monitoring/assignments/:assignmentId', (req, res) => {
  const { assignmentId } = req.params;
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    const assignmentSubmissions = submissions.filter(s => s.assignmentId === assignmentId);
    
    // Build student details
    const studentDetails = (assignment.assignedStudents || []).map(student => {
      const submission = assignmentSubmissions.find(s => s.studentId === student.id);
      const subStatus = submission ? submission.status : 'Not Started';
      
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        status: subStatus,
        submissionTimestamp: submission ? submission.submittedAt : null,
        fileName: submission ? submission.fileName : null,
        filePath: submission ? submission.filePath : null,
        linkResponse: submission ? submission.linkResponse : null,
        marks: submission ? submission.marks : null,
        feedback: submission ? submission.feedback : null,
        submissionId: submission ? submission.id : null
      };
    });
    
    return res.json({ ok: true, assignment, studentDetails });
  } catch (e) {
    console.error('monitoring assignment details error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Update submission with marks and feedback
app.post('/api/monitoring/submissions/:submissionId/review', (req, res) => {
  const { submissionId } = req.params;
  const { marks, feedback, status } = req.body;
  
  try {
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    
    submission.marks = marks;
    submission.feedback = feedback;
    submission.status = status || 'Reviewed';
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = 'teacher_john';
    
    writeJson(SUBMISSIONS_FILE, submissions);
    return res.json({ ok: true, submission });
  } catch (e) {
    console.error('review submission error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Student view: Get assignment by token
app.get('/api/student/assignment/:token', (req, res) => {
  const { token } = req.params;
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.token === token);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Return assignment details without sensitive fields
    const result = {
      id: assignment.id,
      token: assignment.token,
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      assignedStudents: assignment.assignedStudents || [],
      dynamicFields: assignment.dynamicFields || {}
    };
    
    return res.json({ ok: true, assignment: result });
  } catch (e) {
    console.error('get assignment by token error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Student submission
app.post('/api/student/submit/:token', upload.single('file'), (req, res) => {
  const { token } = req.params;
  const { studentName, studentEmail, studentId, submissionType, textResponse, linkResponse } = req.body;
  
  if (!token || !studentName || !studentEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const assignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const assignment = assignments.find(a => a.token === token);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    // Create submission record
    const submissions = readJson(SUBMISSIONS_FILE) || [];
    const submission = {
      id: uuidv4(),
      assignmentId: assignment.id,
      assignmentToken: token,
      studentId: studentId || 'anonymous',
      studentName,
      studentEmail,
      submissionType: submissionType || 'file',
      filePath: req.file ? `uploads/${assignment.id}/${req.file.filename}` : null,
      fileName: req.file ? req.file.originalname : null,
      textResponse: textResponse || null,
      linkResponse: linkResponse || null,
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      marks: null,
      feedback: null,
      reviewedAt: null,
      reviewedBy: null
    };
    
    submissions.push(submission);
    writeJson(SUBMISSIONS_FILE, submissions);
    
    // Update submission count in assignment
    const updatedAssignments = readJson(LOCAL_ASSIGNMENTS_FILE) || [];
    const updatedAssignment = updatedAssignments.find(a => a.id === assignment.id);
    if (updatedAssignment) {
      updatedAssignment.submissionCount = (updatedAssignment.submissionCount || 0) + 1;
      writeJson(LOCAL_ASSIGNMENTS_FILE, updatedAssignments);
    }
    
    return res.json({ ok: true, submission });
  } catch (e) {
    console.error('student submit error', e);
    return res.status(500).json({ error: e.message });
  }
});
// ==================== EVENT SUBMISSION WORKFLOW ====================

// Multer for event submission files
const eventSubmissionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const eventId = req.params.eventId || 'misc';
    const dir = path.join(UPLOADS_DIR, 'event-submissions', eventId);
    try { fs.mkdirSync(dir, { recursive: true }); } catch(e){}
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2,8);
    cb(null, unique + '-' + file.originalname);
  }
});
const eventSubmissionUpload = multer({ 
  storage: eventSubmissionStorage, 
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB for multiple files
});

// Submit event report (only hosting teacher can submit)
app.post('/api/events/:eventId/submit', eventSubmissionUpload.fields([
  { name: 'reportFile', maxCount: 1 },
  { name: 'newsletter', maxCount: 1 },
  { name: 'highlightPhoto1', maxCount: 1 },
  { name: 'highlightPhoto2', maxCount: 1 },
  { name: 'eventPhotos', maxCount: 10 }
]), (req, res) => {
  const { eventId } = req.params;
  const { hostedByTeacherId, hostedByTeacherName, submittedBy } = req.body;

  if (!eventId || !hostedByTeacherId) {
    return res.status(400).json({ error: 'Missing eventId or hostedByTeacherId' });
  }

  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Verify that only the hosting teacher can submit
    if (event.createdBy !== hostedByTeacherName && event.hostedBy !== hostedByTeacherName) {
      return res.status(403).json({ error: 'Only hosting teacher can submit event report' });
    }

    // Check if event is completed (case-insensitive)
    if (((event.status || '').toLowerCase()) !== 'completed') {
      return res.status(400).json({ error: 'Event must be marked as completed before submission' });
    }

    // Enforce report submission deadline (Event Date + 3 days)
    const reportDeadline = addDays(event.date, 3);
    const now = new Date();
    if (now > new Date(reportDeadline)) {
      return res.status(400).json({ error: 'Report submission window has closed' });
    }

    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
    
    // Check if already submitted
    let submission = submissions.find(s => s.event_id === eventId);
    if (!submission) {
      submission = {
        id: uuidv4(),
        event_id: eventId,
        hosted_teacher_id: hostedByTeacherId,
        hosted_teacher_name: hostedByTeacherName,
        report_file: null,
        event_photos: [],
        newsletter_file: null,
        highlight_photo_1: null,
        highlight_photo_2: null,
        submitted_at: null,
        status: 'pending',
        hod_received_at: null,
        newsletter_in_charge_received_at: null
      };
    }

    // Process uploaded files
    if (req.files) {
      if (req.files.reportFile && req.files.reportFile[0]) {
        submission.report_file = req.files.reportFile[0].filename;
      }
      if (req.files.newsletter && req.files.newsletter[0]) {
        submission.newsletter_file = req.files.newsletter[0].filename;
      }
      if (req.files.highlightPhoto1 && req.files.highlightPhoto1[0]) {
        submission.highlight_photo_1 = req.files.highlightPhoto1[0].filename;
      }
      if (req.files.highlightPhoto2 && req.files.highlightPhoto2[0]) {
        submission.highlight_photo_2 = req.files.highlightPhoto2[0].filename;
      }
      if (req.files.eventPhotos && Array.isArray(req.files.eventPhotos)) {
        submission.event_photos = req.files.eventPhotos.map(f => f.filename);
      }
    }

    submission.submitted_at = new Date().toISOString();
    submission.status = 'submitted';

    // Update or add submission
    const existingIndex = submissions.findIndex(s => s.event_id === eventId);
    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }
    writeJson(EVENT_SUBMISSIONS_FILE, submissions);

    // Create notifications for HOD and Newsletter In-Charge
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    const hod = getHOD();
    const nlic = getNewsletterInCharge();

    if (hod) {
      notifications.push({
        id: uuidv4(),
        type: 'report_submitted_hod',
        eventId,
        submissionId: submission.id,
        message: `Event report submitted for "${event.name}" by ${hostedByTeacherName}. Full access granted.`,
        recipient: hod.name || 'HOD',
        createdAt: new Date().toISOString(),
        read: false,
        accessLevel: 'full' // HOD gets full access to all files
      });
    }

    if (nlic) {
      notifications.push({
        id: uuidv4(),
        type: 'report_submitted_nlic',
        eventId,
        submissionId: submission.id,
        message: `Event report submitted for "${event.name}". Newsletter and highlight photos available.`,
        recipient: nlic.name || 'Newsletter In-Charge',
        createdAt: new Date().toISOString(),
        read: false,
        accessLevel: 'newsletter' // NLIC gets only newsletter and highlight photos
      });
    }

    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);

    return res.json({ ok: true, submission });
  } catch (e) {
    console.error('submit event report error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Mark event as completed and auto-create internal task
app.post('/api/events/:eventId/complete', (req, res) => {
  const { eventId } = req.params;
  const { completedBy } = req.body;

  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    event.status = 'completed';
    event.completed_at = new Date().toISOString();
    event.completed_by = completedBy || 'system';

    // Calculate deadline (Event Date + 3 days)
    const reportDeadline = addDays(event.date, 3);

    // Create internal task assignment
    const eventTasks = readJson(EVENT_TASKS_FILE) || [];
    const task = {
      id: uuidv4(),
      event_id: eventId,
      event_name: event.name,
      task_type: 'submit_event_report',
      assigned_to_id: event.createdBy,
      assigned_to_name: event.createdBy || event.hostedBy,
      task_title: `Submit Event Report for ${event.name}`,
      task_description: `Please submit the event report, photos, newsletter, and highlight photos for the event "${event.name}" held on ${event.date}.`,
      deadline: reportDeadline,
      status: 'pending', // 'pending', 'submitted', 'completed', 'overdue'
      created_at: new Date().toISOString(),
      created_by: completedBy || 'system'
    };

    eventTasks.push(task);
    writeJson(EVENT_TASKS_FILE, eventTasks);
    writeJson(EVENTS_FILE, events);

    // Create notification for teaching that report is due
    const notifications = readJson(EVENT_NOTIFICATIONS_FILE) || [];
    notifications.push({
      id: uuidv4(),
      type: 'report_deadline_assigned',
      eventId,
      taskId: task.id,
      message: `Task assigned: Submit Event Report for "${event.name}" - Due ${reportDeadline}`,
      recipient: event.createdBy || event.hostedBy,
      createdAt: new Date().toISOString(),
      read: false
    });

    writeJson(EVENT_NOTIFICATIONS_FILE, notifications);

    return res.json({ ok: true, event, task });
  } catch (e) {
    console.error('complete event error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get event submission status
app.get('/api/events/:eventId/submission', (req, res) => {
  const { eventId } = req.params;

  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
    const submission = submissions.find(s => s.event_id === eventId);

    const eventTasks = readJson(EVENT_TASKS_FILE) || [];
    const task = eventTasks.find(t => t.event_id === eventId && t.task_type === 'submit_event_report');

    const reportDeadline = addDays(event.date, 3);
    const now = new Date();
    const deadlineDate = new Date(reportDeadline);

    let submissionStatus = 'pending';
    if (submission && submission.status === 'submitted') {
      submissionStatus = 'submitted';
    } else if (now > deadlineDate) {
      submissionStatus = 'overdue';
    }

    return res.json({
      ok: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        hosted_by: event.createdBy || event.hostedBy,
        status: event.status
      },
      reportingDeadline: reportDeadline,
      submission: submission || null,
      task: task || null,
      submissionStatus
    });
  } catch (e) {
    console.error('get event submission error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get submission details with role-based filtering
app.get('/api/events/:eventId/submission/review/:userRole/:userName', (req, res) => {
  const { eventId, userRole, userName } = req.params;

  try {
    const events = readJson(EVENTS_FILE) || [];
    const event = events.find(e => e.id === eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
    const submission = submissions.find(s => s.event_id === eventId);
    if (!submission) return res.status(404).json({ error: 'No submission found' });

    // Role-based file filtering
    let accessibleFiles = {
      report_file: null,
      event_photos: [],
      newsletter_file: null,
      highlight_photo_1: null,
      highlight_photo_2: null
    };

    if (userRole === 'HOD') {
      // HOD gets full access to everything
      accessibleFiles = {
        report_file: submission.report_file,
        event_photos: submission.event_photos,
        newsletter_file: submission.newsletter_file,
        highlight_photo_1: submission.highlight_photo_1,
        highlight_photo_2: submission.highlight_photo_2
      };
    } else if (userRole === 'Newsletter In-Charge') {
      // Newsletter In-Charge gets only newsletter and 2 highlight photos
      accessibleFiles = {
        newsletter_file: submission.newsletter_file,
        highlight_photo_1: submission.highlight_photo_1,
        highlight_photo_2: submission.highlight_photo_2
      };
    } else if (userRole === 'hosting_teacher' && userName === submission.hosted_teacher_name) {
      // Hosting teacher can see their own submission
      accessibleFiles = {
        report_file: submission.report_file,
        event_photos: submission.event_photos,
        newsletter_file: submission.newsletter_file,
        highlight_photo_1: submission.highlight_photo_1,
        highlight_photo_2: submission.highlight_photo_2
      };
    } else {
      return res.status(403).json({ error: 'Access denied to submission files' });
    }

    return res.json({
      ok: true,
      submission: {
        id: submission.id,
        event_id: submission.event_id,
        hosted_by: submission.hosted_teacher_name,
        submitted_at: submission.submitted_at,
        status: submission.status,
        files: accessibleFiles,
        access_level: userRole === 'HOD' ? 'full' : (userRole === 'Newsletter In-Charge' ? 'newsletter' : 'owner')
      }
    });
  } catch (e) {
    console.error('get submission review error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get all event submissions for monitoring
app.get('/api/events/submissions/monitoring', (req, res) => {
  try {
    const events = readJson(EVENTS_FILE) || [];
    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
    const tasks = readJson(EVENT_TASKS_FILE) || [];

    const monitoringData = events
      .filter(e => ((e.status || '').toLowerCase() === 'completed'))
      .map(event => {
        const submission = submissions.find(s => s.event_id === event.id);
        const task = tasks.find(t => t.event_id === event.id);
        const reportDeadline = addDays(event.date, 3);
        const now = new Date();

        let status = 'pending';
        if (submission && submission.status === 'submitted') {
          status = 'submitted';
        } else if (now > new Date(reportDeadline)) {
          status = 'overdue';
        }

        return {
          id: event.id,
          name: event.name,
          date: event.date,
          hosted_by: event.createdBy || event.hostedBy,
          report_deadline: reportDeadline,
          submission_status: status,
          submitted_at: submission ? submission.submitted_at : null,
          files_count: submission ? (submission.event_photos ? submission.event_photos.length : 0) + 3 : 0 // 3 = report, newsletter, highlight
        };
      });

    return res.json({ ok: true, submissions: monitoringData });
  } catch (e) {
    console.error('monitoring submissions error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get events for a specific teacher (hosting or created by)
app.get('/api/events/teacher/my-events/:teacherName', (req, res) => {
  const { teacherName } = req.params;

  try {
    const events = readJson(EVENTS_FILE) || [];
    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];

    const myEvents = events
      .filter(e => (e.createdBy === teacherName || e.hostedBy === teacherName))
      .map(event => {
        const submission = submissions.find(s => s.event_id === event.id) || null;
        const reportDeadline = addDays(event.date, 3);
        const now = new Date();
        const deadlineDate = new Date(reportDeadline);

        let submissionStatus = 'pending';
        if (submission && submission.status === 'submitted') submissionStatus = 'submitted';
        else if (now > deadlineDate) submissionStatus = 'overdue';

        const hosting = (event.createdBy === teacherName || event.hostedBy === teacherName);

        return {
          id: event.id,
          name: event.name,
          date: event.date,
          venue: event.venue,
          hosted_by: event.createdBy || event.hostedBy,
          status: event.status,
          reportingDeadline: reportDeadline,
          submission: submission || null,
          submissionStatus,
          uploadAllowed: hosting && (((event.status || '').toLowerCase() === 'completed') && (now <= deadlineDate) && submissionStatus !== 'submitted')
        };
      });

    return res.json({ ok: true, events: myEvents });
  } catch (e) {
    console.error('get teacher my-events error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Download submission file (with role-based access)
app.get('/api/events/submissions/download/:fileId', (req, res) => {
  const { fileId } = req.params;
  const { userRole, userName } = req.query;

  try {
    // Find the file in event submissions
    const submissions = readJson(EVENT_SUBMISSIONS_FILE) || [];
    let submission = null;
    let fieldName = null;

    for (const sub of submissions) {
      if (sub.report_file === fileId || sub.newsletter_file === fileId || 
          sub.highlight_photo_1 === fileId || sub.highlight_photo_2 === fileId ||
          (sub.event_photos && sub.event_photos.includes(fileId))) {
        submission = sub;
        if (sub.report_file === fileId) fieldName = 'report_file';
        else if (sub.newsletter_file === fileId) fieldName = 'newsletter_file';
        else if (sub.highlight_photo_1 === fileId) fieldName = 'highlight_photo_1';
        else if (sub.highlight_photo_2 === fileId) fieldName = 'highlight_photo_2';
        else fieldName = 'event_photo';
        break;
      }
    }

    if (!submission) return res.status(404).json({ error: 'File not found' });

    // Check role-based access
    if (userRole === 'Newsletter In-Charge') {
      if (fieldName !== 'newsletter_file' && fieldName !== 'highlight_photo_1' && fieldName !== 'highlight_photo_2') {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (userRole !== 'HOD' && userRole !== 'hosting_teacher') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const filePath = path.join(UPLOADS_DIR, 'event-submissions', submission.event_id, fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath);
  } catch (e) {
    console.error('download file error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Update event task status (for internal tracking)
app.post('/api/events/tasks/:taskId/update', (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'Missing status' });

  try {
    const tasks = readJson(EVENT_TASKS_FILE) || [];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.status = status;
    if (status === 'completed') {
      task.completed_at = new Date().toISOString();
    }

    writeJson(EVENT_TASKS_FILE, tasks);
    return res.json({ ok: true, task });
  } catch (e) {
    console.error('update task error', e);
    return res.status(500).json({ error: e.message });
  }
});

// Get teacher event tasks
app.get('/api/events/tasks/:teacherName', (req, res) => {
  const { teacherName } = req.params;

  try {
    const tasks = readJson(EVENT_TASKS_FILE) || [];
    const teacherTasks = tasks.filter(t => t.assigned_to_name === teacherName);

    // Sort by deadline
    teacherTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    return res.json({ ok: true, tasks: teacherTasks });
  } catch (e) {
    console.error('get teacher tasks error', e);
    return res.status(500).json({ error: e.message });
  }
});
