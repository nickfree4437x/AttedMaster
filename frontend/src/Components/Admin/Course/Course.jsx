import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiPlus, FiCheck } from "react-icons/fi";

const CourseForm = () => {
  const [formData, setFormData] = useState({ courseName: "", designation: "" });
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://attendmaster.onrender.com/api/courses/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      Swal.fire({
        title: "Error!",
        text: "Unauthorized access. Please log in.",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/courses/add",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCourses([...courses, res.data.course]);
      Swal.fire({
        title: "Success!",
        text: "Course added successfully!",
        icon: "success",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
      });
      setFormData({ courseName: "", designation: "" });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Unauthorized access!",
        icon: "error",
        background: "#1f2937",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleEdit = async (id) => {
    const courseToEdit = courses.find((course) => course._id === id);
    
    const { value: formValues } = await Swal.fire({
      title: "Edit Course",
      background: "#1f2937",
      color: "#fff",
      html:
        `<input id="swal-input1" class="swal2-input dark:bg-gray-700 dark:text-white" value="${courseToEdit.courseName}" placeholder="Course Name">` +
        `<input id="swal-input2" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" value="${courseToEdit.designation}" placeholder="Duration">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        return {
          courseName: document.getElementById("swal-input1").value,
          designation: document.getElementById("swal-input2").value
        };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(
          `http://localhost:5000/api/courses/${id}`,
          formValues,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCourses(
          courses.map((course) =>
            course._id === id ? { ...course, ...formValues } : course
          )
        );
        Swal.fire({
          title: "Updated!",
          text: "Course updated successfully!",
          icon: "success",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Unauthorized access!",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
          confirmButtonColor: "#3b82f6",
        });
      }
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      background: "#1f2937",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5000/api/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          setCourses(courses.filter((course) => course._id !== id));
          Swal.fire({
            title: "Deleted!",
            text: "Course has been deleted.",
            icon: "success",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#3b82f6",
          });
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "Unauthorized access!",
            icon: "error",
            background: "#1f2937",
            color: "#fff",
            confirmButtonColor: "#3b82f6",
          });
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mt-8 font-extrabold text-sky-600 dark:text-sky-600">
            Course Management
          </h1>
          <p className="mt-3 text-lg text-gray-300 dark:text-gray-600">
            Add, edit, and manage your courses
          </p>
        </div>

        {/* Add Course Card */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md p-6 mb-12 max-w-md mx-auto border border-gray-200 dark:border-gray-700 transition-colors duration-1000">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white mr-3">
              <FiPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 dark:text-gray-600">
              Add New Course
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="courseName"
                placeholder="e.g. Web Development"
                className="w-full px-4 py-2.5 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all placeholder-gray-400 dark:placeholder-gray-400"
                value={formData.courseName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <input
                type="text"
                name="designation"
                placeholder="e.g. 3 months"
                className="w-full px-4 py-2 bg-gray-700 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-600 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center"
            >
              <FiCheck className="mr-2" /> Add Course
            </button>
          </form>
        </div>

        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-1000">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-300 duration-1000">
            <h3 className="text-xl justify-center font-bold text-gray-300 dark:text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Course Catalog
            </h3>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mb-3"></div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Loading courses...</p>
              </div>
            </div>
          ) : 
          
          /* Empty State */
          courses.length === 0 ? (
            <div className="p-8 text-center bg-gray-700 dark:bg-gray-50 duration-1000">
              <div className="inline-flex flex-col items-center">
                <svg className="w-10 h-10 text-gray-200 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-gray-300 dark:text-gray-600 font-medium">No courses found</h4>
                <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Add your first course using the button above</p>
              </div>
            </div>
          ) : 
          
          /* Data Table */
          (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-sky-600 dark:bg-sky-600">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white dark:text-white uppercase tracking-wider">
                      S. No.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white dark:text-white uppercase tracking-wider">
                      Course Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-white dark:text-white uppercase tracking-wider">
                      Duration
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-white dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 dark:divide-gray-800 duration-1000">
                  {courses.map((course, index) => (
                    <tr 
                      key={course._id} 
                      className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Index Column */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-600 text-xs font-medium duration-1000">
                          {index + 1}
                        </span>
                      </td>
                      
                      {/* Course Name Column */}
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300 dark:text-gray-600">
                          {course.courseName}
                        </div>
                        {course.description && (
                          <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">
                            {course.description}
                          </div>
                        )}
                      </td>
                      
                      {/* Duration Column */}
                      <td className="px-4 py-3 text-sm text-gray-300 dark:text-gray-600">
                        {course.designation}
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-1">
                          <button
                            onClick={() => handleEdit(course._id)}
                            className="p-2 rounded-lg hover:bg-blue-900/20 dark:hover:bg-blue-50 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(course._id)}
                            className="p-2 rounded-lg hover:bg-red-900/20 dark:hover:bg-red-50 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
      </div>
    </div>
  );
};

export default CourseForm;
