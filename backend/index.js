require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");


const newsletterRoute = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes"); 
const teacherPanelRoutes = require('./routes/teacherPanelRoutes');
const studentAuthRoutes = require("./routes/studentAuthRoutes");
const attendanceRoutes = require('./routes/attendanceRoutes');
const profileRoute = require('./routes/profileRoute');

const authMiddleware = require("./middleware/authMiddleware"); // Importing authMiddleware
const errorHandler = require("./middleware/errorMiddleware"); // Importing error handler

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure Required Environment Variables Exist
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("❌ ERROR: Missing required environment variables in .env file");
  process.exit(1);
}

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev")); // HTTP request logger middleware
app.use(helmet()); // Adding security headers

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err);
    process.exit(1);
  });

// Routes
app.use('/api/newsletter', newsletterRoute);
app.use('/api/contact', contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/students", studentRoutes);
app.use('/api/teachers', teacherPanelRoutes); 
app.use("/api", studentAuthRoutes);
app.use('/api', attendanceRoutes);
app.use('/api/admin', profileRoute); // Register the profile route

// Protected Routes example
app.use("/api/teachers/change-password", authMiddleware); // Protect change-password route

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "✅ API is Running!" });
});

// Error handling middleware
app.use(errorHandler); // Global error handling

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
