import { Target, Lightbulb, Users, Globe, ShieldCheck, Rocket } from "lucide-react";

const OurMission = () => {
  const missionItems = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Our Goal",
      description: "Simplify attendance tracking with intuitive technology",
      accent: "from-blue-400 to-blue-600"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Innovation",
      description: "Smart solutions that save time and improve accuracy",
      accent: "from-yellow-400 to-yellow-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community",
      description: "Designed for educators and students alike",
      accent: "from-green-400 to-green-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Supporting institutions worldwide",
      accent: "from-indigo-400 to-indigo-600"
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Security",
      description: "Your data is always protected",
      accent: "from-red-400 to-red-600"
    },
    {
      icon: <Rocket className="w-6 h-6" />,
      title: "Future Growth",
      description: "Continually evolving to meet needs",
      accent: "from-orange-400 to-orange-600"
    }
  ];

  return (
    <section className="bg-gray-900 dark:bg-indigo-50 py-20 px-4 sm:px-6 duration-1000">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block mb-3 text-sm font-medium px-4 py-1 rounded-full bg-blue-900/20 text-gray-300 dark:bg-blue-100 dark:text-blue-500">
            Our Mission
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="text-gray-200 dark:text-gray-700">Guiding</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Principles</span>
          </h2>
          <p className="text-lg text-gray-300 dark:text-gray-600 max-w-2xl mx-auto">
            Building attendance solutions that work the way you do
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {missionItems.map((item, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-xl bg-gray-800 dark:bg-white border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`}></div>
              
              <div className="p-6">
                <div className={`mb-5 p-3 rounded-lg bg-gradient-to-br ${item.accent} w-12 h-12 flex items-center justify-center text-white`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-600 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300 dark:text-gray-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurMission;