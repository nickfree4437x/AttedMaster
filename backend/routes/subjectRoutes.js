const express = require("express");
const router = express.Router();
const {
  addSubject,
  getSubjects,
  deleteSubject,
  updateSubject,
} = require("../controllers/subjectController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addSubject);
router.get("/get", authMiddleware, getSubjects);
router.delete("/delete/:id", authMiddleware, deleteSubject);
router.put("/update/:id", authMiddleware, updateSubject);

module.exports = router;
