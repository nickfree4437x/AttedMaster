import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  FiUser, FiMail, FiHash, FiPhone, FiBook, FiLock,
  FiCalendar, FiCheckCircle, FiXCircle, FiTrendingUp,
  FiAlertTriangle, FiClock, FiFilter, FiChevronDown, FiLink, 
  FiClipboard, FiDollarSign,  FiUsers, FiAward 
} from 'react-icons/fi';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [quickLinks] = useState([
    { icon: <FiCalendar />, name: "Timetable", url: "#" },
    { icon: <FiBook />, name: "Study Material", url: "#" },
    { icon: <FiClipboard />, name: "Exam Schedule", url: "#" },
    { icon: <FiDollarSign />, name: "Fee Payment", url: "#" },
    { icon: <FiUsers />, name: "Faculty Contacts", url: "#" },
    { icon: <FiAward />, name: "Scholarships", url: "#" },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('studentToken');
      if (!token) {
        setError('Authentication token is missing');
        setLoading(false);
        return;
      }

      try {
        const [profileResponse, attendanceResponse] = await Promise.all([
          axios.get('https://attendmaster.onrender.com/api/students/profile', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://attendmaster.onrender.com/api/students/my-attendance', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setProfile(profileResponse.data);
        const attendanceData = attendanceResponse.data.attendance || [];
        setAttendance(attendanceData);
        setFilteredAttendance(attendanceData.slice(0, 5));
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubjectFilter = (subject) => {
    setSelectedSubject(subject);
    if (subject === 'All') {
      setFilteredAttendance(attendance.slice(0, 5));
    } else {
      const filtered = attendance
        .filter((record) => record.subject === subject)
        .slice(0, 5);
      setFilteredAttendance(filtered);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const showPasswordChangeDialog = () => {
    Swal.fire({
      title: 'Change Password',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Current Password" type="password">' +
        '<input id="swal-input2" class="swal2-input" placeholder="New Password" type="password">' +
        '<input id="swal-input3" class="swal2-input" placeholder="Confirm New Password" type="password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return {
          oldPassword: document.getElementById('swal-input1').value,
          newPassword: document.getElementById('swal-input2').value,
          confirmPassword: document.getElementById('swal-input3').value
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { oldPassword, newPassword, confirmPassword } = result.value;
        
        if (!oldPassword || !newPassword || !confirmPassword) {
          Swal.fire('Error', 'All fields are required', 'error');
          return;
        }

        if (newPassword !== confirmPassword) {
          Swal.fire('Error', 'Passwords do not match', 'error');
          return;
        }

        try {
          const token = localStorage.getItem('studentToken');
          const res = await axios.put(
            'https://attendmaster.onrender.com/api/students/update-password',
            { oldPassword, newPassword, confirmPassword },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          Swal.fire('Success', res.data.message || 'Password updated successfully', 'success');
        } catch (error) {
          Swal.fire('Error', error.response?.data?.message || 'Failed to update password', 'error');
        }
      }
    });
  };

  const QuickStats = ({ attendanceData }) => {
    const totalClasses = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status === 'P').length;
    const overallAttendance = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
    
    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const thisMonthData = attendanceData.filter(a => 
      new Date(a.date).getMonth() === new Date().getMonth()
    );
    const thisMonthAttendance = thisMonthData.length > 0 
      ? ((thisMonthData.filter(a => a.status === 'P').length / thisMonthData.length) * 100).toFixed(1) 
      : 0;

    const today = new Date();
    const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
    const thisWeekClasses = attendanceData.filter(a => {
      const classDate = new Date(a.date);
      return classDate >= firstDayOfWeek && classDate <= lastDayOfWeek;
    }).length;

    return (
      <div className="bg-gray-800 dark:bg-gray-50 rounded-xl shadow-md overflow-hidden mb-8 duration-1000">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 flex items-center gap-2">
            <FiTrendingUp className="text-sky-600" />
            Quick Stats
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          <div className="bg-gray-700 dark:bg-blue-50 p-4 rounded-lg duration-1000">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 dark:text-gray-600">Overall Attendance</p>
                <p className="text-2xl font-bold text-sky-600">
                  {overallAttendance}%
                </p>
              </div>
              <div className="bg-blue-950 dark:bg-blue-100 p-3 rounded-full duration-1000">
                <FiCheckCircle className="text-blue-600 text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
              {presentCount}/{totalClasses} classes attended
            </p>
          </div>

          <div className="bg-gray-700 dark:bg-green-50 p-4 rounded-lg duration-1000">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 dark:text-gray-600">This Month ({currentMonth})</p>
                <p className="text-2xl font-bold text-green-600">
                  {thisMonthAttendance}%
                </p>
              </div>
              <div className="bg-green-950 dark:bg-green-100 p-3 rounded-full duration-1000">
                <FiCalendar className="text-green-600 text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
              {thisMonthData.filter(a => a.status === 'P').length}/{thisMonthData.length} classes
            </p>
          </div>

          <div className="bg-gray-700 dark:bg-red-50 p-4 rounded-lg duration-1000">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 dark:text-gray-600">Total Absences</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalClasses - presentCount}
                </p>
              </div>
              <div className="bg-red-950 dark:bg-red-100 p-3 rounded-full duration-1000">
                <FiXCircle className="text-red-600 text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
              {totalClasses > 0 ? ((totalClasses - presentCount) / totalClasses * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-gray-700 dark:bg-purple-50 p-4 rounded-lg duration-1000">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 dark:text-gray-600">Classes This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {thisWeekClasses}
                </p>
              </div>
              <div className="bg-gray-950 dark:bg-purple-100 p-3 rounded-full duration-1000">
                <FiCalendar className="text-purple-600 text-xl" />
              </div>
            </div>
            <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">
              {firstDayOfWeek.toLocaleDateString()} to {lastDayOfWeek.toLocaleDateString()}
            </p>
          </div>
        </div>

        {overallAttendance < 75 && totalClasses > 0 && (
          <div className="bg-gray-700 dark:bg-yellow-50 border-t border-yellow-800 dark:border-yellow-200 p-4 text-center duration-1000">
            <p className="text-yellow-500 font-medium flex items-center justify-center gap-2">
              <FiAlertTriangle className="text-yellow-600" />
              Your attendance is below 75%. Please improve your attendance.
            </p>
          </div>
        )}
      </div>
    );
  };

  const RecentAttendance = ({ attendanceData, subjects }) => {
    return (
      <div className="bg-gray-700 dark:bg-green-50 rounded-xl shadow-md overflow-hidden mb-8 duration-1000">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-300 dark:text-gray-600 flex items-center gap-2">
            <FiClock className="text-blue-600" /> Recent Attendance
          </h2>
          
          <div className="relative">
            <select
              onChange={(e) => handleSubjectFilter(e.target.value)}
              className="appearance-none bg-gray-700 dark:bg-gray-100 border border-gray-300 text-gray-300 dark:text-gray-600 rounded-lg px-4 py-2 pr-8 focus:outline-none duration-1000"
            >
              <option value="All">All Subjects</option>
              {subjects?.map((subject, index) => (
                <option key={index} value={subject}>{subject}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-300 dark:text-gray-600  pointer-events-none" />
          </div>
        </div>

        <div className="p-6">
          {attendanceData.length === 0 ? (
            <p className="text-gray-300 dark:text-gray-600  text-center py-4">No attendance records found.</p>
          ) : (
            <div className="space-y-4">
              {attendanceData.map((record, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg text-gray-300 dark:text-gray-600  border-l-4 duration-1000 ${
                    record.status === 'P'
                      ? 'border-green-500 bg-green-950 dark:bg-green-100'
                      : 'border-red-500 bg-red-950 dark:bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{record.subject}</h3>
                      <p className="text-sm text-gray-300 dark:text-gray-600 ">
                        {formatDate(record.date)} • {record.time}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        record.status === 'P'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {record.status === 'P' ? (
                        <span className="flex items-center gap-1">
                          <FiCheckCircle /> Present
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <FiXCircle /> Absent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const QuickLinks = () => {
    return (
      <div className="bg-gray-800 dark:bg-white p-4 rounded-lg shadow-md mb-8 duration-1000">
        <h3 className="text-lg font-semibold text-gray-300 dark:text-gray-600  mb-4 flex items-center gap-2">
          <FiLink className="text-sky-600" /> Quick Links
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className="flex items-center no-underline gap-2 p-2 hover:bg-blue-50 rounded transition"
            >
              <span className="text-blue-600">{link.icon}</span>
              <span>{link.name}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-900 dark:from-blue-50 dark:to-gray-100 py-8 px-4 sm:px-6 lg:px-8 duration-1000">
      <div className="max-w-6xl mx-auto">
        {/* Student Profile Section - Now at the Top */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden mb-8 duration-1000">
          <div className="bg-gradient-to-r from-sky-600 to-indigo-400 p-6 text-white duration-1000">
            <h1 className="text-2xl sm:text-3xl font-bold">Student Profile</h1>
            <p className="opacity-90">Your academic information and settings</p>
          </div>
          
          <div className="p-6 md:p-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-200 dark:text-gray-600 border-b pb-2">Personal Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <FiUser className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <FiMail className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <FiHash className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Roll Number</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.rollNo}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-4">
                    <FiPhone className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-200 dark:text-gray-600 border-b pb-2">Academic Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-4">
                    <FiBook className="text-indigo-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Course</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.course}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-4">
                    <FiBook className="text-indigo-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Current Semester</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{profile?.semester}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-full mr-4">
                    <FiBook className="text-indigo-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">Enrolled Subjects</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile?.subjects?.map((subject, index) => (
                        <span key={index} className="bg-gray-700 dark:bg-indigo-50 text-gray-300 dark:text-gray-600 px-3 py-1 rounded-full text-sm">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={showPasswordChangeDialog}
                  className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg transition-all hover:shadow-lg w-full"
                >
                  <FiLock className="text-lg" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats and Recent Attendance Below */}
        <QuickStats attendanceData={attendance} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentAttendance
              attendanceData={filteredAttendance}
              subjects={profile?.subjects}
            />
          </div>
          <div>
            <QuickLinks />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
