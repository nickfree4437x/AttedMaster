const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const authenticateAdmin = require("../middleware/authMiddleware");

// POST - Add teacher
router.post('/add', authenticateAdmin, async (req, res) => {
  try {
    console.log("📥 Incoming Teacher Data:", req.body);

    const { 
      name, 
      designation, 
      email, 
      phone, 
      semester, 
      courses, 
      subjects 
    } = req.body;

    const userid = req.user?.userid; // Get admin's userid from JWT
    if (!userid) {
      return res.status(401).json({ message: "Unauthorized: No admin user ID" });
    }

    const teacher = new Teacher({ 
      name, 
      designation, 
      email, 
      phone, 
      semester, 
      courses, 
      subjects,
      userid, // Associate teacher with logged-in admin
    });

    // Generate random ID and password
    teacher.teacherId = `T-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    teacher.password = Math.random().toString(36).substring(2, 8);

    await teacher.save();
    console.log("✅ Teacher Saved Successfully:", teacher);

    res.status(201).json({ teacherId: teacher.teacherId, password: teacher.password });
  } catch (error) {
    console.error("❌ Error in /add teacher route:", error.message);
    res.status(500).json({ message: 'Failed to add teacher', error: error.message });
  }
});

// Teacher Login
router.post('/login', async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    if (!teacherId || !password) {
      return res.status(400).json({ message: "Teacher ID and Password are required" });
    }

    const teacher = await Teacher.findOne({ teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    if (teacher.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ teacherId: teacher.teacherId, teacherUserId: teacher.userid }, SECRET_KEY, { expiresIn: '1d' });

    // Send back teacher data along with token
    res.status(200).json({
      token,
      teacher: {
        teacherId: teacher.teacherId,
        name: teacher.name,
        userid: teacher.userid,
      },
    });
  } catch (error) {
    console.error('❌ Teacher Login Error:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});


// DELETE - Delete teacher
router.delete('/delete/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if the teacher belongs to the logged-in admin
    if (teacher.userid !== req.user.userid) {
      return res.status(403).json({ message: "Unauthorized: You can only delete your own teachers" });
    }

    await Teacher.findByIdAndDelete(id);
    res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete teacher', error });
  }
});

// PUT - Update teacher
router.put('/update/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Ensure that the logged-in admin can only update their own teachers
    if (teacher.userid !== req.user.userid) {
      return res.status(403).json({ message: "Unauthorized: You can only update your own teachers" });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(id, updatedData, { new: true });
    res.status(200).json({ message: 'Teacher updated successfully', teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update teacher', error });
  }
});

// GET - Get all teachers (Filtered by admin's userid)
router.get('/get', authenticateAdmin, async (req, res) => {
  try {
    const userid = req.user.userid;
    const teachers = await Teacher.find({ userid }); // Filter teachers by admin's userid
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch teachers', error });
  }
});


module.exports = router;
