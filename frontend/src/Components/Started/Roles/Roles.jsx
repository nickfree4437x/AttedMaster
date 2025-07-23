import { User, Briefcase, GraduationCap, Home } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: <Briefcase className="w-14 h-14" />,
    title: "Admin",
    description: "Manage the entire attendance system, oversee reports, and control user access.",
    buttonText: "Admin Login",
    link: "/admin/login",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: <User className="w-14 h-14" />,
    title: "Teacher",
    description: "Mark attendance, view reports, and manage student records efficiently.",
    buttonText: "Teacher Login",
    link: "/teacher/login",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: <GraduationCap className="w-14 h-14" />,
    title: "Student",
    description: "Check your attendance records, track progress, and stay updated.",
    buttonText: "Student Login",
    link: "/student/login",
    gradient: "from-purple-500 to-purple-600"
  }
];

const RolesSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#0A1F44] to-[#000000] text-white dark:from-blue-400 dark:to-blue py-24 px-4 sm:px-6 lg:px-8 transition-all duration-1000 min-h-screen">
      {/* Home Link - Floating Top Left */}
      <Link 
        to="/"
        className="fixed top-6 no-underline left-6 z-50 p-2 rounded-full bg-gray-700/50 dark:bg-gray-200/50 hover:bg-gray-700/70 dark:hover:bg-gray-300/70 focus:outline-none transition-colors duration-300 flex items-center gap-2 text-white dark:text-gray-800"
      >
        <Home className="w-5 h-5" />
        <span className="hidden sm:inline">Back Home</span>
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-gray-800 mb-4">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-500">Role</span>
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-600 max-w-3xl mx-auto">
            Select your role to access the tailored experience designed just for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {roles.map((role, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-gray-800/50 dark:bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700/30 dark:border-gray-200/30 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              <div className="p-8 relative z-10">
                <div className={`mb-6 flex justify-center items-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${role.gradient} shadow-md transition-transform duration-300`}>
                  <div className="text-white">
                    {role.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-center text-gray-100 dark:text-gray-600  mb-3">
                  {role.title}
                </h3>
                
                <p className="text-gray-300 dark:text-gray-600 text-center mb-6">
                  {role.description}
                </p>
                
                <div className="flex justify-center">
                  <Link 
                    to={role.link}
                    className={`px-4 py-2.5 rounded-lg no-underline font-medium text-white bg-gradient-to-r ${role.gradient} hover:shadow-lg transition-all duration-300 flex items-center justify-center`}
                  >
                    {role.buttonText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${role.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className={`absolute -inset-2 opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-2xl blur-md`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;