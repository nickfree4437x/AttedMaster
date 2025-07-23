import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCalendar, FiBook, FiCheckCircle, FiXCircle, FiChevronLeft, FiChevronRight, FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function AttendanceRecords() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0, percentage: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('studentToken');
      const res = await axios.get('https://attendmaster.onrender.com/api/students/my-attendance', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const attendanceData = res.data.attendance || [];
      setAttendance(attendanceData);
      
      // Calculate statistics
      const presentCount = attendanceData.filter(r => r.status === 'P').length;
      const absentCount = attendanceData.filter(r => r.status === 'A').length;
      
      setStats({
        present: presentCount,
        absent: absentCount,
        total: attendanceData.length,
        percentage: attendanceData.length > 0 ? Math.round((presentCount / attendanceData.length) * 100) : 0
      });

      const subjectsList = [...new Set(attendanceData.map(item => item.subject))];
      setSubjects(subjectsList);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const filteredAttendance = attendance
    .filter((record) => {
      const recordDate = new Date(record.date);
      const isInDateRange =
        (!startDate || recordDate >= new Date(startDate)) &&
        (!endDate || recordDate <= new Date(endDate));

      const matchesStatus = !statusFilter || record.status === statusFilter;
      const matchesSubject = !selectedSubject || record.subject === selectedSubject;
      const matchesSearch = !searchQuery || 
        record.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.date.toLowerCase().includes(searchQuery.toLowerCase());

      return isInDateRange && matchesStatus && matchesSubject && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAttendance.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAttendance.length / recordsPerPage);

  const resetFilters = () => {
    setSelectedSubject('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setSearchQuery('');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const chartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [stats.present, stats.absent],
        backgroundColor: ['#10B981', '#EF4444'],
        hoverBackgroundColor: ['#059669', '#DC2626'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PulseLoader color="#3B82F6" size={15} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-900 dark:from-gray-50 dark:to-gray-100 py-8 px-4 sm:px-6 lg:px-8 duration-1000">
      <div className="max-w-7xl mx-auto duration-1000">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-600 mb-1">Attendance Dashboard</h1>
            <p className="text-gray-300 dark:text-gray-600">Track and analyze your attendance records</p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-600 rounded-lg shadow-md border border-gray-200 transition-colors"
            disabled={refreshing}
          >
            <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
        
        {/* Stats Cards with Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 dark:bg-white rounded-2xl shadow-md p-6 col-span-1 lg:col-span-2 duration-1000">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br bg-gray-700 dark:from-blue-50 dark:to-blue-100 rounded-xl p-4 border border-blue-100 duration-1000">
                <h3 className="text-sm font-medium text-gray-200 dark:text-gray-600">Total Records</h3>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total}</p>
                <div className="h-1 w-full bg-blue-200 rounded-full mt-2">
                  <div className="h-1 bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="bg-gradient-to-br bg-gray-800 dark:from-green-50 dark:to-green-100 rounded-xl p-4 border border-green-100 duration-1000">
                <h3 className="text-sm font-medium text-gray-200 dark:text-gray-600">Present</h3>
                <p className="text-2xl font-bold text-green-400 mt-1">{stats.present}</p>
                <div className="h-1 w-full bg-green-200 rounded-full mt-2">
                  <div 
                    className="h-1 bg-green-500 rounded-full" 
                    style={{ width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gradient-to-br bg-gray-800 dark:from-red-50 dark:to-red-100 rounded-xl p-4 border border-red-100 duration-1000">
                <h3 className="text-sm font-medium text-gray-200 dark:text-gray-600">Absent</h3>
                <p className="text-2xl font-bold text-red-400 mt-1">{stats.absent}</p>
                <div className="h-1 w-full bg-red-200 rounded-full mt-2">
                  <div 
                    className="h-1 bg-red-500 rounded-full" 
                    style={{ width: `${stats.total ? (stats.absent / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="bg-gradient-to-br bg-gray-800 dark:from-indigo-50 dark:to-indigo-100 rounded-xl p-4 border border-indigo-100 duration-1000">
                <h3 className="text-sm font-medium text-gray-200 dark:text-gray-600">Attendance %</h3>
                <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.percentage}%</p>
                <div className="h-1 w-full bg-indigo-200 rounded-full mt-2">
                  <div 
                    className="h-1 bg-indigo-500 rounded-full" 
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 dark:bg-white rounded-2xl shadow-md p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-gray-200 dark:text-gray-600 mb-4">Attendance Distribution</h3>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut 
                  data={chartData} 
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          boxWidth: 10,
                          padding: 20,
                          font: {
                            family: 'Inter'
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden duration-1000">
          {/* Filters Section */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  placeholder="Search by subject or date..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 dark:bg-white border border-gray-200 text-gray-200 dark:text-gray-600 rounded-xl transition-colors duration-1000"
                >
                  <FiFilter className="text-blue-500" />
                  <span className="hidden sm:inline">{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                  {showFilters ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                </button>
                
                <button
                  onClick={resetFilters}
                  className="px-4 py-2.5 bg-gray-800 dark:bg-gray-50 text-gray-200 dark:text-gray-600 border-gray-200 rounded-xl transition-colors duration-1000"
                >
                  <span className="hidden sm:inline">Reset</span>
                  <span className="sm:hidden">↻</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  <div>
                    <select
                      className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                      value={selectedSubject}
                      onChange={(e) => {
                        setSelectedSubject(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject, index) => (
                        <option key={index} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">All Status</option>
                      <option value="P">Present</option>
                      <option value="A">Absent</option>
                    </select>
                  </div>

                  <div className="mb-4">
        {showStartDatePicker ? (
          <input
            type="date"
            className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            autoFocus
            onBlur={() => setShowStartDatePicker(false)}
          />
        ) : (
          <div
            className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-gray-400 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
            onClick={() => setShowStartDatePicker(true)}
          >
            {startDate || 'Start Date'}
          </div>
        )}
      </div>

      <div className="mb-4">
        {showEndDatePicker ? (
          <input
            type="date"
            className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            autoFocus
            onBlur={() => setShowEndDatePicker(false)}
          />
        ) : (
          <div
            className="px-4 py-2 bg-gray-800 dark:bg-gray-200 text-gray-400 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
            onClick={() => setShowEndDatePicker(true)}
          >
            {endDate || 'End Date'}
          </div>
        )}
      </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto">
            {filteredAttendance.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto max-w-md">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-200 dark:text-gray-600">No records found</h3>
                  <p className="mt-1 text-gray-200 dark:text-gray-600">Try adjusting your search or filter criteria</p>
                  <div className="mt-6">
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 duration-1000">
                <thead className="bg-sky-600">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer transition-colors"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 text-gray-400" />
                        <span>Date</span>
                        <span className="ml-1 text-blue-500">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      <div className="flex items-center">
                        <FiBook className="mr-2 text-gray-400" />
                        <span>Subject</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-100 duration-1000">
                  {currentRecords.map((record, index) => (
                    <motion.tr 
                      key={record._id} 
                      className="hover:bg-gray-950 dark:hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 dark:text-gray-600">
                        {indexOfFirstRecord + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-950 dark:bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                            <div className="text-center">
                              <div className="text-xs font-bold text-blue-600">
                                {new Date(record.date).toLocaleDateString('en-US', { day: 'numeric' })}
                              </div>
                              <div className="text-xs text-blue-400">
                                {new Date(record.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-300 dark:text-gray-700">
                              {formatDate(record.date).split(',')[0]}
                            </div>
                            <div className="text-xs text-gray-200 dark:text-gray-600">
                              {new Date(record.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-200 dark:text-gray-600">{record.subject}</div>
                        <div className="text-xs text-gray-200 dark:text-gray-600">Class {record.class || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'P' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {record.status === 'P' ? (
                            <span className="flex items-center">
                              <FiCheckCircle className="mr-1.5" /> Present
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <FiXCircle className="mr-1.5" /> Absent
                            </span>
                          )}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredAttendance.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-300 dark:text-gray-600">
                Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastRecord, filteredAttendance.length)}
                </span>{' '}
                of <span className="font-medium">{filteredAttendance.length}</span> records
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FiChevronLeft size={20} />
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendanceRecords;
