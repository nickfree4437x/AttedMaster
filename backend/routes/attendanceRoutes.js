// routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getAttendanceRecords } = require('../controllers/attendanceController'); // Import the controller

// Route to get attendance records
router.get('/attendance', authMiddleware, getAttendanceRecords); // Use the controller function here

module.exports = router;
