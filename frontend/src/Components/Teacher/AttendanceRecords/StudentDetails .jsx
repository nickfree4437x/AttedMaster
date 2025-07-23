import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
  FiUser, FiMail, FiPhone, FiBook, 
  FiCalendar, FiHash, FiAward, 
  FiTrendingUp, FiBarChart2, FiCheckCircle, 
  FiXCircle, FiClock, FiPercent 
} from 'react-icons/fi';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function StudentDetails() {
  const { id } = useParams();
  const [studentDetails, setStudentDetails] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  // Helper function to check attendance status
  const isPresent = (status) => {
    if (!status) return false;
    const statusStr = String(status).trim().toLowerCase();
    return ['present', 'p', '1', 'yes', 'true', 'present'].includes(statusStr);
  };

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem('teacherToken');
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(`http://localhost:5000/api/teachers/student/${id}`, { headers });
        
        const fetchedStudent = response.data.student;
        const allRecords = response.data.attendanceRecords || [];

        // Filter records to only show those matching student's course and subjects
        const filteredRecords = allRecords.filter(record => 
          record.course === fetchedStudent.course && 
          (fetchedStudent.subjects && fetchedStudent.subjects.includes(record.subject))
        );

        setStudentDetails(fetchedStudent);
        setAttendanceRecords(filteredRecords);

      } catch (error) {
        console.error('Error fetching student details:', error);
        Swal.fire('Error', 'Failed to fetch student details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  // Process attendance data for charts
  const processAttendanceData = () => {
    const monthlyData = {};
    
    attendanceRecords.forEach(record => {
      if (!record.date) return;
      
      const date = new Date(record.date);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { present: 0, total: 0 };
      }
      
      monthlyData[monthYear].total++;
      if (isPresent(record.status)) {
        monthlyData[monthYear].present++;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      return new Date(year, monthNum - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
    });
    
    const data = sortedMonths.map(month => {
      const { present, total } = monthlyData[month];
      return total > 0 ? Math.round((present / total) * 100) : 0;
    });

    return { labels, data };
  };

  const { labels, data } = processAttendanceData();

  // Calculate attendance statistics
  const totalRecords = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => isPresent(r.status)).length;
  const absentCount = totalRecords - presentCount;
  const attendancePercentage = totalRecords > 0 
    ? Math.round((presentCount / totalRecords) * 100) 
    : 0;

  // Calculate recent attendance (last 30 days)
  const recentRecords = attendanceRecords.filter(record => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  });

  const recentPresentCount = recentRecords.filter(r => isPresent(r.status)).length;
  const recentAbsentCount = recentRecords.length - recentPresentCount;
  const recentAttendancePercentage = recentRecords.length > 0 
    ? Math.round((recentPresentCount / recentRecords.length) * 100) 
    : 0;

  // Chart configurations
  const lineChartData = {
    labels,
    datasets: [
      {
        label: 'Attendance Percentage',
        data,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#6366f1',
        pointHoverBorderColor: '#fff',
        pointHitRadius: 10,
        pointBorderWidth: 2,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}% attendance`
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    },
    maintainAspectRatio: false
  };

  const pieChartData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentCount, absentCount],
        backgroundColor: ['#10b981', '#ef4444'],
        hoverBackgroundColor: ['#34d399', '#f87171'],
        borderWidth: 0,
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-full mb-4"></div>
          <div className="h-4 bg-indigo-400 rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (!studentDetails || Object.keys(studentDetails).length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-xl shadow-xl max-w-md w-full duration-1000">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Student Not Found</h2>
          <p className="text-gray-600">The requested student details could not be loaded.</p>
        </div>
      </div>
    );
  }

  const {
    name,
    email,
    rollNo,
    phone,
    semester,
    course,
    subjects,
    studentId,
    userid
  } = studentDetails;

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 mt-16 py-8 px-4 sm:px-6 lg:px-8 duration-1000">
      <div className="max-w-6xl mx-auto">
        {/* Student Profile Header */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-1000 hover:shadow-lg">
          <div className="md:flex">
            <div className="md:flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center p-8 md:w-1/4">
              <div className="text-center text-white dark:text-white">
                <div className="h-24 w-24 mx-auto rounded-full bg-gray-800 dark:bg-gray-300 bg-opacity-20 flex items-center justify-center mb-4 duration-1000">
                  <FiUser className="h-12 w-12" />
                </div>
                <h1 className="text-2xl font-bold">{name}</h1>
                <p className="text-indigo-100">{course}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-200 dark:text-gray-600 font-medium bg-gray-800 dark:bg-white bg-opacity-20 duration-1000">
                    <FiTrendingUp className="mr-1" /> {attendancePercentage}% Overall
                  </span>
                </div>
              </div>
            </div>
            <div className="p-8 md:w-3/4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-200 dark:text-gray-600">Student Profile</h2>
                  <p className="text-gray-200 dark:text-gray-700">Detailed information and attendance records</p>
                </div>
                <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  Semester {semester}
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-400 hover:border-gray-300'}`}
                  >
                    Personal Details
                  </button>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendance' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-400 hover:border-gray-300'}`}
                  >
                    Attendance Records
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-300 dark:text-gray-600 hover:text-gray-400 hover:border-gray-300'}`}
                  >
                    Statistics
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'details' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailCard icon={<FiMail className="h-5 w-5 text-indigo-500" />} title="Email" value={email} />
                    <DetailCard icon={<FiHash className="h-5 w-5 text-indigo-500" />} title="Roll No" value={rollNo} />
                    <DetailCard icon={<FiPhone className="h-5 w-5 text-indigo-500" />} title="Phone" value={phone} />
                    <DetailCard icon={<FiAward className="h-5 w-5 text-indigo-500" />} title="Student ID" value={studentId} />
                    <DetailCard icon={<FiUser className="h-5 w-5 text-indigo-500" />} title="User ID" value={userid} />
                    <div className="md:col-span-2">
                      <DetailCard 
                        icon={<FiBook className="h-5 w-5 text-indigo-500" />} 
                        title="Subjects" 
                        value={subjects ? subjects.join(', ') : 'N/A'} 
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="overflow-x-auto">
                    {attendanceRecords.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-4">
                          <FiCalendar className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-200 dark:text-gray-700">
                          No matching attendance records
                        </h3>
                        <p className="text-gray-300 dark:text-gray-600">
                          No attendance found for {name}'s enrolled courses/subjects
                        </p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200 duration-1000">
                        <thead className="bg-sky-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Subject</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 duration-1000">
                          {attendanceRecords.map((record) => (
                            <tr key={record._id} className="transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200 dark:text-gray-700">
                                {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  isPresent(record.status) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.status || 'Absent'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{record.course || 'N/A'}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">{record.subject || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatCard 
                        title="Total Classes" 
                        value={totalRecords} 
                        icon={<FiCalendar className="h-6 w-6 text-indigo-500" />}
                        trend="text-gray-500"
                      />
                      <StatCard 
                        title="Present" 
                        value={presentCount} 
                        icon={<FiCheckCircle className="h-6 w-6 text-green-500" />}
                        trend="text-green-500"
                      />
                      <StatCard 
                        title="Overall Attendance" 
                        value={`${attendancePercentage}%`} 
                        icon={<FiPercent className="h-6 w-6 text-blue-500" />}
                        trend={attendancePercentage > 75 ? "text-green-500" : "text-red-500"}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-gray-800 dark:bg-white p-6 rounded-xl shadow duration-1000">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-200 dark:text-gray-700">Attendance Trend</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiBarChart2 className="mr-1" />
                            <span>Last {labels.length} months</span>
                          </div>
                        </div>
                        <div className="h-64">
                          <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 dark:bg-white p-6 rounded-xl shadow duration-1000">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-200 dark:text-gray-700">Attendance Distribution</h4>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiClock className="mr-1" />
                            <span>All Time</span>
                          </div>
                        </div>
                        <div className="h-64">
                          <Pie data={pieChartData} options={pieChartOptions} />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-800 dark:bg-white p-6 rounded-xl shadow duration-1000">
                        <h4 className="text-lg font-medium text-gray-200 dark:text-gray-700 mb-4">Recent Attendance (Last 30 Days)</h4>
                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold">
                            {recentAttendancePercentage}%
                          </div>
                          <div className={`text-lg ${recentAttendancePercentage > 75 ? 'text-green-500' : 'text-red-500'}`}>
                            {recentAttendancePercentage > 75 ? 'Good' : 'Needs Improvement'}
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${recentAttendancePercentage > 75 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ width: `${recentAttendancePercentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-sm text-gray-300 dark:text-gray-600 flex justify-between">
                          <span><FiCheckCircle className="inline mr-1 text-green-500" /> {recentPresentCount} Present</span>
                          <span><FiXCircle className="inline mr-1 text-red-500" /> {recentAbsentCount} Absent</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800 dark:bg-white p-6 rounded-xl shadow duration-1000">
                        <h4 className="text-lg font-medium text-gray-300 dark:text-gray-600 mb-4">Attendance by Subject</h4>
                        <div className="space-y-3">
                          {subjects && subjects.length > 0 ? (
                            subjects.map(subject => {
                              const subjectRecords = attendanceRecords.filter(r => r.subject === subject);
                              const subjectPresent = subjectRecords.filter(r => isPresent(r.status)).length;
                              const subjectPercentage = subjectRecords.length > 0 ? 
                                Math.round((subjectPresent / subjectRecords.length) * 100) : 0;
                              
                              return (
                                <div key={subject} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{subject}</span>
                                    <span>{subjectPercentage}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden duration-1000">
                                    <div 
                                      className={`h-full ${subjectPercentage > 75 ? 'bg-green-500' : subjectPercentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                      style={{ width: `${subjectPercentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-gray-300 dark:text-gray-600">No subjects enrolled</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Detail Card Component
const DetailCard = ({ icon, title, value }) => (
  <div className="bg-gray-800 dark:bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-md transition-shadow duration-1000">
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center duration-1000">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-200 dark:text-gray-700">{title}</h3>
        <p className="text-sm text-gray-300 dark:text-gray-600">{value || 'N/A'}</p>
      </div>
    </div>
  </div>
);

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-md transition-shadow duration-1000">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-200 dark:text-gray-700 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-300 dark:text-gray-600">{value}</p>
      </div>
      <div className={`${trend.replace('text', 'bg')}-100 p-3 rounded-full`}>
        {icon}
      </div>
    </div>
  </div>
);

export default StudentDetails;
