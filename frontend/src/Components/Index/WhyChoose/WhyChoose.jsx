import { ThumbsUp, Award, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <ThumbsUp className="w-8 h-8" />,
      title: "User-Friendly",
      description: "Intuitive interface designed for teachers and students",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Proven Excellence",
      description: "Trusted by institutions worldwide",
      color: "from-amber-400 to-amber-600",
      bgColor: "bg-amber-500/10"
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Top-tier data privacy and reliability",
      color: "from-emerald-400 to-emerald-600",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Fast & Efficient",
      description: "Quick attendance with real-time analytics",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-500/10"
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "backOut"
      }
    },
    hover: {
      y: -10,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section className="relative py-24 px-4 sm:px-6 bg-gray-900 dark:bg-white overflow-hidden duration-1000">
      {/* Decorative gradient background */}
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
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 mb-4 text-sm font-medium rounded-full bg-blue-900/20 text-gray-300 dark:bg-blue-100 dark:text-blue-500">
            Why Choose Us
          </span>
          <h2 className="text-4xl font-extrabold mb-3">
            <span className="text-gray-200 dark:text-gray-700">Experience The</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Difference</span>
          </h2>
          <p className="text-xl text-gray-400 dark:text-gray-600 max-w-3xl mx-auto">
            Revolutionizing attendance management with cutting-edge technology and unparalleled user experience
          </p>
        </motion.div>
        
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {reasons.map((reason, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="relative group"
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 bg-gradient-to-br ${reason.color} blur-xl transition-opacity duration-300 -z-10`}></div>
              
              {/* Main card */}
              <div className={`h-full p-8 rounded-3xl backdrop-blur-sm border border-gray-700 dark:border-gray-200 ${reason.bgColor} transition-all duration-300 flex flex-col items-center text-center`}>
                {/* Animated icon background */}
                <motion.div 
                  className={`p-5 rounded-2xl mb-6 bg-gradient-to-br ${reason.color}`}
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  {reason.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold text-gray-300 dark:text-gray-600 mb-4">
                  {reason.title}
                </h3>
                <p className="text-gray-400 dark:text-gray-600 mb-6">
                  {reason.description}
                </p>
                
                {/* Animated button */}
                <motion.div
                  className={`w-full h-1 bg-gradient-to-r ${reason.color} rounded-full overflow-hidden`}
                  initial={{ scaleX: 0.8, opacity: 0.7 }}
                  whileHover={{ scaleX: 1, opacity: 1 }}
                >
                  <div className="h-full w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 bg-current"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;