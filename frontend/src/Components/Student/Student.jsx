import React from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import StudentLogin from './Auth/StudentLogin';
import Dashboard from './Dashboard/Dashboard';
import StudentNav from './Navbar/StudentNav';
import AttendanceRecords from './AttendanceRecords/AttendanceRecords';
import AttendanceState from './AttendanceRecords/AttendanceState';
import Support from './AttendanceRecords/Support';

function Student() {
  const location = useLocation();

  // Yeh routes jisme navbar nahi dikhana
  const hideNavbarRoutes = ['/student/login'];

  // Agar current path hide list me nahi hai, toh navbar dikhao
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <StudentNav />}

      <Routes>
        <Route path='login' element={<StudentLogin />} />
        <Route path='profile' element={<Dashboard />} />
        <Route path='attendance' element={<AttendanceRecords/>}/>
        <Route path='reports' element={<AttendanceState/>}/>
        <Route path='support' element={<Support/>}/>
      </Routes>
    </>
  );
}

export default Student;
