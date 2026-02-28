# 🚀 Quick Start Guide - Auto-Classification System

## ⚡ Get Started in 3 Steps

### Step 1: Navigate to Dashboard
- Open **dashboard.html** (Classroom View)
- See the new **"Initialize Sample Assignments"** section
- Button: 🌱 Seed Sample Assignments (8)

### Step 2: Click Seed Button
- Click **🌱 Seed Sample Assignments (8)**
- Wait 2-3 seconds for processing
- See success message with count of assignments created

### Step 3: View Active Assignments
- Assignments appear in **🔹 Active Assignments** section
- Scroll down to see all 8 assignments:
  - **4 Proactive** (green badge): Research, Hackathon, Mini Project, Workshop
  - **4 Reactive** (orange badge): Remedial, Re-test, Coding, Seminar
- Each shows auto-assigned students

---

## 🔍 What Gets Created

### Sample Data Included:
- **10 Students Total**
  - 6 Proactive (percentage ≥ 50%)
  - 4 Reactive (percentage < 50%)

### 8 Auto-Generated Assignments:
Each assignment is:
- Auto-classified (Proactive or Reactive)
- Auto-allocated to matching students
- Includes realistic deadlines
- Has token-based submission links
- Shows submission tracking

---

## ✅ Verify Everything Works

### Check 1: Seed Button Initializes
```
Expected: 
- Loading message appears
- Success message shown after 2-3 seconds
- Status shows "8 assignments created"
```

### Check 2: Assignments in Active Section
```
Expected:
- 8 assignment cards visible
- Proper grouping: 4 Proactive, 4 Reactive
- Each card shows: Title, Type Badge, Students Count, Deadline
```

### Check 3: Data Persistence
```
Check in browser DevTools → Application → LocalStorage
- data/localAssignments.json updated with 8 new assignments
- Each has "autoAllocated": true flag
- Each has correct "classification": "proactive" or "reactive"
```

### Check 4: Auto-Allocation Verification
```
Open Assignment Details Modal → View Students List
- Proactive assignments: Show only proactive students (6 total)
- Reactive assignments: Show only reactive students (4 total)
- Each student haspre-populated with their name and email
```

### Check 5: Links Work
```
For each assignment:
- Copy submission link button works
- Link format: /student-submission.html?token=asgn_xxxxx
- Students can access submission page with token
```

---

## 🎯 Student Classification Reference

### Proactive Students (≥50% average):
| Name | Email | Percentage |
|------|-------|-----------|
| Rahul Singh | rahul.singh@... | 88% |
| Anjali Verma | anjali.verma@... | 85% |
| Priya Nair | priya.nair@... | 78% |
| Rohan Gupta | rohan.gupta@... | 72% |
| Arjun Sharma | arjun.sharma@... | 82% |
| Divya Singh | divya.singh@... | 52% |
| **Total:** 6 | | **≥50%** |

### Reactive Students (<50% average):
| Name | Email | Percentage |
|------|-------|-----------|
| Vikas Kumar | vikas.kumar@... | 48% |
| Neha Patel | neha.patel@... | 45% |
| Mohammad Ali | mohammad.ali@... | 38% |
| **Total:** 3 | | **<50%** |

Note: Divya Singh (52%) is classified as Proactive

---

## 📋 Assignment Types Generated

### Proactive Assignments (Advanced Learning):
1. **Research Paper** - AI Ethics (21 days, 100 marks)
2. **Hackathon** - Smart Campus (28 days, 150 marks)
3. **Mini Project** - E-Commerce (35 days, 120 marks)
4. **Workshop** - Full Stack Dev (14 days, 80 marks)

### Reactive Assignments (Remedial Support):
1. **Remedial** - Data Structures (7 days, 50 marks)
2. **Re-test** - Operating Systems (3 days, 30 marks)
3. **Coding Practice** - Loops & Functions (10 days, 30 marks)
4. **Seminar** - DBMS Introduction (14 days, 25 marks)

---

## 🔧 Troubleshooting

