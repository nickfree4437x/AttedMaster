import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiDownload, 
  FiFileText, 
  FiFile, 
  FiCalendar, 
  FiBook, 
  FiUser,
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const AttendanceRecords = () => {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const getAttendanceRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found, please login again.');
        setLoading(false);
        return;
      }

      const response = await axios.get('https://attendmaster.onrender.com/api/attendance', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAttendanceData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching attendance records');
      setLoading(false);
    }
  };

  useEffect(() => {
    getAttendanceRecords();
  }, []);

  // Get unique values for filters
  const uniqueCourses = [...new Set(attendanceData.map((r) => r.course))];
  const uniqueSubjects = [...new Set(attendanceData.map((r) => r.subject))];

  // Filter data based on search criteria
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch =
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.rollNo.toString().includes(searchQuery);

    const matchesCourse = selectedCourse ? record.course === selectedCourse : true;
    const matchesSubject = selectedSubject ? record.subject === selectedSubject : true;
    const matchesStart = startDate ? new Date(record.date) >= new Date(startDate) : true;
    const matchesEnd = endDate ? new Date(record.date) <= new Date(endDate) : true;

    return matchesSearch && matchesCourse && matchesSubject && matchesStart && matchesEnd;
  });

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Export functions
  const exportToCSV = () => {
    const headers = [
      'Sr No',
      'Student Name',
      'Roll No',
      'Teacher Name',
      'Course',
      'Subject',
      'Status',
      'Date',
    ];
    const rows = filteredData.map((r, i) => [
      i + 1,
      r.studentName,
      r.rollNo,
      r.teacherName || 'N/A',
      r.course,
      r.subject,
      r.status === 'P' ? 'Present' : 'Absent',
      new Date(r.date).toLocaleDateString(),
    ]);
    const csv =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'attendance_records.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Attendance Records', 14, 15);

    const tableColumn = [
      'Sr No',
      'Student Name',
      'Roll No',
      'Teacher Name',
      'Course',
      'Subject',
      'Status',
      'Date',
    ];
    const tableRows = filteredData.map((r, i) => [
      i + 1,
      r.studentName,
      r.rollNo,
      r.teacherName || 'N/A',
      r.course,
      r.subject,
      r.status === 'P' ? 'Present' : 'Absent',
      new Date(r.date).toLocaleDateString(),
    ]);

    autoTable(doc, {
      startY: 20,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save('attendance_records.pdf');
  };

  const viewStatistics = () => {
    navigate('/attendance-statistics', { 
      state: { 
        attendanceData: filteredData,
        filters: {
          searchQuery,
          selectedCourse,
          selectedSubject,
          startDate,
          endDate
        }
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
       {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mt-8 text-sky-600 dark:text-sky-600">
            Attendance Records
          </h1>
          <p className="mt-2 text-gray-300 dark:text-gray-600">
            View and manage student attendance data
          </p>
        </div>


        {/* Filters Card */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-700 dark:border-gray-200 transition-colors duration-1000">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Name or Roll No"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Course Filter */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <FiBook className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course, i) => (
                    <option key={i} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Filter */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                  <FiFileText className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map((subject, i) => (
                    <option key={i} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={startDate ? 'date' : 'text'}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                    className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Start date"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <FiCalendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={endDate ? 'date' : 'text'}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => !e.target.value && (e.target.type = 'text')}
                    className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <FiFile className="mr-2" /> Export as CSV
            </button>
            <button
              onClick={exportToPDF}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
            >
              <FiDownload className="mr-2" /> Export as PDF
            </button>
          </div>

          {/* View Statistics Button */}
          <Link
            to="/admin/attendance-statistics"
            className="w-full mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 no-underline text-white rounded-lg flex items-center justify-center transition-colors duration-300"
          >
            <FiBarChart2 className="mr-2" /> View Attendance Analytics 
          </Link>

        </div>

        {/* Show Entries Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div className="flex items-center">
            <span className="text-sm text-gray-300 dark:text-gray-600 mr-2">Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-600 dark:border-gray-300 rounded bg-gray-700 dark:bg-white text-gray-300 dark:text-gray-600 duration-1000"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-300 dark:text-gray-600 ml-2">entries</span>
          </div>
          <div className="text-sm text-gray-300 dark:text-gray-600">
            Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} entries
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-gray-300 dark:text-gray-600">Loading attendance records...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 dark:bg-red-100 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-1000 mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-sky-600 dark:bg-sky-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      S. NO.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Roll No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Teacher
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 dark:divide-gray-700 duration-1000">
                  {currentEntries.length > 0 ? (
                    currentEntries.map((record, index) => (
                      <tr key={record._id} className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200 dark:text-gray-700">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-600 text-xs font-medium duration-1000">
                          {indexOfFirstEntry + index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.rollNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.teacherName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold duration-1000 rounded-full ${
                              record.status === 'P'
                                ? 'bg-green-900/30 dark:bg-green-200 text-gray-100 dark:text-gray-500'
                                : 'bg-red-900/30 dark:bg-red-200 text-gray-100 dark:text-gray-500'
                            }`}
                          >
                            {record.status === 'P' ? 'Present' : 'Absent'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-300 dark:text-gray-500">
                        No attendance records found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-300 dark:text-gray-600">
              Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredData.length)} of {filteredData.length} entries
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-600 duration-1000 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <FiChevronLeft />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'bg-gray-700 dark:bg-gray-200 hover:bg-gray-600 dark:hover:bg-gray-300'}`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-700 dark:bg-gray-200 text-gray-300 dark:text-gray-600 duration-1000 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
