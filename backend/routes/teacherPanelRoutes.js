const express = require('express');
const router = express.Router();
const authTeacherMiddleware = require('../middleware/authTeacherMiddleware');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');  // 👈 ye import hona chahiye upar
const Attendance = require('../models/Attendance');
const SupportMessage = require('../models/SupportMessage');

// ✅ Get Courses assigned to the teacher
router.get('/courses', authTeacherMiddleware, async (req, res) => {
  try {
    const teacherUserid = req.teacher.userid;
    if (!teacherUserid) {
      return res.status(400).json({ message: 'Teacher user ID is missing in the request' });
    }

    const courses = await Course.find({ userid: teacherUserid });
    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: 'No courses found for this teacher' });
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
});

// ✅ Get Subjects assigned to the teacher
router.get('/subjects', authTeacherMiddleware, async (req, res) => {
  try {
    const teacherUserid = req.teacher.userid;
    if (!teacherUserid) {
      return res.status(400).json({ message: 'Teacher user ID is missing in the request' });
    }

    const subjects = await Subject.find({ userid: teacherUserid });
    if (!subjects || subjects.length === 0) {
      return res.status(404).json({ message: 'No subjects found for this teacher' });
    }

    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
});

// ✅ Get Students based on filters
router.post('/students', authTeacherMiddleware, async (req, res) => {
  try {
    const { course, semester, subject } = req.body;
    const teacherUserid = req.teacher.userid;

    // Check if all required fields are provided
    if (!course || !semester || !subject) {
      return res.status(400).json({ message: 'Please provide course, semester, and subject' });
    }

    if (!teacherUserid) {
      return res.status(401).json({ message: 'Unauthorized: Teacher ID is missing' });
    }

    // Filter students based on course, semester, and subject
    const students = await Student.find({
      course,
      semester,
      subjects: { $in: [subject] },
      userid: teacherUserid,
    });

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for the selected filters' });
    }

    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});

// Route to get Teacher Profile
router.get("/profile", authTeacherMiddleware, async (req, res) => {
  try {
    // Directly fetch teacher, no need to populate anything
    const teacher = await Teacher.findOne({ teacherId: req.teacher.teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log("Teacher Data:", teacher); // Log the data for debugging

    res.status(200).json({ teacher });
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    res.status(500).json({ message: "Error fetching teacher profile", error: error.message });
  }
});

// Route to change the teacher's password
router.post("/change-password", authTeacherMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find the teacher by their teacherId (from token)
    const teacher = await Teacher.findOne({ teacherId: req.teacher.teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Compare the entered current password with the stored plain text password
    if (currentPassword !== teacher.password) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update the teacher's password with the new password (plain text)
    teacher.password = newPassword;
    await teacher.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Error changing password" });
  }
});

// ✅ Mark Attendance
router.post('/mark-attendance', authTeacherMiddleware, async (req, res) => {
  try {
    const { course, subject, date, attendance } = req.body; // Removed teacherId from body, we'll use decodedTeacherId

    if (!course || !subject || !date || !attendance) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (attendance.length === 0) {
      return res.status(400).json({ message: 'At least one student should be marked' });
    }

    const decodedTeacherId = req.teacher.teacherId;  // Teacher's ID from JWT token

    if (!decodedTeacherId) {
      return res.status(401).json({ message: 'Unauthorized: teacherId missing from token' });
    }

    // Now, we need to convert the teacherId to an ObjectId (we're assuming decodedTeacherId is a string here)
    const teacher = await Teacher.findOne({ teacherId: decodedTeacherId });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Proceed to create attendance records
    const attendanceRecords = attendance.map((student) => {
      const record = {
        studentId: student.studentId,
        studentName: student.name,
        rollNo: student.rollNo,
        status: student.status,
        date: new Date(date),
        course,
        subject,
        teacherId: teacher._id, // Store teacher's ObjectId here
        userid: req.teacher.userid,  // Admin's ID for filtering
      };
      return record;
    });

    // Save all attendance records at once
    const saved = await Attendance.insertMany(attendanceRecords);

    return res.status(200).json({
      message: 'Attendance marked successfully',
      attendanceRecords: saved,
    });

  } catch (error) {
    console.error("Error marking attendance:", error);
    return res.status(500).json({
      message: 'Failed to mark attendance',
      error: error.message,
    });
  }
});

// GET Attendance Records
router.get('/attendance-records', authTeacherMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ teacherId: req.teacher.teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const records = await Attendance.find({ teacherId: teacher._id }).sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});


// POST /api/teachers/support
router.post('/support', authTeacherMiddleware, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newSupportMessage = new SupportMessage({
      name,
      email,
      subject,
      message,
      userType: "teacher",
    });

    await newSupportMessage.save();

    res.status(200).json({ message: "Support request submitted successfully." });
  } catch (error) {
    console.error("Error handling support request:", error);
    res.status(500).json({ message: "Server error while processing request." });
  }
});

// GET /api/teachers/student/:id - fetch student details + attendance records for that student
router.get('/student/:id', authTeacherMiddleware, async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Fetch attendance records ONLY for this student (by userid or studentId)
    const attendanceRecords = await Attendance.find({ userid: student.userid }).sort({ date: -1 });

    res.json({ student, attendanceRecords });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/teachers/student-attendance/:userid
router.get('/student-attendance/:userid', authTeacherMiddleware, async (req, res) => {
  try {
    const { userid } = req.params;
    const attendanceRecords = await Attendance.find({ userid });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this user' });
    }

    res.json(attendanceRecords);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
