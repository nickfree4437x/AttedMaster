const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

const getAttendanceRecords = async (req, res) => {
  try {
    const { userid } = req.user;

    // Get all attendance records
    const records = await Attendance.find({ userid }).lean();

    // Convert valid teacherId strings to ObjectIds
    const validTeacherIds = [...new Set(
      records
        .map(r => r.teacherId)
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
    )];

    // Fetch teacher data
    const teachers = await Teacher.find({ _id: { $in: validTeacherIds } }).lean();

    // Map teacherId to name
    const teacherMap = {};
    teachers.forEach(t => {
      teacherMap[t._id.toString()] = t.name;
    });

    // Append teacherName
    const updatedRecords = records.map(r => ({
      ...r,
      teacherName: teacherMap[r.teacherId] || 'Unknown'
    }));

    res.json(updatedRecords);
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAttendanceRecords,
};
