const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Support = require("../models/Support");
const generateId = require("uuid").v4;
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const generatePassword = () => Math.floor(100000 + Math.random() * 900000).toString();

// Add Student
exports.addStudent = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    const studentId = generateId().slice(0, 4);
    const password = generatePassword();

    const student = new Student({
      ...req.body,
      studentId,
      password,
      userid: req.user.userid,
    });

    await student.validate();    
    await student.save();
    
    res.status(201).json({ 
      message: "Student added", 
      studentId,
      password 
    });
    
  } catch (err) {
    console.error("Detailed error:", err);
    res.status(500).json({ 
      message: "Error adding student",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get All Students
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ userid: req.user.userid }).limit(10);
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students", error: err });
  }
};

exports.exportStudentCredentials = async (req, res) => {
  try {
    console.log("User making request:", req.user); // Should show role: 'admin'

    if (!req.user.role || req.user.role !== 'admin') {
      console.log(`Unauthorized access attempt by user ${req.user.userid}`);
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const students = await Student.find()
      .select('studentId name email rollNo password createdAt')
      .lean();

    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    const formattedData = students.map(student => ({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      rollNo: student.rollNo,
      password: student.password,
      createdAt: student.createdAt
    }));

    res.json(formattedData);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ 
      message: "Export failed",
      error: error.message 
    });
  }
};

// Update Student
exports.updateStudent = async (req, res) => {
  try {
    const updated = await Student.findOneAndUpdate(
      { _id: req.params.id, userid: req.user.userid },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating student", error: err });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const deleted = await Student.findOneAndDelete({
      _id: req.params.id,
      userid: req.user.userid,
    });
    if (!deleted) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting student", error: err });
  }
};

// Get Student Profile
exports.getStudentProfile = async (req, res) => {
  try {
    const student = req.student;
    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Student Profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const student = req.student;
    const { name, email, phone, semester, course, subjects } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      {
        name: name || student.name,
        email: email || student.email,
        phone: phone || student.phone,
        semester: semester || student.semester,
        course: course || student.course,
        subjects: subjects || student.subjects,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found!" });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Student Password
exports.updateStudentPassword = async (req, res) => {
  try {
    const student = req.student;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (student.password !== oldPassword) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    student.password = newPassword;
    await student.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Error updating student", error });
  }
};

// Get Student Attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.student._id;
    const attendanceRecords = await Attendance.find({ studentId });
    res.status(200).json({ attendance: attendanceRecords });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// Submit Support Request
exports.submitSupportRequest = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    if (!email || !category || !message) {
      return res.status(400).json({ error: 'Email, category, and message are required.' });
    }

    const supportRequest = new Support({
      studentId: req.student._id,
      name: name || req.student.name,
      email,
      category,
      message,
      createdAt: new Date(),
    });

    await supportRequest.save();
    res.status(200).json({ message: 'Support request submitted successfully.' });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};