import { useNavigate } from "react-router-dom";
import student from "./student.jpeg";

const SmartAttendance = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 
        bg-gradient-to-br from-gray-900 to-gray-800 dark:from-blue-50 dark:to-indigo-100">
      
      <div className="max-w-7xl w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Content Side */}
          <div className="w-full lg:w-1/2 p-8 sm:p-10 md:p-12 lg:p-16 flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 
                text-gray-100 dark:text-gray-800 mt-8 sm:mt-16">
              Smart Attendance <span className="text-sky-600 dark:text-sky-600">Management</span>
            </h1>
            <p className="text-2xl sm:text-3xl font-light mb-6 text-gray-300 dark:text-gray-600">
              Made <span className="font-semibold text-purple-500 dark:text-purple-500">Easy!</span>
            </p>
            <p className="text-lg mb-8 max-w-md text-gray-400 dark:text-gray-500">
              A cloud-based solution for seamless student attendance tracking and management.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={() => navigate("/get-started")}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg shadow-md 
                hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none">
                Get Started
              </button>
              <a
                href="#about"
                className="px-6 py-3 text-sky-500 border-2 text-center no-underline border-sky-500 rounded-lg shadow-md hover:bg-sky-500 hover:text-white hover:scale-105 transform transition-all duration-300"
              >
                Learn More
              </a>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-sky-700 dark:bg-gray-200 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" 
                      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-300 dark:text-gray-600">100% Accurate</span>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-sky-700 dark:bg-gray-200 flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" 
                      viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <span className="text-gray-300 dark:text-gray-600">Cloud Based</span>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 dark:bg-indigo-600 rounded-full opacity-20 
                -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500 dark:bg-indigo-800 rounded-full opacity-20 
                translate-x-16 translate-y-16"></div>

            {/* Image Container */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <img src={student} alt="Smart Attendance System" className="w-full h-auto max-h-[500px] object-contain 
                  rounded-lg shadow-lg dark:shadow-xl dark:shadow-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAttendance;