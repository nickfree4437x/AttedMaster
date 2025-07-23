import { ArrowRightCircle, UserPlus, ClipboardList, BarChart } from "lucide-react";

const HowSystemWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="w-16 h-16 text-blue-500" />,
      title: "Step 1: Register",
      description: "Sign up as an admin to manage your college’s attendance.",
    },
    {
      icon: <ClipboardList className="w-16 h-16 text-green-500" />,
      title: "Step 2: Mark Attendance",
      description: "Teachers mark attendance online for their respective classes.",
    },
    {
      icon: <BarChart className="w-16 h-16 text-purple-500" />,
      title: "Step 3: Track Progress",
      description: "Students and administrators can track attendance and performance.",
    },
  ];

  return (
    <section className="bg-gray-900 dark:bg-white py-20 px-6 transition-all duration-1000">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-extrabold text-sky-600 dark:text-sky-600 mb-3">How Our System Works</h2>
        <p className="text-lg text-gray-300 dark:text-gray-600 max-w-3xl mx-auto mb-10">
          AttendMaster simplifies attendance tracking with a seamless, automated process. From quick registration to real-time attendance marking and performance tracking.
        </p>
        <div className="relative flex flex-col md:flex-row items-center justify-between space-y-12 md:space-y-0 md:space-x-12">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center text-center max-w-xs">
              <div className="bg-gray-700 dark:bg-white p-6 rounded-full shadow-md transition-transform transform hover:scale-110 duration-300">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-100 dark:text-gray-700 mt-6">{step.title}</h3>
              <p className="mt-2 text-gray-300 dark:text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowRightCircle className="hidden md:block absolute top-1/2 right-[-3rem] transform -translate-y-1/2 w-12 h-12 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowSystemWorks;