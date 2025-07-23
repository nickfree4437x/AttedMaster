import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Moon,
  Sun,
  LayoutDashboard,
  User,
  CalendarCheck,
  BarChart3,
  Headphones,
  Menu,
  X,
} from "lucide-react";
import Logo from "./logo.jpeg";

const StudentNavbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("studentToken");
        navigate("/student/login");
        Swal.fire("Logged Out!", "You have been logged out.", "success");
      }
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when route changes
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <>
      <nav className="bg-gray-800 dark:bg-white shadow-md fixed top-0 w-full z-30 transition-all duration-1000">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          {/* Left Side - Logo + Heading */}
          <div className="flex items-center space-x-3">
            <img
              src={Logo}
              alt="Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-lg"
            />
            <h1 className="text-xl md:text-2xl lg:text-3xl text-sky-600 font-bold dark:text-sky-600">
              Student Panel
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <NavLink
              to="/student/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                  isActive ? "text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
                }`
              }
            >
              <User className="w-4 h-4" />
              <span className="text-sm lg:text-base">Profile</span>
            </NavLink>

            <NavLink
              to="/student/attendance"
              className={({ isActive }) =>
                `flex items-center gap-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                  isActive ? "text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
                }`
              }
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="text-sm lg:text-base">Attendance</span>
            </NavLink>

            <NavLink
              to="/student/reports"
              className={({ isActive }) =>
                `flex items-center gap-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                  isActive ? "text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm lg:text-base">Analytics</span>
            </NavLink>

            <NavLink
              to="/student/support"
              className={({ isActive }) =>
                `flex items-center gap-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer ${
                  isActive ? "text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
                }`
              }
            >
              <Headphones className="w-4 h-4" />
              <span className="text-sm lg:text-base">Support</span>
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden lg:block bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 text-sm lg:text-base"
            >
              Logout
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-900 dark:bg-gray-100 focus:outline-none duration-700"
            >
              {isDarkMode ? (
                <Sun className="text-yellow-500 w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <Moon className="text-gray-300 w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-900 dark:bg-gray-100 focus:outline-none duration-700"
            >
              {isDarkMode ? (
                <Sun className="text-yellow-500 w-4 h-4" />
              ) : (
                <Moon className="text-gray-300 w-4 h-4" />
              )}
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-200 dark:text-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 left-0 w-full bg-gray-800 dark:bg-white shadow-lg z-20 transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col space-y-4 p-4">
          <NavLink
            to="/student/profile"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer rounded-lg ${
                isActive ? "bg-gray-700 dark:bg-gray-200 text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
              }`
            }
          >
            <User className="w-5 h-5" />
            My Profile
          </NavLink>

          <NavLink
            to="/student/attendance"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer rounded-lg ${
                isActive ? "bg-gray-700 dark:bg-gray-200 text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
              }`
            }
          >
            <CalendarCheck className="w-5 h-5" />
            Attendance
          </NavLink>

          <NavLink
            to="/student/reports"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer rounded-lg ${
                isActive ? "bg-gray-700 dark:bg-gray-200 text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
              }`
            }
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </NavLink>

          <NavLink
            to="/student/support"
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 text-gray-200 dark:text-gray-600 no-underline hover:underline transition hover:text-cyan-600 dark:hover:text-cyan-600 cursor-pointer rounded-lg ${
                isActive ? "bg-gray-700 dark:bg-gray-200 text-yellow-400 dark:text-blue-600" : "text-gray-300 dark:text-gray-700"
              }`
            }
          >
            <Headphones className="w-5 h-5" />
            Support
          </NavLink>

          <button
            onClick={() => {
              handleLogout();
              closeMobileMenu();
            }}
            className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Logout
          </button>
        </div>
      </div>
      
      {/* Spacer to account for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default StudentNavbar;