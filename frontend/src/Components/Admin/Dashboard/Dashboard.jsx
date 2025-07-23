import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts';
import { FiUsers, FiUserCheck, FiUserX, FiBook, FiCalendar, FiAward, FiClock } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [latestRecords, setLatestRecords] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [subjectWise, setSubjectWise] = useState([]);
  const [topAbsentees, setTopAbsentees] = useState([]);
  const [topAttendees, setTopAttendees] = useState([]);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate('/admin/profile');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token not found. Please log in again.');
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [studentsRes, teachersRes, attendanceRes] = await Promise.all([
          axios.get('http://localhost:5000/api/students/get', { headers }),
          axios.get('http://localhost:5000/api/teacher/get', { headers }),
          axios.get('http://localhost:5000/api/attendance', { headers }),
        ]);

        const students = studentsRes.data;
        const records = attendanceRes.data;

        setStudentsCount(students.length || 0);
        setTeachersCount(teachersRes.data.length || 0);

        const today = new Date().toISOString().split("T")[0];
        const formattedRecords = records.map(record => ({
          ...record,
          isoDate: new Date(record.date).toISOString().split("T")[0],
        }));

        const todaysRecords = formattedRecords.filter(record => record.isoDate === today);
        const present = todaysRecords.filter(record => record.status === 'P').length;
        const absent = todaysRecords.filter(record => record.status === 'A').length;

        setPresentCount(present);
        setAbsentCount(absent);

        const latest = [...records].reverse().slice(0, 5);
        setLatestRecords(latest);

        if (todaysRecords.length === 0) {
          setNotification('No attendance marked today.');
        } else if (absent === 0) {
          setNotification('All students are present today!');
        } else {
          const absentees = todaysRecords.filter(r => r.status === 'A');
          const topAbsentStudents = [...new Set(absentees.map(r => r.studentName))].slice(0, 5);
          setNotification('Top Absentees Today: ' + topAbsentStudents.join(', '));
        }

        // Monthly Trend
        const monthData = {};
        formattedRecords.forEach(record => {
          const month = new Date(record.date).toLocaleString('default', { month: 'short' });
          if (!monthData[month]) monthData[month] = { Present: 0, Absent: 0 };
          if (record.status === 'P') monthData[month].Present++;
          if (record.status === 'A') monthData[month].Absent++;
        });
        setMonthlyTrend(Object.entries(monthData).map(([month, data]) => ({ month, ...data })));

        // Subject-wise Breakdown
        const subjectData = {};
        formattedRecords.forEach(record => {
          const subject = record.subject || 'Unknown';
          if (!subjectData[subject]) subjectData[subject] = { Present: 0, Absent: 0 };
          if (record.status === 'P') subjectData[subject].Present++;
          if (record.status === 'A') subjectData[subject].Absent++;
        });
        setSubjectWise(Object.entries(subjectData).map(([subject, data]) => ({ subject, ...data })));

        // Top Attendees & Absentees
        const attendanceMap = {};
        formattedRecords.forEach(record => {
          const name = record.studentName || 'Unknown';
          if (!attendanceMap[name]) attendanceMap[name] = { Present: 0, Absent: 0 };
          if (record.status === 'P') attendanceMap[name].Present++;
          if (record.status === 'A') attendanceMap[name].Absent++;
        });
        const allStudents = Object.entries(attendanceMap).map(([name, data]) => ({ name, ...data }));
        setTopAttendees([...allStudents].sort((a, b) => b.Present - a.Present).slice(0, 5));
        setTopAbsentees([...allStudents].sort((a, b) => b.Absent - a.Absent).slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please check your API and server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 mt-14 p-4 md:p-8 duration-1000">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] rounded-full bg-purple-500 blur-3xl"></div>
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-200 dark:text-gray-600">Admin Dashboard</h1>
            <p className="text-gray-300 dark:text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <button 
              onClick={goToProfile}
              className="px-4 py-2 bg-sky-600 text-white shadow-md rounded-lg hover:bg-sky-700 transition-colors flex items-center"
            >
              <FiUsers className="mr-2" /> Admin Profile
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className="bg-blue-950 dark:bg-blue-50 shadow-md border-l-4 border-blue-500 p-4 mb-6 rounded-md duration-1000">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-200 dark:text-gray-600">{notification}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            title="Total Students" 
            value={studentsCount} 
            icon={<FiUsers className="text-indigo-500 text-2xl" />}
            color="bg-indigo-950 dark:bg-indigo-100"
          />
          <Card 
            title="Total Teachers" 
            value={teachersCount} 
            icon={<FaChalkboardTeacher className="text-purple-500 text-2xl" />}
            color="bg-purple-950 dark:bg-purple-100"
          />
          <Card 
            title="Today's Present" 
            value={presentCount} 
            icon={<FiUserCheck className="text-green-500 text-2xl" />}
            color="bg-green-950 dark:bg-green-100"
          />
          <Card 
            title="Today's Absent" 
            value={absentCount} 
            icon={<FiUserX className="text-red-500 text-2xl" />}
            color="bg-red-950 dark:bg-red-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard 
            title="Today's Attendance Summary"
            chart={
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: presentCount },
                      { name: 'Absent', value: absentCount }
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      color: '#111827'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            }
          />
          
          <ChartCard 
            title="Monthly Attendance Trends"
            chart={
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280" 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    stroke="#6b7280" 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      color: '#111827'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Present" 
                    stroke="#4ade80" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Absent" 
                    stroke="#f87171" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard 
            title="Subject-wise Attendance Breakdown"
            chart={
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectWise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="subject" 
                    stroke="#6b7280" 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    stroke="#6b7280" 
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e5e7eb',
                      borderRadius: '0.5rem',
                      color: '#111827'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Present" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            }
          />
          
          <div className="space-y-6">
            <ListCard 
              title="Top Attendees"
              icon={<FiAward className="text-green-500" />}
              items={topAttendees.map(student => ({
                name: student.name,
                value: `${student.Present} presents`,
                color: 'text-green-600'
              }))}
            />
            
            <ListCard 
              title="Top Absentees"
              icon={<FiAward className="text-red-500" />}
              items={topAbsentees.map(student => ({
                name: student.name,
                value: `${student.Absent} absents`,
                color: 'text-red-600'
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <ChartCard 
            title="Latest Attendance Records"
            chart={
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-md duration-1000">
                  <thead className="bg-sky-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 duration-1000">
                    {latestRecords.map((record, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-800 dark:bg-white duration-1000' : 'bg-gray-800 dark:bg-gray-50 duration-1000'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-700">
                          {record.studentName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {record.subject || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${record.status === 'P' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>

        <div className="rounded-lg shadow-md p-6 mb-8 bg-gray-800 dark:bg-white duration-1000">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-300 dark:text-gray-700">
            <FiBook className="mr-2 text-indigo-500" /> Quick Links
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickLink 
              title="Students" 
              icon={<FiUsers className="text-indigo-500" />} 
              url="/admin/student" 
            />
            <QuickLink 
              title="Teachers" 
              icon={<FaChalkboardTeacher className="text-purple-500" />} 
              url="/admin/teacher" 
            />
            <QuickLink 
              title="Attendance" 
              icon={<FiCalendar className="text-green-500" />} 
              url="/admin/attendance" 
            />
            <QuickLink 
              title="Analytics" 
              icon={<FiClock className="text-blue-500" />} 
              url="/admin/attendance-statistics" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon, color }) => {
  return (
    <div className={`${color} p-6 rounded-lg shadow-sm  border border-gray-100 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-200 dark:text-gray-700">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-300 dark:text-gray-700">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-gray-800 dark:bg-white duration-1000">
          {icon}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, chart }) => {
  return (
    <div className="rounded-lg shadow-md p-6 bg-gray-800 dark:bg-white duration-1000">
      <h2 className="text-xl font-semibold mb-4 text-gray-300 dark:text-gray-700">{title}</h2>
      {chart}
    </div>
  );
};

const ListCard = ({ title, icon, items }) => {
  return (
    <div className="rounded-lg shadow-md p-6 bg-gray-800 dark:bg-white duration-1000">
      <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-300 dark:text-gray-700">
        {icon} <span className="ml-2">{title}</span>
      </h2>
      <ul className="divide-y divide-gray-200">
        {items.map((item, index) => (
          <li key={index} className="py-3 flex justify-between items-center">
            <span className="font-medium text-gray-200 dark:text-gray-700">{item.name}</span>
            <span className={`${item.color} text-sm font-semibold`}>{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const QuickLink = ({ title, icon, url }) => (
  <a 
    href={url} 
    className="group flex flex-col items-center p-4 rounded-lg no-underline transition-colors hover:bg-gray-700 hover:dark:bg-gray-100" 
  >
    <div className="p-3 rounded-full mb-2 transition-colors bg-gray-900 dark:bg-gray-100 duration-1000">
      {icon}
    </div>
    <span className="text-sm font-medium transition-colors text-gray-300 dark:text-gray-700 ">
      {title}
    </span>
  </a>
);

export default AdminDashboard;