const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware"); // ✅ JWT Middleware

// ✅ Fetch All Courses (Protected Route)
router.get("/get", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ userid: req.user.userid });
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Add Course (Protected Route)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    console.log("Incoming course data:", req.body);
    console.log("Admin ID from token:", req.user.userid);
    const { courseName, designation } = req.body;
    const userid = req.user.userid;

    if (!courseName || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = new Course({ courseName, designation, userid });
    await newCourse.save();

    res.status(201).json({ message: "Course added successfully", course: newCourse });
  } catch (error) {
    console.error("Add Course Error:", error.message); // add .message
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Update Course (Protected Route)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { courseName, designation } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Ensure the logged-in admin owns the course
    if (course.userid.toString() !== req.user.userid) {
      return res.status(403).json({ message: "Unauthorized to edit this course" });
    }

    course.courseName = courseName || course.courseName;
    course.designation = designation || course.designation;
    await course.save();

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Delete Course (Protected Route)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Ensure the logged-in admin owns the course
    if (course.userid.toString() !== req.user.userid) {
      return res.status(403).json({ message: "Unauthorized to delete this course" });
    }

    await course.deleteOne();

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