### Issue: Seed Button Not Working
**Solution:**
1. Check browser console (F12) for errors
2. Verify `student-classification.js` loaded (check Scripts tab)
3. Verify `assignment-seed-data.js` loaded
4. Check network requests to `/api/assignments/seed`

### Issue: No Assignments Appear
**Solution:**
1. Refresh the page and click seed button again
2. Check Network tab to see API responses
3. Look for error messages in console
4. Verify `/api/local/assignments` endpoint returns data

### Issue: Wrong Student Count
**Solution:**
1. Open browser DevTools → Console
2. Type: `console.log(localStorage.getItem('currentClassPerformanceData'))`
3. Verify student percentages in performanceData.json
4. Check classification threshold (should be 50%)

### Issue: Links Not Working
**Solution:**
1. Verify token is not empty (`asgn_xxxxx` format)
2. Check student-submission.html exists
3. Test manual link: `/student-submission.html?token=asgn_test`
4. Verify submissions.json file exists

---

## 🔄 API Verification

### Test in Postman/Browser:

**1. Get Student Performance Data**
```
GET /api/student-performance
Expected: List of classified students with percentages
```

**2. Check Classification Summary**
```
GET /api/assignments/classification/summary
Expected: { proactiveCount: 6, reactiveCount: 4, ... }
```

**3. List All Assignments**
```
GET /api/local/assignments
Expected: Array of 8 seed assignments
```

**4. Get Specific Assignment**
```
GET /api/assignments/:id
Example: /api/assignments/asgn-proactive-research-001
```

---

## 📊 Sample Data Files

### performanceData.json
- Location: `/data/performanceData.json`
- Contains: Classification metadata + student lists
- Size: ~2KB
- Auto-created on first seed

### localAssignments.json
- Location: `/data/localAssignments.json`
- Contains: All assignments (original + seeded)
- Size: Grows with new assignments
- Updated when seed button clicked

### submissions.json
- Location: `/data/submissions.json`
- Contains: Student submissions for tracking
- Pre-populated with sample submissions
- Shows "Submitted", "Reviewed" states

---

## 🎓 Feature Showcase

### What Makes This System Special:

✅ **Zero Manual Student Selection**
- Just click seed button
- All students auto-assigned based on performance

✅ **Intelligent Classification**
- Percentage-based: ≥50% = Proactive, <50% = Reactive
- Customizable threshold (default: 50%)
- Scalable to any number of students

✅ **Production-Ready**
- Error handling and fallbacks
- JSON persistence (no database needed)
- RESTful API design
- Modular, reusable code

✅ **Teacher-Friendly**
- One-click seeding
- Clear visual indicators (color badges)
- Student list auto-populated
- Submission links ready to share

✅ **Extensible**
- Easy to add custom classification logic
- Can integrate with real Performance Dashboard
- Supports dynamic student updates
- Pluggable into existing assignment system

---

## 🚀 Next Steps

### After Seeding:
1. ✅ View active assignments in Classroom View
2. ✅ Click "View Details" on any assignment
3. ✅ Copy submission links for students
4. ✅ Share links with students
5. ✅ Monitor submissions as they come in
6. ✅ Review and grade in the modal

### Future Enhancements:
- [ ] Dynamic re-classification after new marks
- [ ] Moving students between groups automatically  
- [ ] Bulk operations on assignment groups
- [ ] Custom classification rules
- [ ] Performance analytics dashboard

---

## 💬 Support & Questions

### Common Questions:

**Q: Can I modify the student list after seeding?**
A: Yes! Edit directly in performanceData.json and reseed

**Q: Can I change the 50% threshold?**
A: Yes! Edit in student-classification.js → getSampleStudentClassification()

**Q: Will this work with real Performance Dashboard data?**
A: Yes! Connect to your Performance Dashboard marks table

**Q: How many students can this handle?**
A: Tested with 10, scales to hundreds in JSON format

**Q: Can I delete assignments generated?**
A: Yes! Edit localAssignments.json directly or implement delete endpoint

---

**Version:** 1.0 Quick Start  
**Last Updated:** 2025-02-25  
**Status:** ✅ Ready to Use
