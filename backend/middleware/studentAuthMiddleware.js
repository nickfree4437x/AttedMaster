const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const studentAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).json({ message: "Authentication token missing!" });
    }

    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);

    // ✅ Get student using userId (which is _id from DB)
    const student = await Student.findById(decoded.userId);

    if (!student) {
      return res.status(404).json({ message: "Student not found!" });
    }

    req.student = student;  // Attach student to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Authentication failed", error });
  }
};

module.exports = studentAuthMiddleware;
