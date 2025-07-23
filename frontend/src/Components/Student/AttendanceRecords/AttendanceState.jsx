import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import { saveAs } from 'file-saver';
import { 
  FiCalendar, FiBook, FiCheckCircle, FiXCircle, 
  FiDownload, FiTrendingUp, FiAward, FiAlertTriangle,
  FiBarChart2, FiPieChart, FiClock, FiLoader
} from 'react-icons/fi';
import { motion } from 'framer-motion';

function AttendanceState() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState({
    totalClasses: 0,
    present: 0,
    absent: 0,
    attendancePercentage: 0,
  });
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [mostAttendedSubject, setMostAttendedSubject] = useState('');
  const [mostMissedSubject, setMostMissedSubject] = useState('');
  const [longestPresentStreak, setLongestPresentStreak] = useState(0);
  const [bestMonth, setBestMonth] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = localStorage.getItem('studentToken');
        const res = await axios.get('https://attendmaster.onrender.com/api/students/my-attendance', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.attendance || [];
        setAttendance(data);

        const totalClasses = data.length;
        const present = data.filter(r => r.status === 'P').length;
        const absent = totalClasses - present;
        const attendancePercentage = ((present / totalClasses) * 100).toFixed(2);

        // Monthly stats
        const monthlyMap = {};
        data.forEach(r => {
          const month = new Date(r.date).toLocaleString('default', { month: 'short', year: 'numeric' });
          if (!monthlyMap[month]) monthlyMap[month] = { present: 0, total: 0 };
          if (r.status === 'P') monthlyMap[month].present += 1;
          monthlyMap[month].total += 1;
        });
        const monthlyArray = Object.entries(monthlyMap).map(([month, stat]) => ({
          month,
          ...stat,
          percentage: ((stat.present / stat.total) * 100).toFixed(2),
        }));

        // Best Month
        const best = monthlyArray.reduce((a, b) => (+a.percentage > +b.percentage ? a : b), {});
        setBestMonth(best.month || 'N/A');

        // Subject stats
        const subjectMap = {};
        data.forEach(r => {
          const subject = r.subject;
          if (!subjectMap[subject]) subjectMap[subject] = { present: 0, total: 0 };
          if (r.status === 'P') subjectMap[subject].present += 1;
          subjectMap[subject].total += 1;
        });
        const subjectArray = Object.entries(subjectMap).map(([subject, stat]) => ({
          subject,
          ...stat,
          percentage: ((stat.present / stat.total) * 100).toFixed(2),
        }));

        const mostAttended = subjectArray.reduce((a, b) => (+a.percentage > +b.percentage ? a : b), {});
        const mostMissed = subjectArray.reduce((a, b) => (+a.percentage < +b.percentage ? a : b), {});

        // Longest present streak
        const sorted = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
        let maxStreak = 0, current = 0;
        for (let r of sorted) {
          if (r.status === 'P') {
            current++;
            maxStreak = Math.max(maxStreak, current);
          } else {
            current = 0;
          }
        }

        setAttendanceStats({ totalClasses, present, absent, attendancePercentage });
        setMonthlyStats(monthlyArray);
        setSubjectStats(subjectArray);
        setMostAttendedSubject(mostAttended.subject || 'N/A');
        setMostMissedSubject(mostMissed.subject || 'N/A');
        setLongestPresentStreak(maxStreak);
      } catch (err) {
        console.error('Error fetching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const downloadCSV = () => {
    const headers = ['Date,Subject,Status'];
    const rows = attendance.map(r => `${new Date(r.date).toLocaleDateString()},${r.subject},${r.status}`);
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'attendance_report.csv');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
      <p className="text-gray-600 text-lg">Loading your attendance data...</p>
    </div>
  );

  // Chart Data
  const pieData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [attendanceStats.present, attendanceStats.absent],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: monthlyStats.map(m => m.month),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: monthlyStats.map(m => m.percentage),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const subjectBarData = {
    labels: subjectStats.map(s => s.subject),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: subjectStats.map(s => s.percentage),
        backgroundColor: subjectStats.map(s => 
          s.percentage < 75 ? '#EF4444' : '#10B981'
        ),
        borderColor: subjectStats.map(s => 
          s.percentage < 75 ? '#DC2626' : '#059669'
        ),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-900 dark:from-gray-50 dark:to-blue-50 py-8 px-4 sm:px-6 lg:px-8 duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl shadow-md mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-700 opacity-95"></div>
          <div className="relative z-10 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3 mb-2">
                  <FiCalendar className="text-3xl" />
                  Attendance Analytics
                </h1>
                <p className="text-blue-100 text-lg">Track and analyze your class attendance patterns</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={downloadCSV}
                className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg shadow-md transition-all border border-white/20 duration-1000"
              >
                <FiDownload />
                Export Report
              </motion.button>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500 rounded-full opacity-20 transform translate-x-12 translate-y-12"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-indigo-400 rounded-full opacity-30 transform -translate-x-8 -translate-y-8"></div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-1000"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 dark:text-gray-700 text-sm font-medium">Total Classes</p>
                  <h3 className="text-3xl font-bold text-blue-400 mt-1">{attendanceStats.totalClasses}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiBook className="text-blue-600 text-2xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-200 dark:text-gray-700">All recorded sessions</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-1000"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200 dark:text-gray-700 font-medium">Present</p>
                  <h3 className="text-3xl font-bold text-green-400 mt-1">{attendanceStats.present}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <FiCheckCircle className="text-green-600 text-2xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-300 dark:text-gray-600">Attended classes</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-1000"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 dark:text-gray-700 text-sm font-medium">Absent</p>
                  <h3 className="text-3xl font-bold text-red-600 mt-1">{attendanceStats.absent}</h3>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <FiXCircle className="text-red-600 text-2xl" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-300 dark:text-gray-600">Missed classes</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
            className={`bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden duration-1000 border ${
              attendanceStats.attendancePercentage < 75 ? 'border-yellow-300' : 'border-purple-200'
            } hover:shadow-md transition-all relative`}
          >
            {attendanceStats.attendancePercentage < 75 && (
              <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                Warning
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 dark:text-gray-700 text-sm font-medium">Attendance %</p>
                  <h3 className={`text-3xl font-bold mt-1 ${
                    attendanceStats.attendancePercentage < 75 ? 'text-yellow-600' : 'text-purple-600'
                  }`}>
                    {attendanceStats.attendancePercentage}%
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${
                  attendanceStats.attendancePercentage < 75 ? 'bg-yellow-100' : 'bg-purple-100'
                }`}>
                  {attendanceStats.attendancePercentage < 75 ? (
                    <FiAlertTriangle className="text-yellow-600 text-2xl" />
                  ) : (
                    <FiTrendingUp className="text-purple-600 text-2xl" />
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {attendanceStats.attendancePercentage < 75 ? (
                  <p className="text-sm text-yellow-600 flex items-center gap-1">
                    <FiAlertTriangle /> Below 75% threshold
                  </p>
                ) : (
                  <p className="text-sm text-gray-300 dark:text-gray-600">Good attendance rate</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Attendance Trends */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-200 dark:text-gray-700 flex items-center gap-2">
                      <FiTrendingUp className="text-blue-600" />
                      Monthly Attendance Trend
                    </h2>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Your attendance percentage over time</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-600 text-sm">
                    <FiAward className="text-yellow-500" />
                    Best Month: {bestMonth}
                  </div>
                </div>
              </div>
              <div className="p-4 h-80">
                <Line 
                  data={lineData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 0,
                        max: 100,
                        grid: {
                          drawBorder: false,
                        },
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                          label: function(context) {
                            return ' ' + context.parsed.y + '%';
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>

            {/* Subject Performance */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold flex text-gray-200 dark:text-gray-700 items-center gap-2">
                  <FiBook className="text-blue-600" />
                  Subject Performance
                </h2>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Attendance percentage by subject</p>
              </div>
              <div className="p-4 h-80">
                <Bar 
                  data={subjectBarData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: 0,
                        max: 100,
                        grid: {
                          drawBorder: false,
                        },
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      },
                      x: {
                        grid: {
                          display: false,
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                          label: function(context) {
                            return ' ' + context.parsed.y + '%';
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats and Distribution */}
          <div className="space-y-8">
            {/* Attendance Distribution */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold flex text-gray-200 dark:text-gray-700 items-center gap-2">
                  <FiPieChart className="text-blue-600" />
                  Attendance Distribution
                </h2>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Present vs Absent ratio</p>
              </div>
              <div className="p-4 h-64">
                <Pie 
                  data={pieData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: {
                            family: 'Inter, sans-serif'
                          }
                        },
                      },
                      tooltip: {
                        backgroundColor: '#1E293B',
                        titleColor: '#F8FAFC',
                        bodyColor: '#F8FAFC',
                        borderColor: '#334155',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return ` ${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '65%',
                  }} 
                />
              </div>
            </motion.div>

            {/* Key Highlights */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold flex text-gray-200 dark:text-gray-700 items-center gap-2">
                  <FiAward className="text-blue-600" />
                  Key Highlights
                </h2>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Your attendance achievements</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <FiCheckCircle className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200 dark:text-gray-700">Best Subject</h3>
                    <p className="text-2xl font-bold text-gray-300 dark:text-gray-600 mt-1">{mostAttendedSubject}</p>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Highest attendance percentage</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
                    <FiXCircle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200 dark:text-gray-700">Needs Improvement</h3>
                    <p className="text-2xl font-bold text-gray-300 dark:text-gray-600 mt-1">{mostMissedSubject}</p>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Lowest attendance percentage</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <FiClock className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200 dark:text-gray-700">Consistency Streak</h3>
                    <p className="text-2xl font-bold text-gray-300 dark:text-gray-600 mt-1">{longestPresentStreak} days</p>
                    <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Longest consecutive attendance</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Detailed Tables Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          <div className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-200 dark:text-gray-700 flex items-center gap-2">
                <FiCalendar className="text-blue-600" />
                Monthly Breakdown
              </h2>
              <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Detailed attendance by month</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">%</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 duration-1000">
                  {monthlyStats.map((m, i) => (
                    <tr key={i} className="hover:bg-gray-950 hover:dark:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200 dark:text-gray-700">{m.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600 ">{m.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600 ">{m.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200 dark:text-gray-700 ">{m.percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {m.month === bestMonth ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Best</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800 dark:bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 duration-1000">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold flex text-gray-200 dark:text-gray-700 items-center gap-2">
                <FiBook className="text-blue-600" />
                Subject Breakdown
              </h2>
              <p className="text-sm text-gray-300 dark:text-gray-600  mt-1">Detailed attendance by subject</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-sky-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Present</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">%</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="dark:bg-white divide-y divide-gray-200 duration-1000">
                  {subjectStats.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-950 hover:dark:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200 dark:text-gray-700">{s.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{s.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">{s.present}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        s.percentage < 75 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {s.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {s.subject === mostAttendedSubject ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Best</span>
                        ) : s.subject === mostMissedSubject ? (
                          <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Needs Work</span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AttendanceState;
