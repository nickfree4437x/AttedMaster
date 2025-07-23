import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, Eye, EyeOff, X, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ userid: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      
      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Redirecting to dashboard...",
        confirmButtonColor: "#3085d6",
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        navigate("/admin/dashboard", { replace: true });
      });
      
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: "Invalid credentials. Please try again!",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-100 text-center py-20 px-6 transition-all duration-1000 w-full min-h-screen flex items-center justify-center">
      {/* Back to Roles Link */}
      <Link 
        to="/get-started" 
        className="absolute top-6 no-underline hover:underline left-6 flex items-center text-sky-400 hover:text-sky-300 transition-colors"
      >
        <ArrowLeft className="mr-2" size={20} />
        Back to Roles
      </Link>

      <div className="bg-gray-800 dark:bg-white p-8 rounded-lg shadow-lg w-96 duration-1000 relative">
        <h2 className="text-3xl text-sky-600 dark:text-sky-600 font-bold text-center mb-6">Admin Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User ID Field */}
          <div className="flex items-center border rounded-lg dark:bg-gray-100 bg-gray-600 p-2 duration-1000 relative">
            <User className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" />
            <input 
              type="text" 
              name="userid" 
              placeholder="User ID" 
              className="w-full bg-transparent text-gray-300 dark:text-gray-600 focus:outline-none"
              value={formData.userid} 
              onChange={handleChange} 
              required 
            />
            {formData.userid && (
              <X className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setFormData({ ...formData, userid: "" })} />
            )}
          </div>

          {/* Password Field */}
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

          <button className="w-full bg-sky-500 p-3 rounded-lg text-white hover:bg-sky-600">
            Login
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Don't have an account? <Link to="/admin/signup" className="text-sky-400">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
