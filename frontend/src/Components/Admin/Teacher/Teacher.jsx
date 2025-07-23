import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiUserPlus, FiUser, FiMail, FiPhone, FiAward } from "react-icons/fi";

const TeacherForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    phone: "",
    semester: "",
    courses: [],
    subjects: [],
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [teacherToEdit, setTeacherToEdit] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [courseRes, subjectRes] = await Promise.all([
        axios.get("https://attendmaster.onrender.com/api/courses/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("https://attendmaster.onrender.com/api/subject/get", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setCourseOptions(courseRes.data);
      setSubjectOptions(subjectRes.data);
    } catch (error) {
      console.error("Dropdown fetch error:", error);
      showAlert("Error", "Failed to load dropdown data", "error");
    }
  };

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://attendmaster.onrender.com/api/teacher/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeacherList(res.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showAlert("Error", "Failed to load teachers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
    fetchTeachers();
  }, []);

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

const saveToFile = (content) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `teacher_${new Date().toISOString().slice(0,10)}_${formData.name.replace(/\s+/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};  

const generateCredentialsContent = (responseData, formData) => {
  // Format courses and subjects
  const coursesList = formData.courses.join(", ");
  const subjectsList = formData.subjects.join(", ");
  
  return `
TEACHER CREDENTIALS
==================
Teacher ID: ${responseData.teacherId}
Password: ${responseData.password}

DETAILS
=======
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Designation: ${formData.designation}
Semester: ${formData.semester}

COURSES
=======
${coursesList}

SUBJECTS
========
${subjectsList}

