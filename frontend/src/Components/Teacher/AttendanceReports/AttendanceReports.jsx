import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, BarChart, PieChart, Pie, Line, Bar, XAxis, YAxis, Tooltip, 
  Legend, CartesianGrid, ResponsiveContainer, Cell 
} from 'recharts';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  FiDownload, FiRefreshCw, FiAlertCircle, FiCalendar, FiFilter, 
  FiBarChart2, FiPieChart, FiMail, FiUsers 
} from 'react-icons/fi';
import { BsCheckCircleFill, BsXCircleFill } from 'react-icons/bs';
import Swal from 'sweetalert2';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

function TeacherAttendanceStats() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [activeTab, setActiveTab] = useState('overview');
  const [threshold, setThreshold] = useState(75);
  const [showAlerts, setShowAlerts] = useState(true);

  const token = localStorage.getItem('teacherToken');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch data
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/teachers/attendance-records', { headers });
      
      // Normalize the data with proper status handling
      const normalizedData = res.data.map(record => {
        // Convert status to lowercase and trim whitespace
        const rawStatus = String(record.status).trim().toLowerCase();
        
        // Determine if present (accept both 'p' and 'present')
        const isPresent = rawStatus === 'p' || rawStatus === 'present';
        
        return {
          ...record,
          status: isPresent ? 'present' : 'absent',
          subject: record.subject ? String(record.subject).trim() : 'Unknown',
          course: record.course ? String(record.course).trim() : 'Unknown',
          date: record.date || new Date().toISOString().split('T')[0]
        };
      });
      
      setRecords(normalizedData);
      setFilteredRecords(normalizedData);
    } catch (err) {
      console.error('Error fetching records:', err);
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

  // Apply filters
  useEffect(() => {
    let filtered = [...records];
    
    // Date filter
    if (startDate && endDate) {
      filtered = filtered.filter(record => {
        try {
          const recordDate = new Date(record.date);
          return recordDate >= startDate && recordDate <= endDate;
        } catch {
          return false;
        }
      });
    }
    
    // Subject filter
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(record => record.subject === selectedSubject);
    }
    
    // Course filter
    if (selectedCourse !== 'All') {
      filtered = filtered.filter(record => record.course === selectedCourse);
    }
    
    setFilteredRecords(filtered);
  }, [records, startDate, endDate, selectedSubject, selectedCourse]);

  // Statistics calculations
  const totalRecords = filteredRecords.length;
  const totalPresent = filteredRecords.filter(r => r.status === 'present').length;
  const attendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;

  const subjectStats = {};
  const courseStats = {};
  const monthStats = {};
  const dayOfWeekStats = {
    'Monday': { present: 0, total: 0 },
    'Tuesday': { present: 0, total: 0 },
    'Wednesday': { present: 0, total: 0 },
    'Thursday': { present: 0, total: 0 },
    'Friday': { present: 0, total: 0 },
    'Saturday': { present: 0, total: 0 },
    'Sunday': { present: 0, total: 0 }
  };

  filteredRecords.forEach((record) => {
    const isPresent = record.status === 'present';
    
    // Subject-wise
    const subject = record.subject;
    if (!subjectStats[subject]) {
      subjectStats[subject] = { present: 0, total: 0 };
    }
    subjectStats[subject].total += 1;
    if (isPresent) {
      subjectStats[subject].present += 1;
    }

    // Course-wise
    const course = record.course;
    if (!courseStats[course]) {
      courseStats[course] = { present: 0, total: 0 };
    }
    courseStats[course].total += 1;
    if (isPresent) {
      courseStats[course].present += 1;
    }

    // Month-wise
    try {
      const date = new Date(record.date);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthStats[month]) {
        monthStats[month] = { present: 0, total: 0 };
      }
      monthStats[month].total += 1;
      if (isPresent) {
        monthStats[month].present += 1;
      }

      // Day of week
      const day = date.toLocaleString('default', { weekday: 'long' });
      dayOfWeekStats[day].total += 1;
      if (isPresent) {
        dayOfWeekStats[day].present += 1;
      }
    } catch (e) {
      console.warn('Invalid date in record:', record.date);
    }
  });

  // Prepare chart data
  const monthChartData = Object.entries(monthStats).map(([month, data]) => ({
    month,
    percentage: Math.round((data.present / data.total) * 100),
  }));

  const subjectChartData = Object.entries(subjectStats).map(([subject, data]) => ({
    subject,
    percentage: Math.round((data.present / data.total) * 100),
    present: data.present,
    absent: data.total - data.present
  }));

  const dayOfWeekData = Object.entries(dayOfWeekStats).map(([day, data]) => ({
    day: day.substring(0, 3),
    percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
  }));

  // Find problematic subjects
  const problematicSubjects = Object.entries(subjectStats)
    .filter(([_, data]) => (data.present / data.total) * 100 < threshold)
    .map(([subject, data]) => ({
      subject,
      rate: Math.round((data.present / data.total) * 100),
      absent: data.total - data.present
    }))
    .sort((a, b) => a.rate - b.rate);

  // Find frequent absentees
  const studentStats = {};
  filteredRecords.forEach(record => {
    if (!record.studentId) return;
    
    if (!studentStats[record.studentId]) {
      studentStats[record.studentId] = {
        name: record.studentName || `Student ${record.studentId}`,
        rollNo: record.rollNo || 'N/A',
        present: 0,
        total: 0
      };
    }
    studentStats[record.studentId].total += 1;
    if (record.status === 'present') {
      studentStats[record.studentId].present += 1;
    }
  });

  const frequentAbsentees = Object.values(studentStats)
    .map(student => ({
      ...student,
      rate: Math.round((student.present / student.total) * 100),
      absent: student.total - student.present
    }))
    .filter(student => student.rate < threshold)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);

  // Get unique filter options
  const getUniqueOptions = (field) => {
    const values = records
      .map(record => record[field])
      .filter(value => value && value.trim() !== '');
    return ['All', ...new Set(values)];
  };

  const uniqueSubjects = getUniqueOptions('subject');
  const uniqueCourses = getUniqueOptions('course');

  // Export functions
  const exportCSV = () => {
    const csv = Papa.unparse(filteredRecords);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `attendance_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Attendance Report', 14, 20);
    
    let filterText = 'All records';
    if (startDate || endDate || selectedSubject !== 'All' || selectedCourse !== 'All') {
      filterText = 'Filters: ';
      if (startDate && endDate) {
        filterText += `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
      }
      if (selectedSubject !== 'All') filterText += ` | Subject: ${selectedSubject}`;
      if (selectedCourse !== 'All') filterText += ` | Course: ${selectedCourse}`;
    }
    doc.setFontSize(10);
    doc.text(filterText, 14, 28);
    
    doc.setFontSize(12);
    doc.text(`Total Records: ${totalRecords}`, 14, 40);
    doc.text(`Attendance Rate: ${attendanceRate}%`, 14, 48);
    
    doc.text('Subject-wise Attendance:', 14, 60);
    doc.autoTable({
      startY: 65,
      head: [['Subject', 'Present', 'Total', 'Rate (%)']],
      body: Object.entries(subjectStats).map(([subject, data]) => [
        subject,
        data.present,
        data.total,
        Math.round((data.present / data.total) * 100)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save(`attendance_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  // Notification functions
  const sendAlert = (type) => {
    Swal.fire({
      title: `Send ${type} alerts?`,
      text: `This will notify ${type === 'subject' ? problematicSubjects.length : frequentAbsentees.length} recipients`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Send'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Sent!',
          `Alerts have been ${type === 'subject' ? 'emailed to HOD' : 'sent to parents'}`,
          'success'
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 p-4 mt-16 md:p-6 duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-sky-600">Attendance Analytics Dashboard</h1>
            <p className="text-gray-300 dark:text-gray-600">Comprehensive insights into student attendance patterns</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button 
              onClick={fetchRecords}
              className="flex items-center px-3 py-2 bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 rounded-lg shadow-md hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors"
            >
              <FiRefreshCw className="mr-2 text-gray-300 dark:text-gray-700" />
              <span className="text-gray-300 dark:text-gray-600">Refresh</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowAlerts(!showAlerts)}
                className={`flex items-center px-3 py-2 rounded-lg shadow-sm transition-colors ${
                  showAlerts 
                    ? 'bg-red-900/30 dark:bg-red-100 text-red-400 dark:text-red-700 hover:bg-red-900/50 dark:hover:bg-red-200' 
                    : 'bg-gray-800 dark:bg-gray-100 text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-200'
                }`}
              >
                <FiAlertCircle className="mr-2" />
                <span>Alerts {showAlerts ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={(update) => setDateRange(update)}
                isClearable={true}
                placeholderText="Select date range"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-300"
              >
                {uniqueSubjects.map((subject, i) => (
                  <option key={i} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-300"
              >
                {uniqueCourses.map((course, i) => (
                  <option key={i} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 dark:text-gray-700 mb-1">Alert Threshold</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full mr-2"
                />
                <span className="text-sm font-medium">{threshold}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button
            onClick={exportCSV}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
          >
            <FiDownload className="mr-2" />
            Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center transition-colors duration-300"
          >
            <FiDownload className="mr-2" />
            Export PDF
          </button>
        </div>

        {/* Alerts Section */}
        {showAlerts && (problematicSubjects.length > 0 || frequentAbsentees.length > 0) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-700 mb-2 flex items-center">
              <FiAlertCircle className="mr-2 mt-6 text-red-500" /> Attendance Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {problematicSubjects.length > 0 && (
                <div className="bg-red-800 dark:bg-red-50 border shadow-md border-red-100 rounded-lg p-4 duration-1000">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-red-300 dark:text-red-800">Low Attendance Subjects</h4>
                    <button 
                      onClick={() => sendAlert('subject')}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                    >
                      <FiMail className="inline mr-1" /> Notify HOD
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {problematicSubjects.map((item, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className='text-gray-300 dark:text-gray-700'>{item.subject}</span>
                        <span className="font-medium text-gray-300 dark:text-gray-700">{item.rate}% ({item.absent} absences)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {frequentAbsentees.length > 0 && (
                <div className="bg-amber-800 dark:bg-amber-50 border shadow-md border-amber-100 rounded-lg p-4 duration-1000">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-amber-400 dark:text-amber-700">Frequent Absentees</h4>
                    <button 
                      onClick={() => sendAlert('student')}
                      className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1 rounded"
                    >
                      <FiMail className="inline mr-1" /> Contact Parents
                    </button>
                  </div>
                  <ul className="space-y-1">
                    {frequentAbsentees.map((student, i) => (
                      <li key={i} className="flex justify-between text-sm">
                        <span className='text-gray-300 dark:text-gray-700'>{student.name} ({student.rollNo})</span>
                        <span className="font-medium text-gray-300 dark:text-gray-700">{student.rate}% ({student.absent} absences)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-300 dark:text-gray-700 hover:text-gray-200 hover:border-gray-300'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subjects' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-300 dark:text-gray-700 hover:text-gray-200 hover:border-gray-300'}`}
            >
              Subject Analysis
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'trends' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-300 dark:text-gray-700 hover:text-gray-200 hover:border-gray-300'}`}
            >
              Trends
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center">
              <FiRefreshCw className="animate-spin mr-2 text-indigo-600" size={20} />
              <span className="text-gray-600">Loading attendance data...</span>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    title="Overall Attendance" 
                    value={`${attendanceRate}%`}
                    change={attendanceRate >= 75 ? 'positive' : 'negative'}
                    icon={<FiBarChart2 className="text-sky-500" />}
                  />
                  <StatCard 
                    title="Total Records" 
                    value={totalRecords}
                    icon={<FiCalendar className="text-sky-500" />}
                  />
                  <StatCard 
                    title="Present Students" 
                    value={totalPresent}
                    icon={<FiUsers className="text-green-500" />}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-md border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-700 mb-4 flex items-center">
                      <FiPieChart className="mr-2 text-sky-500" /> Subject Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subjectChartData.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="present"
                            nameKey="subject"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {subjectChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} present`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-700 mb-4 flex items-center">
                      <FiBarChart2 className="mr-2 text-sky-500" /> Day of Week Analysis
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                          <Bar dataKey="percentage" fill="#8884d8" name="Attendance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subjects Tab */}
            {activeTab === 'subjects' && (
              <div className="space-y-6">
                <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg text-gray-300 dark:text-gray-700  font-semibold mb-4">Subject Performance</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-sky-600">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Present</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Absent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Attendance %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200">
                        {subjectChartData.map((subject) => (
                          <tr key={subject.subject}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-700">{subject.subject}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{subject.present}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{subject.absent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{subject.percentage}%</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                subject.percentage >= 85 ? 'bg-green-800 text-green-100' :
                                subject.percentage >= 70 ? 'bg-yellow-800 text-yellow-100' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {subject.percentage >= 85 ? 'Excellent' :
                                 subject.percentage >= 70 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Trends Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-600 mb-4">Monthly Attendance Trend</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="percentage" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                          name="Attendance Rate"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-600 mb-4">Course Comparison</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(courseStats).map(([course, data]) => ({
                            course,
                            percentage: Math.round((data.present / data.total) * 100)
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="course" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                          <Bar dataKey="percentage" fill="#8884d8" name="Attendance %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg text-gray-300 dark:text-gray-600 font-semibold mb-4">Attendance Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Present', value: totalPresent },
                              { name: 'Absent', value: totalRecords - totalPresent }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#4ade80" />
                            <Cell fill="#f87171" />
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Students']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }) {
  return (
    <div className="bg-gray-800 dark:bg-white p-4 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300 dark:text-gray-700">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-300 dark:text-gray-600">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${change === 'positive' ? 'bg-green-400 dark:bg-gray-100 text-green-100' : change === 'negative' ? 'bg-red-400 dark:bg-red-100 text-red-100' : 'bg-gray-300 dark:bg-gray-100 text-gray-600'}`}>
          {icon || <FiBarChart2 />}
        </div>
      </div>
    </div>
  );
}

export default TeacherAttendanceStats;
