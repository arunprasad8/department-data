# 📊 CIA Dashboard - System Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WEB BROWSER (Client-Side)               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         LOGIN LAYER (login.html)                    │  │
│  │  • User Input Form                                  │  │
│  │  • Credential Validation (login-script.js)         │  │
│  │  • Session Storage (auth.js)                        │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │       DASHBOARD LAYER (dashboard.html)              │  │
│  │  • Role Detection (sample-data.js)                 │  │
│  │  • Dynamic UI Rendering                             │  │
│  │  • Navigation & Controls                            │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      ANALYTICS LAYER (dashboard-script.js)          │  │
│  │  • Data Processing                                  │  │
│  │  • Statistical Calculations                         │  │
│  │  • Chart Generation (Chart.js)                      │  │
│  │  • File Processing (XLSX)                           │  │
│  └─────────────────────────────────────────────────────┘  │
│                           ↓                                │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      PRESENTATION LAYER (dashboard-styles.css)      │  │
│  │  • Responsive Layout                                │  │
│  │  • Visual Styling                                   │  │
│  │  • Charts & Tables                                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│            DATA STORAGE (JavaScript Objects)               │
│  • User Credentials (login-script.js)                      │
│  • Classes & Subjects (sample-data.js)                     │
│  • Sample Student Data (generated on demand)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Journey Flow

```
START
  ↓
┌─────────────────────────┐
│   Open login.html       │
│   See Login Form        │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ Enter Username          │
│ Enter Password          │
└────────┬────────────────┘
         │
         ↓
┌─────────────────────────┐
│ login-script.js         │
│ Validates Credentials   │
└────┬──────────────┬──────┘
     │              │
  VALID         INVALID
     │              │
     ↓              ↓
┌────────┐   ┌──────────────┐
│SESSION │   │Show Error    │
│CREATED │   │Try Again     │
└────┬───┘   └──────────────┘
     │
     ↓
┌──────────────────────────┐
│ Redirect to              │
│ dashboard.html           │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ auth.js Checks Session   │
│ User Data Retrieved      │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│ sample-data.js           │
│ Determines User Role     │
└────┬──────┬──────┬───────┘
     │      │      │
  ADMIN    CLASS  TEACHER
   │       TEACHER │
   ↓       │       ↓
┌──────┐   ↓   ┌──────────┐
│Admin │ ┌────┐│Teacher   │
│View  │ │CT  ││View      │
│      │ │View││          │
└──────┘ │    │└──────────┘
         └────┘
         
    ↓    ↓    ↓
    
DASHBOARD DISPLAYED
    │
    ↓
┌──────────────────────┐
│ User Sees Role-      │
│ Specific Classes/    │
│ Subjects             │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ User Clicks Subject  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ sample-data.js       │
│ Generates Sample     │
│ Student Data         │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ dashboard-script.js  │
│ • Processes Data     │
│ • Calculates Stats   │
│ • Generates Charts   │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Analytics Dashboard  │
│ Displayed with       │
│ Tables & Charts      │
└──────┬───────────────┘
       │
       ├─→ View Stats
       │
       ├─→ View Charts
       │
       ├─→ View Students
       │
       └─→ Back Button
              │
              ↓
          ┌────────┐
          │Logout? │
          │Yes ↓   │
          └────────┘
            │
            ↓
      ┌──────────────┐
      │ Clear Session│
      │ Return Login │
      └──────────────┘
            │
            ↓
          END
```

---

## 🎭 Role-Based Data Flow

```
ADMIN (hod_rajesh)
    │
    ├─→ Auth Check: ✓ ADMIN
    │
    └─→ sample-data.js
        │
        ├─ Get all classes
        │   ├─ B.Tech-CSE-2A
        │   ├─ B.Tech-ECE-2B
        │   └─ B.Tech-ME-3C
        │
        └─ Get all subjects (9 total)
            ├─ Data Structures
            ├─ Database Systems
            ├─ Web Development
            ├─ Digital Electronics
            ├─ Signals and Systems
            ├─ Microprocessors
            ├─ Thermodynamics
            ├─ Fluid Mechanics
            └─ Heat Transfer

CLASS TEACHER (ct_amit)
    │
    ├─→ Auth Check: ✓ CLASS_TEACHER
    │
    ├─→ assignedClass: B.Tech-CSE-2A
    │
    └─→ sample-data.js
        │
        └─ Get only CSE-2A subjects (3)
            ├─ Data Structures
            ├─ Database Systems
            └─ Web Development

TEACHER (teacher_anil)
    │
    ├─→ Auth Check: ✓ TEACHER
    │
    ├─→ assignedSubject: Data Structures
    │
    └─→ sample-data.js
        │
        └─ Get only Data Structures
            └─ (appears in B.Tech-CSE-2A)
```

