import React, { useState, useEffect, useRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Logo from "./logo.jpeg"; 

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, default to true (dark mode) if not set
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Apply dark/light mode on initial load and when changed
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to localStorage
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        Swal.fire("Logged Out!", "You have been successfully logged out.", "success");
        navigate("/admin/login");
      }
    });
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <nav className="bg-gray-800 dark:bg-white shadow-md fixed top-0 w-full z-30 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        
        {/* Logo + Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
          <img src={Logo} alt="AttendMaster Logo" className="w-10 h-10 object-contain rounded-lg" />
          <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-600">
            AttendMaster
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex space-x-14 relative z-30">
          <NavLink
            to="/admin/dashboard" 
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Admin
          </NavLink>

          <NavLink
            to="/admin/course"
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Course
          </NavLink>

          <NavLink
            to="/admin/subject"
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Subject
          </NavLink>

          <NavLink
            to="/admin/teacher"
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Teacher
          </NavLink>

          <NavLink
            to="/admin/student"
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Student
          </NavLink>

          <NavLink
            to="/admin/attendance"
            className={({ isActive }) => 
              `text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                isActive ? "text-cyan-500 dark:text-cyan-500 font-medium" : ""
              }`
            }
          >
            Attendance
          </NavLink>
        </div>

        {/* Right-Side Buttons */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-900 dark:bg-gray-200 focus:outline-none transition-colors duration-300"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FiSun className="text-yellow-400" size={20} />
            ) : (
              <FiMoon className="text-gray-300" size={20} />
            )}
          </button>

          {/* Logout / Login Button */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden lg:block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/admin/login"
              className="hidden lg:block bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Login
            </NavLink>
          )}

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-200 dark:text-gray-800 focus:outline-none"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          ref={dropdownRef}
          className="lg:hidden bg-gray-900 dark:bg-gray-100 p-4 space-y-3 transition-all duration-300"
        >
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Admin
          </NavLink>

          <NavLink
            to="/admin/course"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Course
          </NavLink>

          <NavLink
            to="/admin/subject"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Subject
          </NavLink>

          <NavLink
            to="/admin/teacher"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Teacher
          </NavLink>

          <NavLink
            to="/admin/student"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Student
          </NavLink>

          <NavLink
            to="/admin/attendance"
            className={({ isActive }) => 
              `block py-2 px-3 rounded text-gray-200 dark:text-gray-700 no-underline hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors ${
                isActive ? "bg-gray-800 dark:bg-gray-200 font-medium" : ""
              }`
            }
            onClick={() => setIsMenuOpen(false)}
          >
            Attendance
          </NavLink>

          {/* Logout button for mobile */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors duration-300"
            >
              Logout
            </button>
          ) : (
            <NavLink
              to="/admin/login"
              className="block w-full mt-2 bg-sky-500 hover:bg-sky-600 text-white py-2 px-3 rounded-lg text-center transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;