import { useState } from "react";
import { User, Lock, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";

const StudentLogin = () => {
  const [formData, setFormData] = useState({ StudentId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/api/student-login", formData);

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "Welcome to your Dashboard.",
          timer: 2000,
          showConfirmButton: false,
        });

        localStorage.setItem("studentToken", response.data.token);

        setTimeout(() => {
          navigate("/student/profile");
        }, 2000);
      } else {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: response.data.message || "Invalid Student ID or Password",
        });
      }
    } catch (error) {
      console.error("Login Error:", error);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: error.response?.data?.message || "Something went wrong!",
      });
    }
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-100 text-center py-20 px-6 transition-all duration-1000 w-full min-h-screen flex items-center justify-center">
      <Link to="/get-started" className="absolute top-6 left-6 no-underline hover:underline flex items-center text-sky-400 hover:text-sky-300 transition-colors">
        <ArrowLeft className="mr-2" size={20} />
        Back to Roles
      </Link>

      <div className="bg-gray-800 dark:bg-white p-8 rounded-lg shadow-lg w-96 duration-1000 relative">
        <h2 className="text-3xl text-sky-600 dark:text-sky-600 font-bold text-center mb-6">Student Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded-lg dark:bg-gray-100 bg-gray-600 p-2 duration-1000 relative">
            <User className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" />
            <input
              type="text"
              name="StudentId"
              placeholder="Student ID"
              className="w-full bg-transparent text-gray-300 dark:text-gray-600 focus:outline-none"
              value={formData.StudentId}
              onChange={handleChange}
              required
            />
            {formData.StudentId && <X className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setFormData({ ...formData, StudentId: "" })} />}
          </div>

          <div className="flex items-center border rounded-lg dark:bg-gray-100 bg-gray-600 p-2 duration-1000 relative">
            <Lock className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full bg-transparent text-gray-300 dark:text-gray-600 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {showPassword ? (
              <EyeOff className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} />
            ) : (
              <Eye className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
            )}
          </div>

          <button type="submit" className="w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-500 transition duration-300">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentLogin;
