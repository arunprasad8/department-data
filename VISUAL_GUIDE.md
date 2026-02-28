# CIA Dashboard - Visual Guide & Walkthrough

## 🎯 System Overview Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN PAGE (login.html)              │
│              Username + Password Authentication         │
└─────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
    ┌────────┐        ┌─────────┐      ┌──────────┐
    │ ADMIN  │        │CLASS    │      │ TEACHER  │
    │ROLE    │        │TEACHER  │      │ ROLE     │
    └────────┘        └─────────┘      └──────────┘
        ↓                  ↓                  ↓
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │See ALL       │  │See 1 Class   │  │See 1 Subject │
  │3 Classes     │  │3 Subjects    │  │Multiple      │
  │All Subjects  │  │Within Class  │  │Classes       │
  └──────────────┘  └──────────────┘  └──────────────┘
        ↓                  ↓                  ↓
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │Dashboard     │  │Dashboard     │  │Dashboard     │
  │Full Access   │  │Class Access  │  │Subject Access│
  │Analytics     │  │Analytics     │  │Analytics     │
  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## 👥 User Hierarchy

```
ORGANIZATION STRUCTURE
│
├─ ADMIN (Department Level)
│  ├─ Dr. Rajesh Sharma (HOD) - hod_rajesh
│  └─ Ms. Priya Patel (PC) - pc_priya
│     └─ Access: ALL classes, ALL subjects
│
├─ CLASS TEACHERS (Class Level)
│  ├─ Mr. Amit Kumar - ct_amit (→ CSE 2A)
│  ├─ Mrs. Neha Singh - ct_neha (→ ECE 2B)
│  └─ Dr. Vikram Gupta - ct_vikram (→ ME 3C)
│     └─ Access: Own class subjects only
│
└─ TEACHERS (Subject Level)
   ├─ Dr. Anil Verma - teacher_anil (→ Data Structures)
   ├─ Prof. Suresh Nair - teacher_suresh (→ Digital Electronics)
   ├─ Dr. Meera Desai - teacher_meera (→ Thermodynamics)
   ├─ Mr. Ravi Patel - teacher_ravi (→ Database Systems)
   ├─ Ms. Anjali Sharma - teacher_anjali (→ Signals and Systems)
   └─ Dr. Sameer Khan - teacher_sameer (→ Fluid Mechanics)
      └─ Access: Own subject only
```

---

## 📚 Class Structure

```
B.Tech CSE - 2A (Mr. Amit Kumar - Class Teacher)
├── Data Structures (Dr. Anil Verma)
│   └── Students: CSE-2001 to CSE-2008 (8 students)
├── Database Systems (Mr. Ravi Patel)
│   └── Students: CSE-2001 to CSE-2008 (8 students)
└── Web Development (Dr. Anil Verma)
    └── Students: CSE-2001 to CSE-2008 (8 students)

B.Tech ECE - 2B (Mrs. Neha Singh - Class Teacher)
├── Digital Electronics (Prof. Suresh Nair)
│   └── Students: ECE-2001 to ECE-2008 (8 students)
├── Signals and Systems (Ms. Anjali Sharma)
│   └── Students: ECE-2001 to ECE-2008 (8 students)
└── Microprocessors (Prof. Suresh Nair)
    └── Students: ECE-2001 to ECE-2008 (8 students)

B.Tech ME - 3C (Dr. Vikram Gupta - Class Teacher)
├── Thermodynamics (Dr. Meera Desai)
│   └── Students: ME-3001 to ME-3008 (8 students)
├── Fluid Mechanics (Dr. Sameer Khan)
│   └── Students: ME-3001 to ME-3008 (8 students)
└── Heat Transfer (Dr. Meera Desai)
    └── Students: ME-3001 to ME-3008 (8 students)
```

---

## 🎭 What Each Role Sees

### ADMIN View (hod_rajesh)
```
┌─────────────────────────────────────────────────┐
│           Welcome, Dr. Rajesh Sharma!           │
│     You have full access to all classes and     │
│              subjects as HOD                    │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  B.Tech CSE - 2A                                │
│  ┌──────────────────────────────────────────┐   │
│  │ [Data Structures] [Database Systems]     │   │
│  │ [Web Development]                        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  B.Tech ECE - 2B                                │
│  ┌──────────────────────────────────────────┐   │
│  │ [Digital Electronics] [Signals and Sys]  │   │
│  │ [Microprocessors]                        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  B.Tech ME - 3C                                 │
│  ┌──────────────────────────────────────────┐   │
│  │ [Thermodynamics] [Fluid Mechanics]       │   │
│  │ [Heat Transfer]                          │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

              Can click ANY subject
         Full access to ALL analytics
```