---

## 📊 Data Processing Pipeline

```
USER CLICKS SUBJECT
        ↓
┌──────────────────────────────┐
│ loadSampleDataAndShowDashboard│
│ (sample-data.js)             │
│ • Get classCode & subject    │
│ • Call generateSampleData()  │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ generateSampleData()         │
│ • Retrieve student list      │
│ • Generate marks (1-100)     │
│ • Create data objects        │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ processData()                │
│ (dashboard-script.js)        │
└────────┬─────────────────────┘
         │
    ┌────┴────┬────────┬─────────┐
    ↓         ↓        ↓         ↓
┌────────┐┌────────┐┌──────┐┌───────┐
│Filter  ││Calc    ││Build ││Create │
│Marks   ││Stats   ││Bins  ││Charts │
└────────┘└────────┘└──────┘└───────┘
    │         │        │         │
    ↓         ↓        ↓         ↓
┌─────────────────────────────────────┐
│ Update DOM with Results             │
│ • Stats Table                       │
│ • Bins Table                        │
│ • Risk Chart                        │
│ • Performance Chart                 │
│ • Student Marks Chart               │
│ • Critical Students List (if any)   │
└─────────────────────────────────────┘
```

---

## 🔒 Authentication & Session Flow

```
LOGIN FORM SUBMITTED
        ↓
┌─────────────────────────────────┐
│ login-script.js                 │
│ validateCredentials()           │
│ • Check usersDatabase           │
│ • Verify password               │
└────┬──────────────────┬─────────┘
     │                  │
  FOUND             NOT FOUND
  MATCH              │
     │               ↓
     │          ┌──────────────┐
     │          │ Show Error   │
     │          │ Message      │
     │          └──────────────┘
     │
     ↓
┌──────────────────────────────┐
│ sessionStorage.setItem(      │
│   'currentUser',             │
│   JSON.stringify(user_obj)   │
│ )                            │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ window.location.href =       │
│ 'dashboard.html'             │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ auth.js on Page Load         │
│ getCurrentUser()             │
│ • Check sessionStorage       │
│ • Parse user data            │
│ • Display user info in navbar│
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ User Logged In Successfully  │
│ Dashboard Rendered           │
└──────────────────────────────┘


LOGOUT BUTTON CLICKED
        ↓
┌──────────────────────────────┐
│ logoutUser()                 │
│ (auth.js)                    │
│ • sessionStorage.removeItem()│
│ • window.location.href =     │
│   'login.html'               │
└──────────────────────────────┘
```

---

## 📈 Sample Data Generation

```
FOR EACH SUBJECT
    │
    ├─→ Get Student List (8 students)
    │
    ├─→ FOR EACH STUDENT
    │   │
    │   ├─→ Generate Random Number (0-1)
    │   │
    │   ├─→ IF < 0.10
    │   │   └─→ Mark as ABSENT ("ab")
    │   │
    │   ├─→ ELSE IF < 0.20
    │   │   └─→ LOW MARKS (15-30)
    │   │
    │   └─→ ELSE
    │       └─→ NORMAL MARKS (55-95)
    │
    └─→ Create Mark Data Object
        {
          'Roll No': '...',
          'Name': '...',
          'Subject': '...',
          'Marks': <0-100 or 'ab'>
        }
```

---

## 🎯 Role Access Decision Tree

