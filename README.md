<<<<<<< HEAD
# CIA Dashboard - Role-Based Access Control System

## Project Overview
A comprehensive Continuous Internal Assessment (CIA) Dashboard with role-based access control for educational institutions. This system allows different user roles (Admin, Class Teachers, and Teachers) to manage and view student marks with appropriate access restrictions.

## Features

### 🔐 Authentication System
- Secure login with predefined credentials
- Three user roles with different access levels
- Session-based authentication

### 👥 User Roles

#### 1. **ADMIN (HOD/Program Coordinator)**
- **Access Level:** Full system access
- **Credentials:**
  - HOD: `hod_rajesh` / `hod123456`
  - Program Coordinator: `pc_priya` / `pc123456`
- **Capabilities:**
  - View ALL subjects across ALL classes
  - Access dashboards for any class and subject combination
  - Upload marks data for any subject in any class
  - View complete analytics and reports

#### 2. **CLASS TEACHER (CT)**
- **Access Level:** Class-wide access
- **Credentials:**
  - CSE 2A: `ct_amit` / `ct123456`
  - ECE 2B: `ct_neha` / `ct123456`
  - ME 3C: `ct_vikram` / `ct123456`
- **Capabilities:**
  - View ALL subjects ONLY for their assigned class
  - Cannot access other classes
  - View all students and their marks in all subjects of their class
  - Upload marks for any subject in their assigned class

#### 3. **TEACHER**
- **Access Level:** Subject-specific access
- **Credentials:**
  - Data Structures: `teacher_anil` / `teacher123456`
  - Digital Electronics: `teacher_suresh` / `teacher123456`
  - Thermodynamics: `teacher_meera` / `teacher123456`
  - Database Systems: `teacher_ravi` / `teacher123456`
  - Signals and Systems: `teacher_anjali` / `teacher123456`
  - Fluid Mechanics: `teacher_sameer` / `teacher123456`
- **Capabilities:**
  - View ONLY their assigned subject
  - Cannot access other subjects
  - View marks only for students in their subject
  - Upload marks data for their subject

## Available Classes and Subjects

### B.Tech Computer Science & Engineering - 2nd Year (B.Tech-CSE-2A)
- **Class Teacher:** Mr. Amit Kumar
- **Subjects:**
  - Data Structures (Dr. Anil Verma)
  - Database Systems (Mr. Ravi Patel)
  - Web Development (Dr. Anil Verma)

### B.Tech Electronics & Communication Engineering - 2nd Year (B.Tech-ECE-2B)
- **Class Teacher:** Mrs. Neha Singh
- **Subjects:**
  - Digital Electronics (Prof. Suresh Nair)
  - Signals and Systems (Ms. Anjali Sharma)
  - Microprocessors (Prof. Suresh Nair)

### B.Tech Mechanical Engineering - 3rd Year (B.Tech-ME-3C)
- **Class Teacher:** Dr. Vikram Gupta
- **Subjects:**
  - Thermodynamics (Dr. Meera Desai)
  - Fluid Mechanics (Dr. Sameer Khan)
  - Heat Transfer (Dr. Meera Desai)

## Dashboard Features

### Statistics Section
- **Not Attended:** Count of students marked absent
- **MIN/MAX/AVG:** Minimum, maximum, and average scores
- **STDEV:** Standard deviation of scores

### Performance Distribution
- Distribution of students across percentage ranges (90%, 85-89%, etc.)
- Visual representation of performance bands

### Risk Assessment
- High Risk (<60%): Students below passing threshold
- Medium Risk (60-80%): Students needing attention
- Low Risk (>80%): Well-performing students

### Charts and Visualizations
- **Risk Distribution Chart:** Bar chart showing risk categories
- **Performance Distribution Chart:** Overall performance visualization
- **Individual Student Marks:** Bar chart with passing line indicator
- **Critical Students List:** List of low performers (if any)

## How to Use

### Step 1: Login
1. Open `login.html` in your web browser
2. Enter your username and password from the credentials list
3. Click "Login"

### Step 2: View Dashboard
- The dashboard shows only the classes/subjects you have access to
- **Admin:** Sees all classes and their subjects
- **Class Teacher:** Sees only their assigned class subjects
- **Teacher:** Sees only their assigned subject across classes

