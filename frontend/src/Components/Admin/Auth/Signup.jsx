import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import Swal from "sweetalert2";

const Signup = () => {
  const [formData, setFormData] = useState({ firstname: "", lastname: "", email: "", userid: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const isEmailValid = formData.email.endsWith("@admin.com");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isEmailValid) {
      Swal.fire({
        icon: "error",
        title: "Invalid Email Address",
        text: "Email address is not valid!. Please contact to the AttendMaster team.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    try {
      const response = await fetch("https://attendmaster.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Signup Successful!",
          text: "You can now login.",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          localStorage.setItem("token", data.token);
          navigate("/admin/login");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Signup Failed",
          text: data.message || "Something went wrong",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Signup Error:", error);
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Something went wrong! Please try again later.",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-100 text-center py-20 px-6 transition-all duration-1000 w-full min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 dark:bg-white p-8 rounded-lg shadow-lg w-96 duration-1000">
        <h2 className="text-3xl text-sky-600 dark:text-sky-600 font-bold text-center mb-6">Admin Signup</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          {["firstname", "lastname", "email", "userid", "password"].map((field, index) => (
            <div key={index} className="flex items-center border rounded-lg dark:bg-gray-100 bg-gray-600 p-2 duration-1000 relative">
              {field === "firstname" || field === "lastname" || field === "userid" ? <User className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" /> : null}
              {field === "email" ? <Mail className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" /> : null}
              {field === "password" ? <Lock className="w-5 h-5 text-gray-300 dark:text-gray-500 mr-2" /> : null}
              
              <input
                type={field === "password" && !showPassword ? "password" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full bg-transparent text-gray-300 dark:text-gray-600 focus:outline-none"
                value={formData[field]}
                onChange={handleChange}
                required
              />

              {formData[field] && field !== "password" && (
                <X size={18} className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setFormData({ ...formData, [field]: "" })} />
              )}

              {field === "password" && (
                showPassword ? 
                <EyeOff className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(false)} /> :
                <Eye className="absolute right-3 text-gray-400 cursor-pointer" onClick={() => setShowPassword(true)} />
              )}
            </div>
          ))}

          <button className="w-full bg-sky-500 p-3 rounded-lg text-white hover:bg-sky-600">
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4">
          Already have an account? <Link to="/admin/login" className="text-sky-400">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
