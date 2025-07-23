const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  rollNo: { type: String, required: true },
  status: { type: String, enum: ['P', 'A'], required: true }, // 'P' for Present, 'A' for Absent
  date: { type: Date, required: true },
  course: { type: String, required: true },
  subject: { type: String, reqired: true },
  teacherId: { type: String, required: true }, // Store the teacher's ID
  userid: { type: String, required: true }, // ✅ Admin's ID for filtering
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