Generated on: ${new Date().toLocaleString()}
`;
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const response = await axios.post(
      "https://attendmaster.onrender.com/api/teacher/add", 
      formData, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 201) {
      // Generate file content
      const fileContent = generateCredentialsContent(response.data, formData);
      
      // Show alert
      showAlert(
        "Teacher Added!", 
        `Teacher ID: ${response.data.teacherId}\nPassword: ${response.data.password}\n\nCredentials file will be downloaded automatically`, 
        "success"
      );
      
      // Save to file
      saveToFile(fileContent);
      
      // Reset form and refresh list
      fetchTeachers();
      setFormData({
        name: "",
        designation: "",
        email: "",
        phone: "",
        semester: "",
        courses: [],
        subjects: [],
      });
    }
  } catch (error) {
    console.error("Error adding teacher:", error);
    const errorMsg = error.response?.data?.message || "Something went wrong while adding teacher!";
    showAlert("Error", errorMsg, "error");
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e, field) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, [field]: selectedOptions }));
  };

  const handleDelete = (teacherId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
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
          const token = localStorage.getItem("token");
          await axios.delete(
            `https://attendmaster.onrender.com/api/teacher/delete/${teacherId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          showAlert("Deleted!", "Teacher has been deleted.", "success");
          fetchTeachers();
        } catch (error) {
          console.error("Error deleting teacher:", error);
          showAlert("Error", "Failed to delete teacher", "error");
        }
      }
    });
  };

  const handleEdit = (teacher) => {
  const token = localStorage.getItem("token");
  
  Swal.fire({
    title: "Edit Teacher",
    background: "#1f2937",
    color: "#fff",
    html: `
      <input 
        id="swal-name" 
        class="swal2-input dark:bg-gray-700 dark:text-white" 
        placeholder="Name" value="${teacher.name}" 
      />
      <input 
        id="swal-email" 
        class="swal2-input dark:bg-gray-700 dark:text-white mt-3" 
        placeholder="Email" value="${teacher.email}" 
      />
      <input 
        id="swal-designation" 
        class="swal2-input dark:bg-gray-700 dark:text-white mt-3" 
        placeholder="Designation" value="${teacher.designation}" 
      />
      <input 
        id="swal-phone" 
        class="swal2-input dark:bg-gray-700 dark:text-white mt-3" 
        placeholder="Phone" value="${teacher.phone}" 
      />
      <select 
       id="swal-semester" 
       class="swal2-input bg-gray-700 dark:bg-gray-700 text-white mt-3 w-full">
        ${[...Array(8)].map((_, i) => 
          `<option value="Semester ${i+1}" ${teacher.semester === `Semester ${i+1}` ? 'selected' : ''}>
            Semester ${i+1}
          </option>`
        ).join('')}
      </select>
      <select 
       id="swal-courses" 
       class="swal2-input bg-gray-700 dark:bg-gray-700 text-white mt-3 w-full" multiple>
        ${courseOptions.map(course => 
          `<option value="${course.courseName}" ${teacher.courses.includes(course.courseName) ? 'selected' : ''}>
            ${course.courseName}
          </option>`
        ).join('')}
      </select>
      <select 
       id="swal-subjects" 
       class="swal2-input bg-gray-700 dark:bg-gray-700 text-white mt-3 w-full" multiple>
        ${subjectOptions.map(subject => 
          `<option value="${subject.subjectName}" ${teacher.subjects.includes(subject.subjectName) ? 'selected' : ''}>
            ${subject.subjectName}
          </option>`
        ).join('')}
      </select>
      <p class="text-xs text-gray-300 mt-1">Hold Ctrl/Cmd to select multiple courses/subjects</p>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Update",
    preConfirm: async () => {
      const coursesSelect = document.getElementById("swal-courses");
      const subjectsSelect = document.getElementById("swal-subjects");
      
      const updatedData = {
        name: document.getElementById("swal-name").value,
        email: document.getElementById("swal-email").value,
        designation: document.getElementById("swal-designation").value,
        phone: document.getElementById("swal-phone").value,
        semester: document.getElementById("swal-semester").value,
        courses: Array.from(coursesSelect.selectedOptions).map(opt => opt.value),
        subjects: Array.from(subjectsSelect.selectedOptions).map(opt => opt.value),
      };

      try {
        await axios.put(
          `https://attendmaster.onrender.com/api/teacher/update/${teacher._id}`, 
          updatedData, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showAlert("Updated!", "Teacher information has been updated.", "success");
        fetchTeachers();
      } catch (error) {
        console.error("Error updating teacher:", error);
        showAlert("Error", error.response?.data?.message || "Failed to update teacher", "error");
        throw error;
      }
    },
    didOpen: () => {
      // Add custom styling for multi-select dropdowns
      document.querySelectorAll('.swal2-input[multiple]').forEach(el => {
        el.style.height = 'auto';
        el.style.padding = '0.5rem';
      });
    }
  });
};

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mt-8 text-sky-600 dark:text-sky-600">
            Teacher Management
          </h1>
          <p className="mt-3 text-lg text-gray-300 dark:text-gray-600">
            Add and manage faculty members
          </p>
        </div>

        {/* Add Teacher Card */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-sm p-6 mb-12 max-w-4xl mx-auto border border-gray-700 dark:border-gray-200 duration-1000">
          {/* Header */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900/30 dark:bg-blue-100 text-blue-400 dark:text-blue-600 mr-4 duration-1000">
              <FiUserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-300 dark:text-gray-600">Add New Teacher</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Name */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Enter Name"
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
                    className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Enter Email"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Designation */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Enter Designation"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                    placeholder="Enter Phone Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Full Width Fields */}
            <div className="md:col-span-2 space-y-5">
              {/* Semester */}
              <div>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  required
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i} value={`Semester ${i + 1}`}>Semester {i + 1}</option>
                  ))}
                </select>
              </div>

              {/* Courses */}
              <div>
                <select
                  multiple
                  onChange={(e) => handleMultiSelect(e, "courses")}
                  className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                >
                   <option value="" disabled className="text-gray-400 dark:text-gray-400">
                    Select Course
                  </option>
                  {courseOptions.map((course) => (
                    <option key={course._id} value={course.courseName}>{course.courseName}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-300 dark:text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Subjects */}
              <div>
                <select
                  multiple
                  onChange={(e) => handleMultiSelect(e, "subjects")}
                  className="w-full px-4 py-3 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                >
                   <option value="" disabled className="text-gray-400 dark:text-gray-400">
                    Select Subjects
                  </option>
                  {subjectOptions.map((subject) => (
                    <option key={subject._id} value={subject.subjectName}>{subject.subjectName}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-300 dark:text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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
                    <FiUserPlus className="mr-2" /> Add Teacher
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Teachers Table */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-1000">
          <div className="px-6 py-4 border-b border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-300 duration-1000">
          <h3 className="text-xl font-bold justify-center text-gray-300 dark:text-gray-600 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Faculty Members
          </h3>
        </div>
          
          {isLoading && teacherList.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-300 dark:text-gray-600">Loading teachers...</p>
            </div>
          ) : teacherList.length === 0 ? (
            <div className="p-8 text-center bg-gray-700 dark:bg-gray-50 duration-1000">
              <p className="text-gray-300 dark:text-gray-600">No teachers found. Add your first teacher above!</p>
            </div>
          ) : (
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
                      Designation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Phone
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 dark:divide-gray-700 duration-1000">
                  {teacherList.map((teacher, index) => (
                    <tr key={teacher._id} className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors duration-1000">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-700">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-600 text-xs font-medium duration-1000">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {teacher.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {teacher.designation}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {teacher.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-700">
                        {teacher.phone}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 rounded-lg hover:bg-blue-900/20 dark:hover:bg-blue-50 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                            disabled={isLoading}
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(teacher._id)}
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
          )}
        </div>

        {/* Edit Modal */}        
      </div>
    </div>
  );
};

export default TeacherForm;
