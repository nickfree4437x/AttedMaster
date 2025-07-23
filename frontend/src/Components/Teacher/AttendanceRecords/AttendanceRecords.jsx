import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FiCalendar, FiBook, FiUser, FiSearch, FiClock, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function AttendanceRecords() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [course, setCourse] = useState('');
  const [subject, setSubject] = useState('');
  const [studentName, setStudentName] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  const token = localStorage.getItem('teacherToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/teachers/attendance-records', { headers });
        setAttendanceRecords(response.data);
        setFilteredRecords(response.data);
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch attendance records',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#6366f1'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, []);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [startDate, endDate, course, subject, studentName, attendanceRecords]);

  const applyFilters = () => {
    let filtered = [...attendanceRecords];

    if (startDate) {
      filtered = filtered.filter(record => new Date(record.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(record => new Date(record.date) <= new Date(endDate));
    }
    if (course) {
      filtered = filtered.filter(record => record.course === course);
    }
    if (subject) {
      filtered = filtered.filter(record => record.subject === subject);
    }
    if (studentName) {
      const query = studentName.toLowerCase();
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(query) ||
        record.rollNo.toLowerCase().includes(query)
      );
    }

    setFilteredRecords(filtered);
  };

  // Get current records for pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const exportToCSV = () => {
    if (filteredRecords.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No records to export',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    const headers = ['Date', 'Course', 'Subject', 'Student Name', 'Roll No', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        new Date(record.date).toLocaleDateString(),
        `"${record.course}"`,
        `"${record.subject}"`,
        `"${record.studentName}"`,
        `"${record.rollNo}"`,
        `"${record.status}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_records_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (filteredRecords.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Data',
        text: 'No records to export',
        confirmButtonColor: '#6366f1'
      });
      return;
    }

    const doc = new jsPDF();
    const title = 'Attendance Records';
    const headers = [['Date', 'Course', 'Subject', 'Student', 'Roll No', 'Status']];
    
    const data = filteredRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.course,
      record.subject,
      record.studentName,
      record.rollNo,
      record.status
    ]);

    doc.text(title, 14, 15);
    doc.autoTable({
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`attendance_records_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const uniqueCourses = [...new Set(attendanceRecords.map(record => record.course))];
  const uniqueSubjects = [...new Set(attendanceRecords.map(record => record.subject))];

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 p-4 mt-16 md:p-6 duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-sky-600 mb-2">Attendance Records</h1>
          <p className="text-gray-300 dark:text-gray-600">View and manage student attendance history</p>
        </div>

        <div className="bg-gray-800 dark:bg-white p-6 rounded-xl shadow-md border-gray-300 dark:border-gray-400 duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                  {...!startDate && { type: 'text', placeholder: 'Start Date' }}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                  {...!endDate && { type: 'text', placeholder: 'End Date' }}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                  <FiBook className="text-gray-400" />
                </div>
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                  <FiBook className="text-gray-400" />
                </div>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map((s, i) => (
                    <option key={i} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Name or Roll No"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <FiDownload className="mr-2" />
              Export CSV
            </button>
            <button
              onClick={exportToPDF}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <FiDownload className="mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <FiClock className="animate-spin mr-2 text-indigo-600" size={20} />
              <span className="text-gray-300 dark:text-gray-600">Loading attendance records...</span>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-300 dark:text-gray-600">
              <FiSearch size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-1">No records found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gray-800 dark:bg-white mt-6 rounded-xl shadow-md border border-gray-100 overflow-hidden duration-1000">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-sky-600">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Roll No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs text-white uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 duration-1000">
                    {currentRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">
                          {record.course}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">
                          {record.subject}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-sky-400 hover:text-sky-700">
                          <Link to={`/teacher/student/${record.studentId}`} className="flex items-center no-underline hover:underline text-sky-400 dark:text-sky-500 hover:text-sky-500">
                            <FiUser className="mr-1" size={14} />
                            {record.studentName}
                          </Link>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">
                          {record.rollNo}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            record.status === 'P' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'P' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 bg-gray-800 dark:bg-white p-4 rounded-lg duration-1000">
              <div className="text-sm text-gray-300 dark:text-gray-600">
                Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastRecord, filteredRecords.length)}
                </span>{' '}
                of <span className="font-medium">{filteredRecords.length}</span> records
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-500 duration-1000 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                >
                  <FiChevronLeft />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-sky-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {number}
                  </button>
                ))}
                
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-500 duration-1000 cursor-not-allowed' : 'bg-sky-600 text-white hover:bg-sky-700'}`}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AttendanceRecords;