```
USER LOGGED IN
        ↓
┌────────────────────────┐
│ Check user.role        │
└────┬───────┬───────────┘
     │       │
  ADMIN    CLASS_TEACHER
     │       │
     ↓       ↓ ┌─────────────┐
  ┌──────┐  ├─→│ Check       │
  │Render│  │  │ Assigned    │
  │Admin │  │  │ Class       │
  │View  │  │  └──┬──────────┘
  │(9    │  │     │
  │subj) │  │     ↓
  └──────┘  │  ┌──────────────┐
            │  │ Render CT    │
            │  │ View         │
            │  │ (3 subjects) │
            │  └──────────────┘
            │
            ↓ (else)
        TEACHER
            │
            ├─→ Check
            │   assignedSubject
            │
            └─→ Render Teacher
                View
                (1 subject)
```

---

## 📋 Database Structure

```
USERS DATABASE (login-script.js)
│
├─ Admin Users
│  ├─ hod_rajesh
│  │  ├─ password: hod123456
│  │  ├─ role: admin
│  │  ├─ name: Dr. Rajesh Sharma
│  │  └─ adminRole: HOD
│  │
│  └─ pc_priya
│     ├─ password: pc123456
│     ├─ role: admin
│     ├─ name: Ms. Priya Patel
│     └─ adminRole: Program Coordinator
│
├─ Class Teachers
│  ├─ ct_amit
│  │  ├─ password: ct123456
│  │  ├─ role: classTeacher
│  │  ├─ name: Mr. Amit Kumar
│  │  └─ assignedClass: B.Tech-CSE-2A
│  │
│  ├─ ct_neha
│  │  └─ assignedClass: B.Tech-ECE-2B
│  │
│  └─ ct_vikram
│     └─ assignedClass: B.Tech-ME-3C
│
└─ Teachers
   ├─ teacher_anil
   │  ├─ assignedSubject: Data Structures
   │  └─ assignedClasses: [B.Tech-CSE-2A]
   │
   ├─ teacher_suresh
   │  ├─ assignedSubject: Digital Electronics
   │  └─ assignedClasses: [B.Tech-ECE-2B]
   │
   └─ (4 more teachers...)


CLASSES DATABASE (sample-data.js)
│
├─ B.Tech-CSE-2A
│  ├─ className: B.Tech Computer Science...
│  └─ subjects:
│     ├─ Data Structures
│     ├─ Database Systems
│     └─ Web Development
│
├─ B.Tech-ECE-2B
│  ├─ className: B.Tech Electronics...
│  └─ subjects:
│     ├─ Digital Electronics
│     ├─ Signals and Systems
│     └─ Microprocessors
│
└─ B.Tech-ME-3C
   ├─ className: B.Tech Mechanical...
   └─ subjects:
      ├─ Thermodynamics
      ├─ Fluid Mechanics
      └─ Heat Transfer
```

---

## 🔄 File Interaction Diagram

```
LOGIN FLOW:
login.html
    ↓ (calls)
login-script.js
    ├─→ Validates against userDatabase
    └─→ Sets sessionStorage & redirects

DASHBOARD FLOW:
dashboard.html
    ├─→ (imports) auth.js
    │       └─→ Checks sessionStorage
    │       └─→ Updates navbar
    │
    ├─→ (imports) sample-data.js
    │       ├─→ Reads sessionStorage user
    │       ├─→ Reads classesAndSubjects
    │       └─→ Renders appropriate view
    │
    └─→ (imports) dashboard-script.js
            ├─→ Processes data
            ├─→ Calculates stats
            └─→ Generates charts (Chart.js)

STYLING:
dashboard-styles.css
    ├─→ Styles dashboard.html
    └─→ Makes responsive

login-styles.css
    └─→ Styles login.html
```

---

## 📊 Data Flow Summary

```
USER INPUT (Login)
        ↓
AUTHENTICATION (login-script.js)
        ↓
SESSION STORAGE (Browser)
        ↓
DASHBOARD LOAD (dashboard.html)
        ↓
AUTH CHECK (auth.js)
        ↓
ROLE DETERMINATION (sample-data.js)
        ↓
RENDER ROLE VIEW (sample-data.js + dashboard-styles.css)
        ↓
USER INTERACTION (Click Subject)
        ↓
DATA GENERATION (sample-data.js)
        ↓
DATA PROCESSING (dashboard-script.js)
        ↓
CHART GENERATION (Chart.js)
        ↓
DISPLAY RESULTS (dashboard.html)
        ↓
USER VIEWS ANALYTICS
```

---

This architecture ensures proper separation of concerns, security through role-based access, and scalable data management.
