import React, { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiFilter, FiDownload, FiAlertCircle, FiCalendar, 
  FiBook, FiBookmark, FiUsers, FiCheckCircle, 
  FiXCircle, FiTrendingUp, FiMap 
} from 'react-icons/fi';
import Heatmap from 'react-heatmap-grid';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

// PDF Document Component
const AttendancePDF = ({ data }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>Attendance Report</Text>
        <Text style={styles.subheader}>Generated on: {new Date().toLocaleDateString()}</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableHeader}>Student</Text>
            <Text style={styles.tableHeader}>Course</Text>
            <Text style={styles.tableHeader}>Subject</Text>
            <Text style={styles.tableHeader}>Date</Text>
            <Text style={styles.tableHeader}>Status</Text>
          </View>
          
          {data.map((record, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCell}>{record.studentName}</Text>
              <Text style={styles.tableCell}>{record.course}</Text>
              <Text style={styles.tableCell}>{record.subject}</Text>
              <Text style={styles.tableCell}>{new Date(record.date).toLocaleDateString()}</Text>
              <Text style={[styles.tableCell, record.status === 'P' ? styles.present : styles.absent]}>
                {record.status === 'P' ? 'Present' : 'Absent'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  subheader: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: 'gray'
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#bfbfbf',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#bfbfbf',
  },
  tableHeader: {
    width: '20%',
    padding: 5,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    textAlign: 'center'
  },
  tableCell: {
    width: '20%',
    padding: 5,
    textAlign: 'center'
  },
  present: {
    color: 'green'
  },
  absent: {
    color: 'red'
  }
});

