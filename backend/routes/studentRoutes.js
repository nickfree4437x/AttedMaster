const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const studentAuthMiddleware = require("../middleware/studentAuthMiddleware");
const {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentProfile, 
  updateStudentProfile, 
  updateStudentPassword, 
  getStudentAttendance,
  submitSupportRequest,
  exportStudentCredentials, // Add the new export function
} = require("../controllers/studentController");

// ======================
// Student-Facing Routes
// ======================
router.get("/profile", studentAuthMiddleware, getStudentProfile);
router.put("/profile", studentAuthMiddleware, updateStudentProfile);
router.put("/update-password", studentAuthMiddleware, updateStudentPassword);
router.get("/my-attendance", studentAuthMiddleware, getStudentAttendance);
router.post("/support", studentAuthMiddleware, submitSupportRequest);

// ===================
// Admin-Facing Routes
// ===================
router.post("/add", authMiddleware, addStudent);
router.get("/get", authMiddleware, getStudents);
router.get("/credentials", authMiddleware, exportStudentCredentials);

// ========================
// ID-Based Admin Operations
// ========================
router.put("/:id", authMiddleware, updateStudent);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;