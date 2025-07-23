const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  courseName: { 
    type: String, 
    required: true 
  },
  designation: { 
    type: String, 
    required: true 
  },
  userid: { 
    type: String, 
    required: true 
  }, // ✅ Admin identifier
});

module.exports = mongoose.model("Course", CourseSchema);
