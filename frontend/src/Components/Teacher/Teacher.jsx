import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import TeacherLogin from "./Auth/TeacherLogin";
import TeacherDashboard from "./Dashboard/Dashboard";
import TeacherNav from "./Navbar/TeacherNav";
import TeacherProfile from "./TeacherProfile/TeacherProfile";
import AttendanceRecords from "./AttendanceRecords/AttendanceRecords";
import AttendanceReports from "./AttendanceReports/AttendanceReports";
import Support from "./AttendanceReports/Support";
import StudentDetails from "./AttendanceRecords/StudentDetails ";

function Teacher() {  // Renamed from Admin to Teacher for clarity
  const location = useLocation();
  const token = localStorage.getItem("teacherToken");

  return (
    <>
      {/* Only show TeacherNav when authenticated (token exists) */}
      {token && <TeacherNav />}

      <Routes>
        <Route path="login" element={<TeacherLogin />} />
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="profile" element={<TeacherProfile/>}/>
        <Route path="attendance-records" element={<AttendanceRecords/>}/>
        <Route path="reports" element={<AttendanceReports/>}/>
        <Route path="support" element={<Support/>}/>
        <Route path="student/:id" element={<StudentDetails/>}/>
      </Routes>
    </>
  );
}

export default Teacher;  // Changed export to match new component name