import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiBook, FiCalendar, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { FaChalkboardTeacher } from 'react-icons/fa';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters] = useState(['1', '2', '3', '4', '5', '6', '7', '8']);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today;
  });
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem('teacherToken');
  const teacherData = JSON.parse(localStorage.getItem('teacherData')) || { teacherId: '', userid: '' };
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [courseRes, subjectRes] = await Promise.all([
          axios.get('http://localhost:5000/api/teachers/courses', { headers }),
          axios.get('http://localhost:5000/api/teachers/subjects', { headers }),
        ]);
        setCourses(courseRes.data);
        setSubjects(subjectRes.data);
      } catch (error) {
        showAlert('Error', 'Failed to fetch courses or subjects', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#4f46e5',
    });
  };

  const handleFetchStudents = async () => {
    if (!selectedCourse || !selectedSubject || !selectedSemester || !selectedDate) {
      return showAlert('Missing Fields', 'Please select all dropdown options', 'warning');
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/teachers/students',
        {
          course: selectedCourse,
          semester: selectedSemester,
          subject: selectedSubject,
        },
        { headers }
      );
      setStudents(response.data.map(student => ({ ...student, status: '' }))); // Initialize with empty status
    } catch (error) {
      if (error.response?.status === 404) {
        showAlert('No Students Found', error.response.data.message, 'info');
      } else {
        showAlert('Error', error.response?.data?.message || 'Something went wrong', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student._id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    const attendanceMarked = students.some(student => student.status !== '');
    if (!attendanceMarked) {
      return showAlert('Error', 'You must mark attendance for at least one student', 'error');
    }
  
    const attendanceData = students
      .filter(student => student.status)
      .map(student => ({
        studentId: student._id,
        name: student.name,
        rollNo: student.rollNo,
        status: student.status,
      }));
  
    if (!teacherData.teacherId || !teacherData.userid) {
      return showAlert('Error', 'Teacher data is not available. Please log in again.', 'error');
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/teachers/mark-attendance',
        {
          course: selectedCourse,
          subject: selectedSubject,
          date: selectedDate,
          attendance: attendanceData,
          teacherId: teacherData.teacherId,
          userid: teacherData.userid,
        },
        { headers }
      );
      showAlert('Success', response.data.message, 'success');
    } catch (error) {
      console.error("Error submitting attendance:", error.response?.data || error.message);
      showAlert('Error', error.response?.data?.message || 'Failed to mark attendance', 'error');
    }
  };  

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 p-4 md:p-8 duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mt-16 text-sky-600 dark:text-sky-600 flex items-center">
               Teacher Dashboard
            </h1>
            <p className="text-gray-300 dark:text-gray-600">Manage your class attendance efficiently</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="rounded-lg shadow-md p-6 mb-8 bg-gray-800 dark:bg-white duration-1000">
          <h2 className="text-xl font-semibold justify-center mb-4 text-gray-300 dark:text-gray-600 flex items-center">
            <FiCalendar className="mr-2 text-indigo-500" /> Attendance Filters
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
              >
                <option value="">-- Select Course --</option>
                {courses.map((course, idx) => (
                  <option key={idx} value={course.courseName}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>    

            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
              >
                <option value="">-- Select Subject --</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject.subjectName}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
              >
                <option value="">-- Select Semester --</option>
                {semesters.map((sem, idx) => (
                  <option key={idx} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
              />
            </div>
          </div>

          <button
            onClick={handleFetchStudents}
            className={`flex items-center justify-center w-full text-center px-4 py-2 rounded-md transition-colors ${
              isLoading ? 'bg-sky-600' : 'bg-sky-600 hover:bg-sky-700'
            } text-white`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <FiUsers className="mr-2" /> Fetch Students
              </>
            )}
          </button>
        </div>

        {/* Attendance Table */}
        {students.length > 0 && (
          <div className="rounded-lg shadow-md p-6 mb-8 bg-gray-800 dark:bg-white duration-1000">
            <h2 className="text-xl font-semibold justify-center mb-4 text-gray-300 dark:text-gray-600 flex items-center">
              <FiBook className="mr-2 text-indigo-500" /> Student Attendance
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-sky-600 dark:bg-sky-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white dark:text-white">
                      S.No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white dark:text-white">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white dark:text-white">
                      Roll No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white dark:text-white">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 duration-1000">
                  {students.map((student, idx) => (
                    <tr key={student._id} className={idx % 2 === 0 ? 'bg-gray-800 dark:bg-white duration-1000' : 'bg-gray-700 dark:bg-gray-50 duration-1000'}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700 text-center">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {student.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {student.rollNo}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAttendanceChange(student._id, 'P')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              student.status === 'P' 
                                ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                                : 'bg-green-900/20 dark:bg-green-100 text-green-300 dark:text-green-600 hover:bg-green-800/50 dark:hover:bg-green-200'
                            }`}
                            title="Mark Present"
                          >
                            <span className="font-bold">P</span>
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(student._id, 'A')}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              student.status === 'A' 
                                ? 'bg-red-500 text-white shadow-lg transform scale-105' 
                                : 'bg-red-900/20 dark:bg-red-100 text-red-300 dark:text-red-600 hover:bg-red-800/50 dark:hover:bg-red-200'
                            }`}
                            title="Mark Absent"
                          >
                            <span className="font-bold">A</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={handleSubmitAttendance}
                className="flex w-full items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FiCheckCircle className="mr-2" /> Submit Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;