const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  course: {
    type: String,
    required: true,
  },
  subjectName: {
    type: String,
    required: true,
  },
  userid: { 
    type: String, 
    required: true 
  }, // ✅ Admin identifier
}, { timestamps: true });

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
