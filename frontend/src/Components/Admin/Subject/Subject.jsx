import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiPlus, FiBook } from "react-icons/fi";
import { BookOpen } from "lucide-react";

const AddSubjectForm = () => {
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchCourses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/courses/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses", err);
      showAlert("Error", "Failed to load courses", "error");
    }
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/subject/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(res.data);
    } catch (err) {
      console.error("Failed to load subjects", err);
      showAlert("Error", "Failed to load subjects", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchSubjects();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course || !subject) {
      showAlert("Warning", "Please fill all fields", "warning");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(
        "http://localhost:5000/api/subject/add",
        { course, subjectName: subject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("Success", "Subject added successfully!", "success");
      setCourse("");
      setSubject("");
      await fetchSubjects();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to add subject";
      showAlert("Error", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      background: "#1f2937",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/subject/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert("Deleted!", "Subject has been deleted.", "success");
      await fetchSubjects();
    } catch (error) {
      console.error("Delete Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to delete subject";
      showAlert("Error", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (sub) => {
    const result = await Swal.fire({
      title: "Edit Subject",
      background: "#1f2937",
      color: "#fff",
      html: `
        <select id="swal-input1" class="swal2-select dark:bg-gray-700 dark:text-white">
          ${courses.map(c => 
            `<option value="${c.courseName}" ${c.courseName === sub.course ? 'selected' : ''}>
              ${c.courseName}
            </option>`
          ).join('')}
        </select>
        <input id="swal-input2" class="swal2-input dark:bg-gray-700 dark:text-white mt-3" value="${sub.subjectName}">
      `,
      focusConfirm: false,
      preConfirm: () => {
        const courseSelect = document.getElementById("swal-input1");
        return {
          course: courseSelect.value,
          subjectName: document.getElementById("swal-input2").value
        };
      },
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setIsLoading(true);
      await axios.put(
        `http://localhost:5000/api/subject/update/${sub._id}`,
        result.value,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showAlert("Updated!", "Subject updated successfully.", "success");
      await fetchSubjects();
    } catch (error) {
      console.error("Update Error:", error);
      const errorMsg = error.response?.data?.message || "Failed to update subject";
      showAlert("Error", errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mt-8 font-extrabold text-sky-600 dark:text-sky-600">
            Subject Management
          </h1>
          <p className="mt-3 text-lg text-gray-300 dark:text-gray-600">
            Add and manage subjects for your courses
          </p>
        </div>

        {/* Add Subject Card */}
        <div className="bg-gray-800 dark:bg-white rounded-xl shadow-md p-6 mb-12 max-w-md mx-auto border border-gray-200 dark:border-gray-700 transition-colors duration-1000">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white mr-3">
              <FiBook className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-300 dark:text-gray-600">
              Add New Subject
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <select
                className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c.courseName}>
                    {c.courseName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="e.g. Advanced JavaScript"
                className="w-full px-4 py-2.5 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 bg-transparent focus:outline-none rounded-lg border border-gray-300 dark:border-gray-600 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-400"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <FiPlus className="mr-2" /> Add Subject
                </>
              )}
            </button>
          </form>
        </div>

        {/* Subjects Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-1000">
          <div className="px-6 py-4 border-b border-gray-800 dark:border-gray-200 bg-gray-800 dark:bg-gray-300 duration-1000">
            <h3 className="text-xl justify-center font-bold text-gray-300 dark:text-gray-600 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Subjects List
            </h3>
          </div>
          
          {isLoading && subjects.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-3 text-gray-300 dark:text-gray-600">Loading subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="p-8 text-center bg-gray-700 dark:bg-gray-50 duration-1000">
              <p className="text-gray-300 dark:text-gray-600">No subjects found. Add your first subject above!</p>
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
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-white dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-200 dark:divide-gray-700 duration-1000">
                  {subjects.map((sub, index) => (
                    <tr key={sub._id} className="hover:bg-gray-800/50 dark:hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-300 dark:text-gray-600">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-100 text-gray-200 dark:text-gray-600 text-xs font-medium duration-1000">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">
                        {sub.course}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 dark:text-gray-600">
                        {sub.subjectName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(sub)}
                            className="p-2 rounded-lg hover:bg-blue-900/20 dark:hover:bg-blue-50 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                            disabled={isLoading}
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(sub._id)}
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
      </div>
    </div>
  );
};

export default AddSubjectForm;