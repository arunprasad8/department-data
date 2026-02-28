/*
 * Simple migration runner for local JSON storage.
 * When the project moves to a real database (Postgres, etc.)
 * replace with proper migration tool (knex, sequelize, flyway).
 */

const fs = require('fs');
const path = require('path');

const LOCAL_ASSIGNMENTS_FILE = path.join(__dirname, '..', 'data', 'localAssignments.json');
const TEACHERS_FILE = path.join(__dirname, '..', 'data', 'teachers.json');
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events.json');

function run() {
  // assignment cutoff migration
  if (fs.existsSync(LOCAL_ASSIGNMENTS_FILE)) {
    let assignments = JSON.parse(fs.readFileSync(LOCAL_ASSIGNMENTS_FILE, 'utf8') || '[]');
    let changed = false;
    assignments = assignments.map(a => {
      if (a.cutoff_percentage === undefined) {
        a.cutoff_percentage = 50; // default value for pre-existing assignments
        changed = true;
      }
      return a;
    });
    if (changed) {
      fs.writeFileSync(LOCAL_ASSIGNMENTS_FILE, JSON.stringify(assignments, null, 2));
      console.log('Migration: added cutoff_percentage to existing assignments');
    } else {
      console.log('Migration: no assignment changes needed');
    }
  }

  // teacher signatures and custom type container
  if (fs.existsSync(TEACHERS_FILE)) {
    let teachers = JSON.parse(fs.readFileSync(TEACHERS_FILE, 'utf8') || '[]');
    let tchChanged = false;
    teachers = teachers.map(t => {
      if (t.signaturePath === undefined) {
        t.signaturePath = null;
        tchChanged = true;
      }
      if (t.customTypes === undefined) {
        t.customTypes = [];
        tchChanged = true;
      }
      return t;
    });
    if (tchChanged) {
      fs.writeFileSync(TEACHERS_FILE, JSON.stringify(teachers, null, 2));
      console.log('Migration: added signaturePath/customTypes to existing teachers');
    }
  }

  // event HOD signing flag
  if (fs.existsSync(EVENTS_FILE)) {
    let events = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8') || '[]');
    let evChanged = false;
    events = events.map(e => {
      if (e.newsletterHODSigned === undefined) {
        e.newsletterHODSigned = false;
        evChanged = true;
      }
      return e;
    });
    if (evChanged) {
      fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
      console.log('Migration: added newsletterHODSigned to existing events');
    }
  }
}

if (require.main === module) run();