### CLASS TEACHER View (ct_amit)
```
┌─────────────────────────────────────────────────┐
│         Welcome, Mr. Amit Kumar!                │
│  You can view all subjects for your class:      │
│      B.Tech-CSE-2A                              │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  B.Tech CSE - 2A (My Class)                     │
│  ┌──────────────────────────────────────────┐   │
│  │ [Data Structures] [Database Systems]     │   │
│  │ [Web Development]                        │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

    ✓ Can see all 3 subjects of CSE
    ✓ Can see all students in CSE
    ✗ Cannot see ECE or ME classes
    ✗ Cannot access those class subjects
```

### TEACHER View (teacher_anil)
```
┌─────────────────────────────────────────────────┐
│        Welcome, Dr. Anil Verma!                 │
│          You have access to:                    │
│           Data Structures                       │
└─────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  B.Tech CSE - 2A                                │
│  ┌──────────────────────────────────────────┐   │
│  │ [Data Structures]                        │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘

    ✓ Can see Data Structures in CSE
    ✓ Can see all students in their subject
    ✗ Cannot see Database Systems
    ✗ Cannot see Web Development
    ✗ Cannot see any other subjects
    ✗ Cannot see other classes
```

---

## 📊 Dashboard Features Flow

```
CLICK ON SUBJECT
      ↓
  ┌───────────────────────────┐
  │  Sample Data Generated    │
  │  8 students per subject   │
  │  Realistic marks (60-95)  │
  │  ~10% low performers      │
  │  ~10% absent              │
  └───────────────────────────┘
      ↓
  ┌───────────────────────────┐
  │  DATA PROCESSING          │
  ├───────────────────────────┤
  │ • Calculate Statistics    │
  │ • Min, Max, Avg, StDev   │
  │ • Performance Bins        │
  │ • Risk Categories         │
  │ • Low Performer List      │
  └───────────────────────────┘
      ↓
  ┌───────────────────────────┐
  │  VISUALIZATIONS           │
  ├───────────────────────────┤
  │ • Statistics Table        │
  │ • Distribution Table      │
  │ • Risk Bar Chart          │
  │ • Performance Chart       │
  │ • Student Marks Chart     │
  │ • Critical Students Table │
  └───────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────┐
│  User Opens     │
│  login.html     │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────┐
│  Enters Username & Password │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  login-script.js validates      │
│  against usersDatabase          │
└────────┬────────────────────────┘
         │
    ┌────┴─────┐
    ↓          ↓
┌────────┐  ┌────────────────┐
│ Valid  │  │ Invalid        │
│ Login  │  │ Show Error     │
└────┬───┘  │ Try Again      │
     │      └────────────────┘
     ↓
┌──────────────────────┐
│ Store User Data in   │
│ sessionStorage       │
└─────────┬────────────┘
          │
          ↓
┌──────────────────────┐
│ Redirect to          │
│ dashboard.html       │
└─────────┬────────────┘
          │
          ↓
┌──────────────────────┐
│ auth.js checks       │
│ sessionStorage       │
└─────────┬────────────┘
          │
          ↓
┌──────────────────────┐
│ sample-data.js       │
│ renders appropriate  │
│ dashboard view       │
└──────────────────────┘
```

---

## 📈 Sample Data Distribution

```
Total Students per Subject: 8

├─ 10% Absent (ab) → ~1 student
│  └─ Marks: "ab"
│
├─ 10% Low Performers → ~1 student
│  └─ Marks: 15-30
│
└─ 80% Normal Distribution → ~6 students
   └─ Marks: 55-95

Statistical Breakdown:
  Not Attended: 1
  Min: ~15
  Max: ~95
  Avg: ~65-75 (out of 100)
  High Risk (<60%): 1-2 students
  Medium Risk (60-80%): 3-4 students
  Low Risk (>80%): 2-3 students
```

---

## 🎯 Test Scenarios

