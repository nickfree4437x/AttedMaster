import React, { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, User, Key, Mail, Phone, BookOpen, Layers, Lock } from "lucide-react";
import Swal from "sweetalert2";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherInfo = async () => {
      try {
        const token = localStorage.getItem("teacherToken");
        if (!token) {
          setError("You need to log in.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          'http://localhost:5000/api/teachers/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTeacher(response.data.teacher);
      } catch (error) {
        setError("Error fetching teacher's information.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const token = localStorage.getItem("teacherToken");
      if (!token) {
        setError("You need to log in.");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/teachers/change-password',
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Password changed successfully!',
        timer: 2000,
        showConfirmButton: false,
        background: '#f8fafc',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error updating password.";
      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMsg,
        timer: 2000,
        showConfirmButton: false,
        background: '#f8fafc',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="max-w-md mx-auto p-6 mt-24 text-center">
        <p className="text-red-500">Error loading teacher information.</p>
      </div>
    );
  }

  return (
    <div className=" max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-900 mt-16 dark:bg-gray-50 rounded-xl shadow-md overflow-hidden border border-gray-300 dark:border-gray-600 duration-1000">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-500 p-6 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Account Security</h1>
              <p className="opacity-90 mt-1">Manage your password and account information</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center bg-sky-700/30 px-4 py-2 rounded-full">
              <Lock className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Secure Account</span>
            </div>
          </div>
        </div>

        <div className="md:flex">
          {/* Profile Section */}
          <div className="md:w-1/3 lg:w-2/5 p-6 md:border-r border-gray-300 dark:border-gray-300">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-sky-100 flex items-center justify-center">
                  <User className="text-indigo-600 w-12 h-12" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-300 dark:text-gray-700">{teacher.name}</h2>
                <p className="text-sky-600 font-medium">{teacher.designation}</p>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">{teacher.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-start">
                <div className="bg-sky-100 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Key className="text-sky-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 dark:text-gray-700">Teacher ID</p>
                  <p className="font-medium text-gray-300 dark:text-gray-600">{teacher.teacherId}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-sky-100 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Phone className="text-sky-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 dark:text-gray-700">Phone</p>
                  <p className="font-medium text-gray-300 dark:text-gray-600">{teacher.phone || "Not provided"}</p>
                </div>
              </div>

              {teacher.semester && (
                <div className="flex items-start">
                  <div className="bg-sky-100 p-2 rounded-lg mr-3 flex-shrink-0">
                    <Layers className="text-sky-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-700">Semester</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{teacher.semester}</p>
                  </div>
                </div>
              )}

              {teacher.courses?.length > 0 && (
                <div className="flex items-start">
                  <div className="bg-sky-100 p-2 rounded-lg mr-3 flex-shrink-0">
                    <BookOpen className="text-sky-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 dark:text-gray-700">Courses</p>
                    <p className="font-medium text-gray-300 dark:text-gray-600">{teacher.courses.join(", ")}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="md:w-2/3 lg:w-3/5 p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-300 dark:text-gray-700 flex items-center">
                <Key className="mr-2 text-indigo-600" />
                Change Password
              </h2>
              <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Update your account password</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                    onClick={() => togglePasswordVisibility("current")}
                  >
                    {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                    onClick={() => togglePasswordVisibility("new")}
                  >
                    {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-2">Password must be at least 6 characters long</p>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                    onClick={() => togglePasswordVisibility("confirm")}
                  >
                    {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>

            <div className="mt-8 p-5 dark:bg-sky-50 rounded-lg border border-sky-100 duration-1000">
              <h3 className="font-medium text-sky-600 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
                Password Requirements
              </h3>
              <ul className="text-sm text-sky-600 space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Minimum 6 characters
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Avoid common passwords (like "password123")
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Don't reuse your last 3 passwords
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;