const AdminAttendanceStatistics = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDarkMode] = useState(false); // Theme state
  const [shownAlerts, setShownAlerts] = useState(new Set());

  // Filter states
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [comparisonMode, setComparisonMode] = useState('none');

  // Stats states
  const [totalRecords, setTotalRecords] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);

  // Alert threshold
  const [attendanceThreshold, setAttendanceThreshold] = useState(75);
  const [alertEnabled, setAlertEnabled] = useState(true);

  // Chart data states
  const [monthlyData, setMonthlyData] = useState({
    labels: [],
    presentData: [],
    absentData: [],
    comparisonData: []
  });

  const [heatmapData, setHeatmapData] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [courseStats, setCourseStats] = useState([]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/attendance', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        setAttendanceData(data);
        setFilteredData(data);
        calculateStats(data);
        prepareChartData(data);
        prepareHeatmapData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load attendance data');
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedCourse, selectedSubject, dateRange, comparisonMode]);

  useEffect(() => {
    setShownAlerts(new Set());
  }, [selectedCourse, selectedSubject, dateRange]);

  const calculateStats = (data) => {
    const total = data.length;
    const present = data.filter((r) => r.status === 'P').length;
    const absent = total - present;
    const rate = total > 0 ? (present / total) * 100 : 0;

    setTotalRecords(total);
    setPresentCount(present);
    setAbsentCount(absent);
    setAttendanceRate(rate);

    checkAttendanceAlerts(data);
  };

  const prepareHeatmapData = (data) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 14 }, (_, i) => `${i + 8}-${i + 9}`);
    
    const heatmap = Array(days.length).fill().map(() => Array(hours.length).fill(0));
    const count = Array(days.length).fill().map(() => Array(hours.length).fill(0));
    
    data.forEach(record => {
      const date = new Date(record.date);
      const day = date.getDay();
      const hour = date.getHours() - 8;
      
      if (hour >= 0 && hour < hours.length) {
        count[day][hour]++;
        if (record.status === 'P') {
          heatmap[day][hour]++;
        }
      }
    });

    const rates = heatmap.map((row, i) => 
      row.map((val, j) => count[i][j] > 0 ? Math.round((val / count[i][j]) * 100) : 0)
    );

    setHeatmapData({
      data: rates,
      xLabels: hours,
      yLabels: days
    });
  };

  const prepareChartData = (data) => {
    const groupedBySubject = _.groupBy(data, 'subject');
    const subjectStatsArr = Object.keys(groupedBySubject).map((subject) => {
      const records = groupedBySubject[subject];
      const present = records.filter((r) => r.status === 'P').length;
      const total = records.length;
      return {
        subject,
        present,
        absent: total - present,
        rate: total > 0 ? (present / total) * 100 : 0
      };
    });
    setSubjectStats(subjectStatsArr);

    const groupedByCourse = _.groupBy(data, 'course');
    const courseStatsArr = Object.keys(groupedByCourse).map((course) => {
      const records = groupedByCourse[course];
      const present = records.filter((r) => r.status === 'P').length;
      const total = records.length;
      return {
        course,
        present,
        absent: total - present,
        rate: total > 0 ? (present / total) * 100 : 0
      };
    });
    setCourseStats(courseStatsArr);

    const groupedByMonth = _.groupBy(data, (record) => {
      const date = new Date(record.date);
      return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    });

    let months = Object.keys(groupedByMonth).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    const presentPerMonth = months.map((month) => {
      return groupedByMonth[month].filter((r) => r.status === 'P').length;
    });

    const absentPerMonth = months.map((month) => {
      return groupedByMonth[month].filter((r) => r.status === 'A').length;
    });

    let comparisonData = [];
    if (comparisonMode === 'previous_period' && months.length > 1) {
      comparisonData = presentPerMonth.map((_, i) => {
        if (i < presentPerMonth.length / 2) return presentPerMonth[i + Math.floor(presentPerMonth.length / 2)];
        return null;
      });
    } else if (comparisonMode === 'year_over_year') {
      comparisonData = presentPerMonth.map((_, i) => {
        const compareMonth = months[i].split(' ')[0] + ' ' + (parseInt(months[i].split(' ')[1]) - 1);
        if (groupedByMonth[compareMonth]) {
          return groupedByMonth[compareMonth].filter((r) => r.status === 'P').length;
        }
        return null;
      });
    }

    setMonthlyData({
      labels: months,
      presentData: presentPerMonth,
      absentData: absentPerMonth,
      comparisonData
    });
  };

  const applyFilters = () => {
    let filtered = [...attendanceData];

    if (selectedCourse !== 'all') {
      filtered = filtered.filter((item) => item.course === selectedCourse);
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter((item) => item.subject === selectedSubject);
    }

    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    setFilteredData(filtered);
    calculateStats(filtered);
    prepareChartData(filtered);
    prepareHeatmapData(filtered);
  };

  const checkAttendanceAlerts = (data) => {
    if (!alertEnabled) return;

    const groupedBySubject = _.groupBy(data, 'subject');
    const newAlerts = new Set();
    
    Object.keys(groupedBySubject).forEach((subject) => {
      const records = groupedBySubject[subject];
      const present = records.filter((r) => r.status === 'P').length;
      const rate = (present / records.length) * 100;

      if (rate < attendanceThreshold) {
        const alertKey = `${subject}_${Math.floor(rate)}`;
        newAlerts.add(alertKey);
        
        if (!shownAlerts.has(alertKey)) {
          showAlert(`Low attendance in ${subject}: ${rate.toFixed(1)}%`);
        }
      }
    });

    setShownAlerts(newAlerts);
  };

  const showAlert = (message) => {
    toast.warn(message, {
      position: "top-right",
      autoClose: 8000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  // Get unique courses and subjects for dropdowns
  const courses = _.uniq(attendanceData.map((item) => item.course));
  const subjects = _.uniq(attendanceData.map((item) => item.subject));

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance_report.xlsx");
    showAlert("Excel report generated successfully!");
  };

  // Export to CSV
  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, "attendance_report.csv");
    showAlert("CSV report generated successfully!");
  };

  // Chart options with theme support
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#111827',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#e5e7eb' : '#111827',
        bodyColor: isDarkMode ? '#e5e7eb' : '#111827',
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(209, 213, 219, 1)',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(209, 213, 219, 1)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(209, 213, 219, 1)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#111827',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#e5e7eb' : '#111827',
        bodyColor: isDarkMode ? '#e5e7eb' : '#111827',
        borderColor: isDarkMode ? 'rgba(55, 65, 81, 1)' : 'rgba(209, 213, 219, 1)',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  // Chart data
  const lineChartData = {
  labels: monthlyData.labels,
  datasets: [
    {
      label: 'Present',
      data: monthlyData.presentData,
      fill: true,
      backgroundColor: isDarkMode ? 'rgba(74, 222, 128, 0.2)' : 'rgba(74, 222, 128, 0.3)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Absent',
      data: monthlyData.absentData,
      fill: true,
      backgroundColor: isDarkMode ? 'rgba(252, 165, 165, 0.2)' : 'rgba(252, 165, 165, 0.3)',
      borderColor: 'rgba(239, 68, 68, 1)',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: 'rgba(239, 68, 68, 1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    ...(comparisonMode !== 'none' ? [{
      label: comparisonMode === 'previous_period' ? 'Previous Period' : 'Last Year',
      data: monthlyData.comparisonData,
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 2,
      borderDash: [5, 5],
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      pointRadius: 4,
      pointHoverRadius: 6,
    }] : [])
  ],
};

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentCount, absentCount],
        backgroundColor: [
          isDarkMode ? 'rgba(34, 197, 94, 0.8)' : 'rgba(74, 222, 128, 0.8)',
          isDarkMode ? 'rgba(239, 68, 68, 0.8)' : 'rgba(248, 113, 113, 0.8)'
        ],
        borderColor: [
          isDarkMode ? 'rgba(34, 197, 94, 1)' : 'rgba(22, 163, 74, 1)',
          isDarkMode ? 'rgba(239, 68, 68, 1)' : 'rgba(220, 38, 38, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br dark:bg-gray-50 p-4 md:p-8 duration-1000">
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl mt-12 font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-sky-500 mb-2">
            Attendance Analytics Dashboard
          </h1>
          <p className="text-gray-300 dark:text-gray-600">Comprehensive overview of student attendance patterns</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md mb-8 duration-1000">
              <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                <FiFilter className="mr-2 text-cyan-400" />
                Filters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Course Filter */}
                <div>
                  <select
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {courses.map((course) => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <select
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <DatePicker
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(update) => setDateRange(update)}
                    isClearable={true}
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    placeholderText="Select date range"
                  />
                </div>

                {/* Comparison Mode */}
                <div>
                  <select
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    value={comparisonMode}
                    onChange={(e) => setComparisonMode(e.target.value)}
                  >
                    <option value="none">No comparison</option>
                    <option value="previous_period">Previous Period</option>
                    <option value="year_over_year">Year Over Year</option>
                  </select>
                </div>
              </div>

              {/* Alert Settings */}
              <div className="mt-4 pt-4 border-t border-gray-700 duration-1000">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-300 dark:text-gray-600">Attendance Alerts</h3>
                    <p className="text-xs text-gray-200 dark:text-gray-500">Get notified when attendance drops below threshold</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="alertToggle"
                        checked={alertEnabled}
                        onChange={() => setAlertEnabled(!alertEnabled)}
                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded"
                      />
                      <label htmlFor="alertToggle" className="ml-2 block text-sm text-gray-300 dark:text-gray-600">
                        Enable Alerts
                      </label>
                    </div>
                    {alertEnabled && (
                      <div className="flex items-center">
                        <label htmlFor="threshold" className="mr-2 block text-sm text-gray-300 dark:text-gray-600">
                          Threshold:
                        </label>
                        <input
                          type="number"
                          id="threshold"
                          min="0"
                          max="100"
                          value={attendanceThreshold}
                          onChange={(e) => setAttendanceThreshold(parseInt(e.target.value))}
                          className="w-16 bg-gray-700 dark:bg-gray-50 border border-gray-600 rounded-md py-1 px-2 text-gray-300 dark:text-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <span className="ml-1 text-sm text-gray-300 dark:text-gray-600">%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-cyan-500/10 transition-all duration-1000">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600">Total Records</p>
                    <h3 className="text-3xl font-bold text-gray-300 dark:text-gray-600 mt-2">{totalRecords}</h3>
                  </div>
                  <div className="p-3 rounded-full bg-gray-700/50 dark:bg-gray-300 duration-1000">
                    <FiUsers className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-green-500/10 transition-all duration-1000">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600">Present Students</p>
                    <h3 className="text-3xl font-bold text-gray-300 dark:text-gray-600 mt-2">{presentCount}</h3>
                    <p className="text-green-400 mt-1">
                      {attendanceRate.toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-700/50 dark:bg-gray-300 duration-1000" >
                    <FiCheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-red-500/10 transition-all duration-1000">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600">Absent Students</p>
                    <h3 className="text-3xl font-bold text-gray-300 dark:text-gray-600 mt-2">{absentCount}</h3>
                    <p className="text-red-400 mt-1">
                      {(100 - attendanceRate).toFixed(1)}% of total
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-700/50 dark:bg-gray-300 duration-1000">
                    <FiXCircle className="w-6 h-6 text-red-400" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm border border-gray-800 rounded-xl p-6 shadow-md hover:shadow-yellow-500/10 transition-all duration-1000">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600">Overall Attendance</p>
                    <h3 className="text-3xl font-bold text-gray-300 dark:text-gray-600 mt-2">{attendanceRate.toFixed(1)}%</h3>
                    <div className="w-full bg-gray-700 dark:bg-gray-300 rounded-full h-2 mt-2 duration-1000">
                      <div
                        className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-gray-700/50 dark:bg-gray-300 duration-1000">
                    <FiBookmark className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Export Controls */}
            <div className="backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md mb-8 duration-1000">
              <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                <FiDownload className="mr-2 text-cyan-400" />
                Export Reports
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={exportToExcel}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-1000"
                >
                  <FiDownload className="mr-2" />
                  Export to Excel
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Export to CSV
                </button>
                <PDFDownloadLink
                  document={<AttendancePDF data={filteredData} />}
                  fileName="attendance_report.pdf"
                  className="flex items-center px-4 py-2 no-underline bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  <FiDownload className="mr-2" />
                  Export to PDF
                </PDFDownloadLink>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Pie Chart */}
              <div className="lg:col-span-1 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                  <FiBook className="mr-2 text-cyan-400" />
                  Attendance Distribution
                </h2>
                <div className="h-64">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </div>

              {/* Line Chart */}
              <div className="lg:col-span-2 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md">
                <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                  <FiCalendar className="mr-2 text-cyan-400" />
                  Monthly Attendance Trend
                  {comparisonMode !== 'none' && (
                    <span className="ml-2 text-sm bg-indigo-900/50 text-indigo-300 px-2 py-1 rounded duration-1000">
                      {comparisonMode === 'previous_period' ? 'vs Previous Period' : 'vs Last Year'}
                    </span>
                  )}
                </h2>
                <div className="h-64">
                  <Line data={lineChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md mb-8">
              <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                <FiMap className="mr-2 text-cyan-400" />
                Attendance Heatmap (Day/Hour)
              </h2>
              <div className="overflow-x-auto">
                {heatmapData.data && (
                  <div className="heatmap-container">
                    <Heatmap
                      data={heatmapData.data}
                      xLabels={heatmapData.xLabels}
                      yLabels={heatmapData.yLabels}
                      background="#1f2937"
                      height={30}
                      squares
                      labelStyle={{ 
                        color: '#e5e7eb',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}
                      xLabelStyle={() => ({
                        color: '#e5e7eb',
                        fontSize: '9px'
                      })}
                      yLabelStyle={() => ({
                        color: '#e5e7eb',
                        fontSize: '10px'
                      })}
                      cellStyle={(background, value, min, max, data, x, y) => ({
                        background: `rgba(74, 222, 128, ${value/100})`,
                        color: value > 50 ? '#111827' : '#f3f4f6',
                        fontSize: '10px',
                        boxShadow: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px'
                      })}
                      onClick={(x, y) => {
                        const day = heatmapData.yLabels[y];
                        const hour = heatmapData.xLabels[x];
                        showAlert(`Attendance rate for ${day} ${hour}: ${heatmapData.data[y][x]}%`);
                      }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-300 dark:text-gray-600">
                      <span>Low Attendance</span>
                      <span>High Attendance</span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 mt-1 rounded-full duration-1000"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Subject-wise Stats */}
            <div className="backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md mb-8">
              <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                <FiBook className="mr-2 text-cyan-400" />
                Subject-wise Attendance
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-sky-600">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Present
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Absent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Attendance Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 duration-1000">
                    {subjectStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-600">
                          {stat.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          {stat.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                          {stat.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 dark:bg-gray-300 rounded-full h-2.5 mr-2 duration-1000">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-300 h-2.5 rounded-full duration-1000"
                                style={{ width: `${stat.rate}%` }}
                              ></div>
                            </div>
                            <span>{stat.rate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {stat.rate >= 80 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/50 text-green-300">
                              Excellent
                            </span>
                          ) : stat.rate >= 60 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/50 text-blue-300">
                              Good
                            </span>
                          ) : stat.rate >= 40 ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/50 text-yellow-300">
                              Fair
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900/50 text-red-300">
                              Needs Improvement
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Course-wise Stats */}
            <div className="backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-4 flex items-center">
                <FiUsers className="mr-2 text-cyan-400" />
                Course-wise Attendance
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-sky-600 rounded-md">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Present
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Absent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Attendance Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 duration-1000">
                    {courseStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-600">
                          {stat.course}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                          {stat.present}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">
                          {stat.absent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 dark:bg-gray-300 rounded-full h-2.5 mr-2 duration-1000">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-300 h-2.5 rounded-full"
                                style={{ width: `${stat.rate}%` }}
                              ></div>
                            </div>
                            <span>{stat.rate.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceStatistics;