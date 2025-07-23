import { useState, useEffect, useRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";
import Logo from "./logo.jpeg";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved !== null ? JSON.parse(saved) : true; // Default: Dark Mode
  });
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Apply dark/light mode on load & change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gray-800 dark:bg-white shadow-md fixed top-0 w-full z-30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
        {/* Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <img src={Logo} alt="Logo" className="w-12 h-12 object-contain rounded-lg" />
          <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-600">
            AttendMaster
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          {["Home", "About", "Features", "Vision", "Contact"].map((item) => (
            <Link
              key={item}
              to={item.toLowerCase()}
              smooth={true}
              duration={500}
              className="text-gray-200 dark:text-gray-600 no-underline hover:underline hover:text-cyan-600 dark:hover:text-cyan-600 transition-colors duration-300 cursor-pointer"
            >
              {item}
            </Link>
          ))}

          <button
            onClick={() => navigate("/get-started")}
            className="px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-300 shadow-md"
          >
            Login
          </button>

          {/* Dark/Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-900 dark:bg-gray-200 focus:outline-none transition-colors duration-300"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FiSun className="text-yellow-400" size={22} /> // Sun icon in dark mode (light theme)
            ) : (
              <FiMoon className="text-gray-300" size={22} /> // Moon icon in light mode (dark theme)
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden flex items-center space-x-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-900 dark:bg-gray-200 focus:outline-none transition-colors duration-300"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <FiSun className="text-yellow-400" size={20} /> // Sun icon in dark mode (light theme)
            ) : (
              <FiMoon className="text-gray-300" size={20} /> // Moon icon in light mode (dark theme)
            )}
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-200 dark:text-gray-800 focus:outline-none"
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
          className="lg:hidden bg-gray-900 dark:bg-gray-100 p-4 space-y-4 transition-all duration-300"
        >
          {["Home", "About", "Features", "Vision", "Contact"].map((item) => (
            <Link
              key={item}
              to={item.toLowerCase()}
              smooth={true}
              duration={500}
              className="block py-2 text-center no-underline hover:underline text-gray-200 dark:text-gray-700 hover:text-cyan-600 dark:hover:text-cyan-600 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {item}
            </Link>
          ))}

          <button
            onClick={() => {
              navigate("/get-started");
              setIsMenuOpen(false);
            }}
            className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors duration-300"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;