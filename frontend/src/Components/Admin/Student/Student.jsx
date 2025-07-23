import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiUser, FiTrash2, FiPlus, FiDownload, FiFileText, FiCheckCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Papa from 'papaparse';

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    phone: "",
    semester: "",
    course: "",
    subjects: [],
  });

  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [includePassword, setIncludePassword] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [coursesRes, subjectsRes, studentsRes] = await Promise.all([
        axios.get("https://attendmaster.onrender.com/api/courses/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://attendmaster.onrender.com/api/subject/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://attendmaster.onrender.com/api/students/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCourses(coursesRes.data);
      setSubjects(subjectsRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      showAlert("Error", "Failed to load data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      background: "#1f2937",
      color: "#fff",
      confirmButtonColor: "#3b82f6",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, subjects: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post(
        "http://localhost:5000/api/students/add", 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { studentId, password } = res.data;
      showAlert(
        "Student Added!", 
        `Student ID: ${studentId}\nPassword: ${password}`, 
        "success"
      );
      fetchInitialData();
      resetForm();
      setCurrentPage(1); // Reset to first page when adding new student
    } catch (err) {
      console.error("Error saving student:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong";
      showAlert("Error", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (student) => {
    Swal.fire({
      title: "Edit Student",
      background: "#1f2937",
      color: "#fff",
      html: `
        <input id="swal-name" class="swal2-input dark:bg-gray-700 dark:text-white" placeholder="Name" value="${student.name}" />
        <input id="swal-email" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Email" value="${student.email}" />
        <input id="swal-roll" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Roll No" value="${student.rollNo}" />
        <input id="swal-phone" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Phone" value="${student.phone}" />
        <input id="swal-semester" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Semester" value="${student.semester}" />
        <input id="swal-course" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Course" value="${student.course}" />
        <input id="swal-subjects" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" placeholder="Subjects (comma-separated)" value="${student.subjects.join(', ')}" />
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Update",
      preConfirm: async () => {
        const updatedData = {
          name: document.getElementById("swal-name").value,
          email: document.getElementById("swal-email").value,
          rollNo: document.getElementById("swal-roll").value,
          phone: document.getElementById("swal-phone").value,
          semester: document.getElementById("swal-semester").value,
          course: document.getElementById("swal-course").value,
          subjects: document.getElementById("swal-subjects").value.split(',').map(s => s.trim()),
        };

        try {
          await axios.put(
            `https://attendmaster.onrender.com/api/students/${student._id}`, 
            updatedData, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          showAlert("Updated!", "Student information has been updated.", "success");
          fetchInitialData();
        } catch (error) {
          console.error("Error updating student:", error);
          throw error;
        }
      },
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the student.",
      icon: "warning",
      background: "#1f2937",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://attendmaster.onrender.com/api/students/${id}`, 
            { headers: { Authorization: `Bearer ${token}` } }
          );
          showAlert("Deleted!", "Student has been deleted.", "success");
          fetchInitialData();
          // If last item on page is deleted, go to previous page
          if (students.length % recordsPerPage === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
        } catch (err) {
          console.error("Error deleting student:", err);
          showAlert("Error", "Failed to delete student.", "error");
        }
      }
    });
  };

  const handleExportCredentials = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("Error", "Please login again", "error");
      return;
    }

    setExportLoading(true);
    try {
      const response = await axios.get(
        "https://attendmaster.onrender.com/api/students/credentials",
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Handle the response data
      console.log("Export response:", response.data);
      
      // Convert to CSV if needed
      if (exportFormat === 'csv') {
        const csvData = convertToCSV(response.data);
        downloadFile(csvData, 'students.csv', 'text/csv');
      } else {
        downloadFile(
          JSON.stringify(response.data, null, 2),
          'students.json',
          'application/json'
        );
      }

      setExportSuccess(true);
    } catch (error) {
      console.error("Export error:", error.response?.data || error.message);
      showAlert(
        "Export Failed", 
        error.response?.data?.message || "Could not export credentials", 
        "error"
      );
    } finally {
      setExportLoading(false);
    }
  };

  // Helper functions
  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      rollNo: "",
      phone: "",
      semester: "",
      course: "",
      subjects: [],
    });
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = students.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(students.length / recordsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mt-8 text-sky-600 dark:text-sky-600">
            Student Management
          </h1>
          <p className="mt-3 text-lg text-gray-300 dark:text-gray-600">
            Add and manage student records
          </p>
        </div>

        {/* Add Student Card */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md p-6 mb-6 max-w-2xl mx-auto border border-gray-700 dark:border-gray-200 transition-colors duration-1000">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white mr-3">
              <FiUser className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300 dark:text-gray-600">
              Add New Student
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                  className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                  className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Roll No */}
            <div>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="Enter Roll No."
                className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Phone Number"
                  className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-500 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Semester */}
            <div>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                required
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Course */}
            <div>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.courseName}>{c.courseName}</option>
                ))}
              </select>
            </div>

            {/* Subjects */}
            <div className="md:col-span-2">
              <select
                multiple
                name="subjects"
                value={formData.subjects}
                onChange={handleSubjectChange}
                className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                required
              >
                {subjects.map((s) => (
                  <option key={s._id} value={s.subjectName}>{s.subjectName}</option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Hold Ctrl/Cmd to select multiple</p>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full mt-4 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" /> Add Student
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Export Credentials Section */}
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 mb-6 border border-gray-700/50 backdrop-blur-sm duration-1000">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-300 dark:text-gray-700 flex items-center gap-2 mb-1">
                <FiFileText className="text-blue-400" />
                Export Student Credentials
              </h3>
              <p className="text-gray-300 dark:text-gray-600 text-sm">
                Download all student credentials in your preferred format
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-3 bg-gray-800/50 dark:bg-gray-300 p-3 rounded-lg duration-1000">
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={includePassword}
                    onChange={() => setIncludePassword(!includePassword)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-700 dark:bg-gray-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 duration-1000"></div>
                  <span className="ml-2 text-sm font-medium text-gray-300 dark:text-gray-700 ">
                    Include Passwords
                  </span>
                </label>

                <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`px-3 py-1 text-sm ${exportFormat === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`px-3 py-1 text-sm ${exportFormat === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              <button
                onClick={handleExportCredentials}
                disabled={exportLoading || students.length === 0}
                className={`relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-all
                  ${exportLoading 
                    ? 'bg-blue-700/50 text-white/80' 
                    : exportSuccess
                      ? 'bg-green-600/90 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/20'
                  }`}
              >
                {exportSuccess ? (
                  <>
                    <FiCheckCircle className="text-lg" />
                    <span>Exported!</span>
                  </>
                ) : exportLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FiDownload className="text-lg" />
                    <span>Export {exportFormat.toUpperCase()}</span>
                  </>
                )}
                
                {exportLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
                )}
              </button>
            </div>
          </div>

          {exportSuccess && (
            <div className="mt-4 bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 animate-fade-in">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <FiCheckCircle />
                <span className="font-medium">Export successful!</span>
              </div>
              <p className="text-gray-300 text-sm">
                File downloaded to your default downloads folder. 
                <span className="block mt-1 text-gray-400">
                  Format: {exportFormat.toUpperCase()} • Includes: {includePassword ? 'With passwords' : 'Without passwords'}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-1000">
          <div className="px-6 py-4 justify-center border-b border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-300 flex items-center duration-1000">
            <FiUser className="w-5 h-5 text-sky-600 dark:text-sky-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-300 dark:text-gray-600">
              Student Records
            </h3>
          </div>
          
          {/* Records per page selector */}
          <div className="px-6 py-3 flex justify-between items-center bg-gray-700/50 dark:bg-gray-200/50">
            <div className="flex items-center">
              <span className="text-sm text-gray-300 dark:text-gray-600 mr-2">Show</span>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing page size
                }}
                className="bg-gray-800 dark:bg-white border border-gray-600 dark:border-gray-400 text-gray-300 dark:text-gray-700 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block px-2.5 py-1.5"
              >
                {[5, 10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-sm text-gray-300 dark:text-gray-600 ml-2">entries</span>
            </div>
            <div className="text-sm text-gray-300 dark:text-gray-600">
              Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, students.length)} of {students.length} entries
            </div>
          </div>
          
          {isLoading && students.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-300 dark:text-gray-600">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center bg-gray-700 dark:bg-gray-50 duration-1000">
              <p className="text-gray-300 dark:text-gray-600 ">No students found. Add your first student above!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-sky-600 dark:bg-sky-600">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                        S. NO.
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                        Roll No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 dark:divide-gray-700 duration-1000">
                    {currentRecords.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200 dark:text-gray-700">
                          {indexOfFirstRecord + index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {student.rollNo}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 rounded-lg hover:bg-blue-900/20 dark:hover:bg-blue-50 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                              disabled={isLoading}
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="p-2 rounded-lg hover:bg-red-900/20 dark:hover:bg-red-50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                              disabled={isLoading}
                              title="Delete"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-700 dark:border-gray-300 bg-gray-700/50 dark:bg-gray-200/50">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-500 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-600">
                      Showing <span className="font-medium">{indexOfFirstRecord + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastRecord, students.length)}</span> of{' '}
                      <span className="font-medium">{students.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                          currentPage === 1
                            ? 'border-gray-600 dark:border-gray-400 bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'border-gray-400 dark:border-gray-500 bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === number
                              ? 'border-sky-500 bg-sky-600 text-white'
                              : 'border-gray-400 dark:border-gray-500 bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                          currentPage === totalPages
                            ? 'border-gray-600 dark:border-gray-400 bg-gray-600 dark:bg-gray-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'border-gray-400 dark:border-gray-500 bg-gray-800 dark:bg-white text-gray-300 dark:text-gray-700 hover:bg-gray-700 dark:hover:bg-gray-100'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
