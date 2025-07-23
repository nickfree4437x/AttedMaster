const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ["teacher", "student"],
    default: "teacher",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
