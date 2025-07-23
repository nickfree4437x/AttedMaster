const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  semester: { type: String, required: true },
  courses: [{ type: String }], // ✅ Array of course names (not ObjectIds)
  subjects: [{ type: String }], // ✅ Array of subject names
  teacherId: { type: String, required: true, unique: true }, // ✅ Unique ID
  password: { type: String, required: true }, // ✅ For login
  userid: {
    type: String,
    ref: "Admin", // ✅ Reference to Admin model
    required: true,
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
