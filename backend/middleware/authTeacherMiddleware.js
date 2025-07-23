const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const authTeacherMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log("✅ Decoded JWT:", decoded);

    // Log teacherId to verify it's correct
    console.log("🔍 Looking for Teacher with ID:", decoded.teacherId);

    // Find teacher using teacherId from the token
    const teacher = await Teacher.findOne({ teacherId: String(decoded.teacherId) });

    if (!teacher) {
      return res.status(401).json({ message: 'Teacher not found' });
    }

    console.log("📘 Teacher Found:", teacher);

    // ✅ Attach only the necessary fields to req.teacher
    req.teacher = {
      teacherId: teacher.teacherId,
      userid: teacher.userid, // ✅ corrected field name
      name: teacher.name
    };

    next();
  } catch (error) {
    console.error("❌ Error in authTeacherMiddleware:", error);
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

module.exports = authTeacherMiddleware;
