import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Dashboard from "./Dashboard/dashboard";
import DashboardNavbar from "./DashboardNavbar/DashboardNavbar"; // Only using DashboardNavbar
import Course from "./Course/Course";
import Subject from "./Subject/Subject";
import Teacher from "./Teacher/Teacher";
import Student from "./Student/Student";
import AttendanceRecords from "./AttendanceRecords/AttendanceRecords";
import AdminProfile from "./Dashboard/AdminProfile";
import AttendanceStatistics from "./AttendanceRecords/AttendanceStatistics";

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]); // Re-run this when location changes

  return (
    <React.Fragment>
      {/* Only show DashboardNavbar when authenticated */}
      {isAuthenticated && <DashboardNavbar />}

      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="course" element={<Course />} />
        <Route path="subject" element={<Subject/>}/>
        <Route path="teacher" element={<Teacher/>}/>
        <Route path="student" element={<Student/>}/>
        <Route path="attendance" element={<AttendanceRecords/>}/>
        <Route path="profile" element={<AdminProfile/>}/>
        <Route path="attendance-statistics" element={<AttendanceStatistics/>}/>
      </Routes>
    </React.Fragment>
  );
}

export default Admin;