### Scenario 1: Admin Explores System
```
1. Login: hod_rajesh / hod123456
2. See 3 cards: CSE (3 subjects), ECE (3 subjects), ME (3 subjects)
3. Total visible: 9 subjects
4. Click "Data Structures" → See analytics for CSE subject
5. Back button → Return to dashboard
6. Click "Digital Electronics" → See analytics for ECE subject
7. Different data shows isolation is working
8. Logout → Back to login page
```

### Scenario 2: Class Teacher Isolation
```
1. Login: ct_amit / ct123456
2. See 1 card: CSE 2A (3 subjects)
3. Total visible: 3 subjects
4. Can access: Data Structures, Database Systems, Web Development
5. Cannot see: Any ECE or ME subjects
6. Logout → Login as ct_neha
7. Now see ECE 2B (3 subjects)
8. Completely different set of subjects
9. No overlap with previous class
```

### Scenario 3: Teacher Subject Restriction
```
1. Login: teacher_anil / teacher123456
2. See 1 card: Data Structures
3. Only 1 subject visible
4. Can only view: Data Structures marks
5. Cannot access: Any other subject
6. Logout → Login as teacher_suresh
7. Now see Digital Electronics only
8. Complete isolation from Data Structures
```

---

## 💡 Key Differences Quick Reference

| Element | Admin | Class Teacher | Teacher |
|---------|-------|---------------|---------|
| Classes Shown | 3 | 1 | N/A |
| Subjects Shown | 9 | 3 | 1 |
| Upload Form | Full | Class Fixed | Subject Fixed |
| Can View | Everything | Class Level | Subject Level |
| Can Upload | Any Subject | Class Subjects | Own Subject |
| Dashboard Access | All Classes | Own Class | Own Subject |

---

## 🔄 Data Access Restrictions

```
ADMIN (hod_rajesh)
  ├─ B.Tech CSE-2A
  │  ├─ Data Structures ✅
  │  ├─ Database Systems ✅
  │  └─ Web Development ✅
  ├─ B.Tech ECE-2B
  │  ├─ Digital Electronics ✅
  │  ├─ Signals and Systems ✅
  │  └─ Microprocessors ✅
  └─ B.Tech ME-3C
     ├─ Thermodynamics ✅
     ├─ Fluid Mechanics ✅
     └─ Heat Transfer ✅

CLASS TEACHER (ct_amit) → Only CSE-2A
  ├─ Data Structures ✅
  ├─ Database Systems ✅
  └─ Web Development ✅

TEACHER (teacher_anil) → Only Data Structures
  └─ Data Structures ✅ (in CSE-2A)
```

---

## 📞 Quick Reference Card

```
┌──────────────────────────────────────────┐
│  ADMIN CREDENTIALS                       │
├──────────────────────────────────────────┤
│  Admin: hod_rajesh / hod123456           │
│  Access: All classes, all subjects       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  CLASS TEACHER CREDENTIALS               │
├──────────────────────────────────────────┤
│  CSE: ct_amit / ct123456                 │
│  ECE: ct_neha / ct123456                 │
│  ME:  ct_vikram / ct123456               │
│  Access: Own class subjects only         │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│  TEACHER CREDENTIALS                     │
├──────────────────────────────────────────┤
│  Data Structures: teacher_anil           │
│  Digital Electronics: teacher_suresh     │
│  Thermodynamics: teacher_meera           │
│  Database Systems: teacher_ravi          │
│  Signals & Systems: teacher_anjali       │
│  Fluid Mechanics: teacher_sameer         │
│  Password: teacher123456 (all teachers)  │
│  Access: Own subject only                │
└──────────────────────────────────────────┘
```

---

## 🚀 Getting Started Path

```
1. Open login.html in browser
           ↓
2. Try Admin Login (hod_rajesh)
           ↓
3. See all classes and subjects
           ↓
4. Click a subject to view analytics
           ↓
5. Explore the dashboard and charts
           ↓
6. Logout
           ↓
7. Try Class Teacher (ct_amit)
           ↓
8. Notice only CSE subjects visible
           ↓
9. Logout
           ↓
10. Try Teacher (teacher_anil)
           ↓
11. Notice only Data Structures visible
           ↓
12. Observe role-based access in action! ✅
```

---

This visual guide shows how the role-based access control system works and how different users see different interfaces with appropriate data restrictions.
