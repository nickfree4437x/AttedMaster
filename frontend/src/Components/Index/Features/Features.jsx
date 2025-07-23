import { FaShieldAlt, FaChartLine, FaUserGraduate, FaCloud, FaUserPlus, FaLayerGroup } from "react-icons/fa";
import { motion } from "framer-motion";

const OurFeatures = () => {
  const features = [
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: "Secure User Authentication",
      description: "Industry-standard JWT authentication keeps user data secure and protected.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Admin Dashboard Analytics",
      description: "Comprehensive analytics dashboard for monitoring attendance patterns.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10"
    },
    {
      icon: <FaUserGraduate className="w-8 h-8" />,
      title: "Student Portal System",
      description: "Personalized student portal for tracking individual attendance records.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: <FaCloud className="w-8 h-8" />,
      title: "Real-time Cloud Updates",
      description: "Cloud integration ensures attendance data is synchronized in real-time.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: <FaUserPlus className="w-8 h-8" />, // import { FaUserPlus } from "react-icons/fa";
      title: "Add Teacher Management",
      description: "Easily add, edit, and manage teachers with multi-course and subject assignments.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10"

    },
    {
      icon: <FaLayerGroup className="w-8 h-8" />,
      title: "Multi-Layer Access Control",
      description: "Role-based permissions ensure secure and structured access to data.",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-500/10"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 bg-gray-800 dark:bg-gray-50 overflow-hidden duration-1000">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-[0.03]">
        <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-400 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[30%] h-[30%] rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="text-gray-200 dark:text-gray-700">Powerful</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Features</span>
          </h2>
          <p className="text-xl text-gray-400 dark:text-gray-600 max-w-3xl mx-auto">
            Everything you need to streamline attendance management
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className={`h-full p-8 rounded-2xl backdrop-blur-sm bg-gray-800 dark:bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 ${feature.bgColor}`}>
                {/* Gradient icon background */}
                <div className={`p-2 rounded-xl mb-6 bg-gradient-to-br ${feature.color} w-14 h-14 flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-100 dark:text-gray-600 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 dark:text-gray-600 mb-6">
                  {feature.description}
                </p>
                
                {/* Animated underline */}
                <div className="w-16 h-1 overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-r ${feature.color} transition-transform duration-500 group-hover:translate-x-full`}></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default OurFeatures;