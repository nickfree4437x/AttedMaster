import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './Components/Index/Index';
import Started from './Components/Started/Started';
import Admin from './Components/Admin/Admin';
import Teacher from './Components/Teacher/Teacher';
import Student from './Components/Student/Student';

const App = () => {
  return (
    <Routes>
      {/* Home Page */}
      <Route path="/" element={<Index />} />

      {/* Get Started Page */}
      <Route path="/get-started" element={<Started />} />

      {/* Admin setup */}
      <Route path="/admin/*" element={<Admin />} /> {/* Admin Routes */}   

      {/* Teacher Setup*/}
      <Route path="/teacher/*" element={<Teacher/>}/>

      {/* Student Setup */}
      <Route path='/student/*' element={<Student/>}/>
    </Routes>
  );
};

export default App;
