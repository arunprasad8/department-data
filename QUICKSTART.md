# CIA Dashboard - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Open Login Page
Open `login.html` in any web browser. You should see the CIA Dashboard login form with demo credentials.

### Step 2: Login with Demo Account
Choose one of the demo accounts to test:

**For Full System Access (Admin):**
- Username: `hod_rajesh`
- Password: `hod123456`

**For Class-Level Access (Class Teacher):**
- Username: `ct_amit`
- Password: `ct123456`

**For Subject-Level Access (Teacher):**
- Username: `teacher_anil`
- Password: `teacher123456`

### Step 3: Explore the Dashboard
Once logged in, you'll see different interfaces based on your role:
- Click on any subject to view sample student data
- See the different access levels in action

---

## 🔑 All Available Credentials

### ADMIN ACCOUNTS (Full Access - All Classes, All Subjects)
```
Name: Dr. Rajesh Sharma
Role: HOD (Head of Department)
Username: hod_rajesh
Password: hod123456

Name: Ms. Priya Patel
Role: Program Coordinator
Username: pc_priya
Password: pc123456
```

### CLASS TEACHER ACCOUNTS (Class-Level Access)
```
Name: Mr. Amit Kumar
Assigned Class: B.Tech CSE - 2nd Year (B.Tech-CSE-2A)
Username: ct_amit
Password: ct123456

Name: Mrs. Neha Singh
Assigned Class: B.Tech ECE - 2nd Year (B.Tech-ECE-2B)
Username: ct_neha
Password: ct123456

Name: Dr. Vikram Gupta
Assigned Class: B.Tech ME - 3rd Year (B.Tech-ME-3C)
Username: ct_vikram
Password: ct123456
```

### TEACHER ACCOUNTS (Subject-Level Access)
```
Name: Dr. Anil Verma
Subject: Data Structures
Classes: B.Tech CSE - 2nd Year
Username: teacher_anil
Password: teacher123456

Name: Prof. Suresh Nair
Subject: Digital Electronics
Classes: B.Tech ECE - 2nd Year
Username: teacher_suresh
Password: teacher123456

Name: Dr. Meera Desai
Subject: Thermodynamics
Classes: B.Tech ME - 3rd Year
Username: teacher_meera
Password: teacher123456

Name: Mr. Ravi Patel
Subject: Database Systems
Classes: B.Tech CSE - 2nd Year
Username: teacher_ravi
Password: teacher123456

Name: Ms. Anjali Sharma
Subject: Signals and Systems
Classes: B.Tech ECE - 2nd Year
Username: teacher_anjali
Password: teacher123456

Name: Dr. Sameer Khan
Subject: Fluid Mechanics
Classes: B.Tech ME - 3rd Year
Username: teacher_sameer
Password: teacher123456
```

---

## 📊 What Each Role Can Access

### Admin (HOD)
✅ View all classes simultaneously
✅ Access all subjects in all classes
✅ See all student marks across entire department
✅ Upload data for any subject
✅ Full system analytics

### Class Teacher
✅ View only their assigned class
✅ Access all subjects within their class
✅ See all students in their class across all subjects
✅ Upload data for subjects in their class
❌ Cannot access other classes
❌ Cannot see other class data

### Teacher
✅ View only their assigned subject
✅ Can see that subject across multiple classes (if applicable)
✅ See student marks only for their subject
✅ Upload marks for their subject only
❌ Cannot access other subjects
❌ Cannot see other subject data

---

## 🎯 Demo Scenarios to Try

### Scenario 1: Full Admin Access
1. Login as `hod_rajesh`
2. Notice you see 3 classes: CSE, ECE, and ME
3. Each class shows all its subjects
4. Click on any subject (e.g., "Data Structures" under CSE)
5. View the complete analytics for that subject
6. Go back and try another subject from a different class
7. Notice you have access to everything

### Scenario 2: Class Teacher Isolation
1. Login as `ct_amit` (CSE Class Teacher)
2. Notice you see ONLY the CSE class
3. You can see: Data Structures, Database Systems, Web Development
4. Click on each subject to view student data
5. Logout and login as `ct_neha` (ECE Class Teacher)
6. Notice completely different interface - you only see ECE subjects
7. You cannot access CSE subjects
8. This demonstrates class-level isolation

### Scenario 3: Teacher Subject Restriction
1. Login as `teacher_anil` (teaches Data Structures)
2. Notice you see ONLY "Data Structures"
3. Click to view the analytics
4. Logout and login as `teacher_suresh` (teaches Digital Electronics)
5. Notice completely different subject (Digital Electronics)
6. This demonstrates subject-level restriction

---

## 📈 Understanding the Dashboard

When you click on a subject, you see:

### 1. Basic Statistics
- **Not Attended:** How many students were absent
- **MIN:** Lowest score obtained
- **MAX:** Highest score obtained  
- **AVG:** Average score of the class
- **STDEV:** Standard deviation (how spread out the scores are)

### 2. Performance Distribution
- Shows how many students fall in each percentage range
- Helps identify performance bands (90%+, 80-89%, etc.)

### 3. Risk Assessment
- **High Risk (<60%):** Students below passing threshold
- **Medium Risk (60-80%):** Students performing okay but need attention
- **Low Risk (>80%):** High performers

### 4. Charts
- Risk distribution bar chart
- Performance distribution chart
- Individual student marks with passing line indicator

### 5. Critical Students List
- Appears if average class performance is critical
- Lists students scoring below 20 marks
- Suggests improvement strategies

---

## 💡 Key Differences to Notice

### When Logged as Admin:
```
Dashboard Header: "Admin Dashboard - Full System Access"
Classes Display: All 3 classes with all their subjects
Upload Form: Can specify any subject and any class
```

### When Logged as Class Teacher:
```
Dashboard Header: "Class Teacher Dashboard"
Classes Display: Only their assigned class
Upload Form: Cannot select class (pre-filled with their class)
```

### When Logged as Teacher:
```
Dashboard Header: "Teacher Dashboard"
Classes Display: Only their assigned subject
Upload Form: Cannot select subject (pre-filled)
```

---

## 🔒 Security Features

1. **Login Required:** Must authenticate before accessing dashboard
2. **Session Storage:** User info stored in browser session (cleared on logout)
3. **Access Control:** JavaScript checks role before showing content
4. **Logout Button:** Clears session and returns to login page

---

## 📝 Sample Data

The system includes pre-generated sample student data:
- 8 students per subject
- Realistic mark distribution
- ~10% absent students
- ~10% low performers
- Majority with normal distribution

This allows you to test all features immediately without uploading data.

---

## 🎓 Learning Outcomes

After exploring this system, you'll understand:
1. How role-based access control works
2. How different user types see different data
3. How to analyze student performance using statistics
4. How to identify at-risk students
5. How dashboards adapt based on user roles

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check username/password case sensitivity |
| Wrong dashboard shown | Clear browser cache and reload |
| Subjects not visible | Ensure you're logged in with correct role |
| Charts not showing | Check browser console for JavaScript errors |

---

**Enjoy exploring the CIA Dashboard!** 🎉

For detailed information, see `README.md`
