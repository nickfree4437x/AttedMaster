import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQSection = () => {
  const faqs = [
    {
      question: "What is AttendMaster?",
      answer: "AttendMaster is an advanced attendance management system designed for institutions and organizations."
    },
    {
      question: "Is AttendMaster free to use?",
      answer: "Yes! AttendMaster offers a free plan with all essential features included."
    },
    {
      question: "Can I customize attendance reports?",
      answer: "Yes, AttendMaster provides customizable report templates where you can select which data fields to include, apply filters, and choose different visualization formats for your attendance data."
    },
    {
      question: "Can I export attendance reports?",
      answer: "Absolutely! You can download attendance reports in CSV or PDF format."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, AttendMaster is web-based, but a mobile app is in development."
    },
    {
      question: "How secure is my data?",
      answer: "We use industry-grade encryption to ensure all data remains safe and private."
    },
    { 
      question: "Can multiple teachers manage the same class?",
      answer: "Yes, multiple teachers can be assigned to the same class for attendance tracking." 
    },
    { 
      question: "Does AttendMaster integrate with third-party apps?",
      answer: "Yes, AttendMaster provides API access for integration with various platforms." 
    },
    { 
      question: "How do I get support if I face issues?", 
      answer: "You can contact our support team via email or live chat for assistance."
    },
    {
      question: "Is AttendMaster really free?",
      answer: "Yes, AttendMaster is completely free to use, with no hidden costs or fees."
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(prevIndex => prevIndex === index ? null : index);
  };

  return (
    <section className="relative bg-gray-800 dark:bg-gray-50 py-28 px-4 sm:px-6 overflow-hidden duration-1000" id="faq">
      {/* 3D Grid Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/30 to-purple-400/30"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Animated Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-5 px-4 py-2  rounded-full border bg-blue-900/20 text-gray-300 dark:bg-blue-100 dark:text-blue-500">
            <span className="h-2 w-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">FAQ</span>
          </div>
          <h2 className="text-4xl font-extrabold text-sky-600 dark:text-sky-600 mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Questions</span> <span className="text-gray-300 dark:text-gray-600">& Answers</span>
          </h2>
          <p className="text-xl text-gray-300 dark:text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about our platform. Can not find an answer? Contact us directly.
          </p>
        </div>
        
        {/* FAQ Grid with Proper Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((item, index) => (
            <div 
              key={index}
              className={`relative  rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500 ${
                hoveredIndex === index ? 'from-blue-500/30 to-purple-500/30' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative bg-gray-900 dark:bg-gray-100 text-sky-600 dark:text-sky-600 rounded-lg shadow-md overflow-hidden h-full">
                <button
                  className="w-full flex items-center justify-between gap-4 p-6 text-left focus:outline-none "
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-sky-600 dark:text-sky-600 flex items-center gap-3">
                      <span className={`inline-block w-3 h-3  rounded-full flex-shrink-0 transition-all ${
                        openIndex === index ? 'bg-gray-600' : 'bg-blue-400'
                      }`}></span>
                      {item.question}
                    </h3>
                  </div>
                  <div className={`flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180 text-gray-400' : 'text-blue-400'
                  }`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                {/* Enhanced Horizontal Divider */}
                <div className={`mx-6 h-[2px] bg-gradient-to-r from-blue-400/20 via-blue-400 to-blue-400/20 transition-all duration-500 ${
                  openIndex === index ? "w-full opacity-100" : "w-0 opacity-0"
                }`}></div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                    openIndex === index
                      ? "max-h-96 opacity-100 mt-2 text-blue-400 dark:text-blue-400"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="pl-5 border-l-2 border-sky-400">
                      <p className="text-gray-400 dark:text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced contact CTA */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm px-8 py-6 rounded-xl border border-gray-800 dark:border-gray-200/10 hover:border-blue-400/30 transition-all duration-300 group">
            <div className="flex-shrink-0">
              <div className="relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-500" />
                <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full text-white text-xl font-bold">
                  ?
                </div>
              </div>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-gray-300 dark:text-gray-600">
                Still have questions?
              </h3>
              <p className="mt-1 text-gray-300 dark:text-gray-600">
                We're here to help! Contact our support team for assistance.
              </p>
            </div>
            <a
              href="mailto:hello@wittyhacks.com"
              className="flex-shrink-0 px-6 py-3 bg-gradient-to-r no-underline from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-md transition-all duration-300 whitespace-nowrap"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
      `}</style>
    </section>
  );
};

export default FAQSection;