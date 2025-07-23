import { Briefcase, Users, CheckCircle, ArrowRight } from "lucide-react";

const AboutUs = () => {
  return (
    <section className="bg-gray-900 dark:bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 duration-1000" id="about">
      <div className="max-w-6xl mx-auto"> {/* Increased from max-w-5xl to max-w-6xl */}
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-blue-900/20 text-gray-300 dark:bg-blue-100 dark:text-blue-500 mb-4">
            Who We Are
          </span>
          <h2 className="text-4xl font-extrabold mb-3">
          <span className="text-gray-200 dark:text-gray-700">About</span> <span className="text-sky-600 dark:text-sky-600">AttendMaster</span>
        </h2>
          <p className="text-lg md:text-xl text-gray-300 dark:text-gray-600 max-w-3xl mx-auto">
            Transforming attendance management through innovative technology, ensuring efficiency and accuracy for institutions worldwide.
          </p>
        </div>

        {/* Cards Grid - Wider cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mx-auto"> {/* Removed max-w constraint */}
          {/* Mission Card */}
          <div className="group relative overflow-hidden hover:cursor-pointer rounded-xl p-7 bg-gray-800 dark:bg-white border border-gray-200 dark:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-blue-900/20 dark:bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <Briefcase className="w-8 h-8 text-sky-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-3 text-center">
              Our Mission
            </h3>
            <p className="text-gray-300 dark:text-gray-600 mb-6 text-center">
              To provide a seamless, efficient attendance management system that saves time and reduces errors for institutions worldwide.
            </p>
            <div className="text-center">
              <a
                href="#mission"
                className="inline-flex items-center text-sm no-underline font-medium text-sky-600 dark:text-sky-400 group-hover:underline mx-auto"
              >
                Learn more <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 bg-blue-600 group-hover:w-full transition-all duration-500"></div>
          </div>

          {/* Features Card */}
          <div className="group relative overflow-hidden hover:cursor-pointer rounded-xl p-7 bg-gray-800 dark:bg-white border border-gray-200 dark:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-3 text-center">
              Our Features
            </h3>
            <p className="text-gray-300 dark:text-gray-600 mb-6 text-center">
              Packed with powerful, user-friendly features that make attendance tracking effortless and insightful.
            </p>
            <div className="text-center">
              <a
                href="#features"
                className="inline-flex items-center no-underline text-sm font-medium text-green-600 dark:text-green-400 group-hover:underline mx-auto"
              >
                Explore features <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 bg-green-600 group-hover:w-full transition-all duration-500"></div>
          </div>

          {/* Vision Card */}
          <div className="group relative overflow-hidden hover:cursor-pointer rounded-xl p-7 bg-gray-800 dark:bg-white border border-gray-200 dark:border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-6 mx-auto">
              <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-3 text-center">
              Our Vision
            </h3>
            <p className="text-gray-300 dark:text-gray-600 mb-6 text-center">
              To revolutionize attendance management with cutting-edge technology that adapts to your institution's needs.
            </p>
            <div className="text-center">
              <a
                href="#vision"
                className="inline-flex items-center no-underline text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:underline mx-auto"
              >
                See our vision <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
            <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 bg-purple-600 group-hover:w-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mx-auto">
          <div className="bg-gray-800 dark:bg-white p-5 rounded-xl border border-gray-700 dark:border-gray-200 text-center">
            <div className="text-2xl md:text-3xl font-bold text-sky-600 dark:text-sky-400 mb-2">1M+</div>
            <div className="text-sm md:text-base text-gray-300 dark:text-gray-600">Attendance Records</div>
          </div>
          <div className="bg-gray-800 dark:bg-white p-5 rounded-xl border border-gray-700 dark:border-gray-200 text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">99.7%</div>
            <div className="text-sm md:text-base text-gray-300 dark:text-gray-600">Accuracy Rate</div>
          </div>
          <div className="bg-gray-800 dark:bg-white p-5 rounded-xl border border-gray-700 dark:border-gray-200 text-center">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">5K+</div>
            <div className="text-sm md:text-base text-gray-300 dark:text-gray-600">Classes Managed</div>
          </div>
          <div className="bg-gray-800 dark:bg-white p-5 rounded-xl border border-gray-700 dark:border-gray-200 text-center">
            <div className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">2m</div>
            <div className="text-sm md:text-base text-gray-300 dark:text-gray-600">Quick Setup</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;