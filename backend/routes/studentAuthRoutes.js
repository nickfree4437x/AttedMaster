const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const jwt = require("jsonwebtoken");

// POST: Student Login
router.post("/student-login", async (req, res) => {
  try {
    const { StudentId, password } = req.body;

    // Check if student exists
    const student = await Student.findOne({ studentId: StudentId });

    if (!student) {
      return res.status(400).json({ success: false, message: "Invalid Student ID" });
    }

    // Check password (plain text comparison)
    if (student.password !== password) {
      return res.status(400).json({ success: false, message: "Invalid Password" });
    }

    // Generate token with userId (to match middleware)
    const token = jwt.sign(
      { userId: student._id, studentId: student.studentId }, // ✅ use `userId`
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Student Login Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

module.exports = router;
