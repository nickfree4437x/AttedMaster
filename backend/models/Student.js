const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  rollNo: String,
  phone: String,
  semester: String,
  course: String,
  subjects: [String],
  studentId: String,
  password: String,
  userid: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);