### Step 3: View Analytics
1. Click on any subject button to view sample data
2. The system generates sample student marks automatically
3. View statistics, charts, and performance analysis

### Step 4: Upload Data (Optional)
1. Prepare an Excel file with columns: Roll No, Name, Subject, Marks
2. Use the upload form in the dashboard
3. Enter the maximum marks value (e.g., 100)
4. Upload the Excel file to process and visualize data

### Step 5: Logout
- Click the "Logout" button in the top navigation bar
- You will be redirected to the login page

## File Structure

```
├── login.html              # Login page
├── login-styles.css        # Login page styles
├── login-script.js         # Login authentication logic
├── dashboard.html          # Main dashboard page
├── dashboard-styles.css    # Dashboard styling
├── dashboard-script.js     # Dashboard and data processing logic
├── auth.js                 # Authentication utilities
├── sample-data.js          # Sample classes, subjects, and student data
├── credentials.txt         # User credentials reference
└── Original files:
    ├── index.html          # Original CIA Dashboard
    ├── script.js           # Original dashboard logic
    └── styles.css          # Original styling
```

## Key Features Explained

### Role-Based Access Control (RBAC)
- Each user role has specific access rights
- Dashboard content changes based on logged-in user
- Prevents unauthorized access to data

### Sample Data Generation
- Each subject automatically generates 8 sample students
- Realistic mark distribution (10% absent, 10% low performers, 80% normal)
- Demonstrates system functionality without manual data entry

### Data Analysis
- Automatic calculation of statistics
- Risk categorization based on performance
- Visual charts for better understanding
- Identification of low performers for intervention

### Security Features
- Session-based authentication
- Logout functionality to clear session
- Automatic redirect to login if session expires
- Password protection for all accounts

## Browser Compatibility
- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Required Libraries (CDN)
- Chart.js - For data visualization
- SheetJS (XLSX) - For Excel file processing

## Testing Recommendations

### Test as Admin (HOD)
1. Login with `hod_rajesh` / `hod123456`
2. Verify you see all 3 classes with all subjects
3. Click on different subjects to view analytics

### Test as Class Teacher
1. Login with `ct_amit` / `ct123456`
2. Verify you see ONLY B.Tech-CSE-2A
3. Try clicking subjects in that class
4. Logout and login with different CT to verify class isolation

### Test as Teacher
1. Login with `teacher_anil` / `teacher123456`
2. Verify you see ONLY "Data Structures" subject
3. You should see it appears under B.Tech-CSE-2A (their assigned class)
4. Try accessing other subjects after logout

## Customization

### Add New Users
Edit `login-script.js` and add to `usersDatabase`:
```javascript
'new_username': {
    password: 'password',
    role: 'teacher|classTeacher|admin',
    name: 'User Full Name',
    assignedSubject: 'Subject Name', // for teachers
    assignedClass: 'Class Code'      // for class teachers
}
```

### Add New Classes/Subjects
Edit `sample-data.js` and add to `classesAndSubjects`:
```javascript
'B.Tech-XYZ-YA': {
    className: 'Full Class Name',
    subjects: [
        { name: 'Subject Name', teacher: 'Teacher Name', maxMarks: 100 }
    ]
}
```

### Modify Max Marks
Change in `sample-data.js` when defining subjects, or set during upload

## Troubleshooting

### Login Issues
- Check username and password are correct (case-sensitive)
- Ensure you're using valid credentials from credentials.txt

### Dashboard Not Loading
- Clear browser cache and reload
- Ensure all JavaScript files are in the same directory
- Check browser console for errors

### Data Not Displaying
- Verify Excel file format matches requirements
- Check column headers: Roll No, Name, Subject, Marks
- Ensure marks are numeric (or "ab" for absent)

## Future Enhancements

- Database integration for persistent data storage
- User management panel for adding/editing users
- Advanced analytics and reporting
- Email notifications for low performers
- Parent portal for viewing student progress
- Mobile app version
- Integration with college management systems

## Contact & Support

For issues or questions about the CIA Dashboard system, please refer to the credentials file for system administrator contacts.

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Active
=======
# department-data
>>>>>>> f62b8cd47b9624dd5361e351043fa9a42e27fb18
