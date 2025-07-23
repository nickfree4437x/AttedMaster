import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiChevronDown, FiMail, FiMessageSquare, FiClock, FiUser, FiBook, FiSend, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [activeFaq, setActiveFaq] = useState(null);
  const token = localStorage.getItem('teacherToken');
  const headers = { Authorization: `Bearer ${token}` };

  const faqs = [
    { question: "How do I reset my password?", answer: "Go to Account Settings → 'Reset Password'. A link will be emailed to you." },
    { question: "What are the support timings?", answer: "Monday-Friday (9AM-6PM). Weekends: Email only." },
    { question: "How to upload student grades?", answer: "Navigate to Grades → Upload CSV or enter manually." },
    { question: "Can I schedule parent meetings?", answer: "Yes! Use Calendar → New Meeting → Select parents." },
    { question: "Where are my attendance reports?", answer: "Dashboard → Reports → Attendance." },
    { question: "How to contact IT support?", answer: "Use this form or email support@school.edu." },
    { question: "Can I use the app offline?", answer: "Limited features available. Syncs when back online." },
    { question: "How to delete old assignments?", answer: "Go to Assignments → Archive (they stay in records)." },
    { question: "Why can't students see materials?", answer: "Check class permissions or share link again." },
    { question: "How to update my profile photo?", answer: "Click your photo → Upload New (JPG/PNG)." },
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://attendmaster.onrender.com/api/teachers/support', formData, { headers });
      Swal.fire({
        title: 'Success!',
        text: 'Support request sent! We\'ll reply soon.',
        icon: 'success',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to send. Try again later.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
        color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 mt-8 transition-colors duration-1000">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r text-sky-600 mb-3">
            Teacher Support Hub
          </h1>
          <p className="text-gray-300 dark:text-gray-600">
            Get help quickly with our 24/7 support system
          </p>
        </motion.div>

        {/* Main Grid (FAQ + Form) */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 dark:bg-white rounded-2xl shadow-md p-6 duration-1000"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiBook className="text-2xl text-sky-500 dark:text-sky-400" />
              <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-700">FAQs</h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className={`rounded-lg overflow-hidden transition-all ${activeFaq === index ? 'border border-sky-800 dark:border-sky-200' : 'border border-gray-700 dark:border-gray-200'}`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full flex justify-between items-center p-4 text-left transition-colors ${activeFaq === index ? 'bg-gray-700 dark:bg-blue-50' : 'hover:bg-gray-700 dark:hover:bg-gray-50'}`}
                  >
                    <span className="font-medium text-gray-200 dark:text-gray-600">{faq.question}</span>
                    <FiChevronDown className={`transition-transform ${activeFaq === index ? 'rotate-180 text-sky-500 dark:text-sky-400' : 'text-gray-400 dark:text-gray-500'}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 mt-2 text-gray-300 dark:text-gray-600"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Support Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 dark:bg-white rounded-2xl shadow-md p-6 duration-1000"
          >
            <div className="flex items-center gap-3 mb-6">
              <FiMessageSquare className="text-2xl text-sky-500 dark:text-sky-400" />
              <h2 className="text-2xl font-bold text-gray-200 dark:text-gray-800">Contact Support</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Response Time Alert */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-900 dark:bg-gray-100 duration-1000">
                <FiClock className="text-gray-50 dark:text-sky-400" />
                <p className="text-sm text-gray-100 dark:text-gray-700">
                  Avg. response time: <span className="font-medium">2 hours</span> (urgent issues faster)
                </p>
              </div>

              {/* Form Fields */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 dark:border-gray-300 bg-gray-800 text-gray-300 dark:text-gray-600 dark:bg-white peer border-transparent focus:outline-none placeholder-transparent duration-1000"
                  placeholder=" "
                  required
                />
                <label 
                  htmlFor="name"
                  className="absolute left-3 -top-2.5 bg-gray-800 dark:bg-white px-1 text-sm text-gray-300 dark:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-gray-200 peer-focus:dark:text-gray-600 transition-all duration-200 pointer-events-none"
                >
                  Your Name
                </label>
                <FiUser className="absolute right-4 top-4 text-gray-400 dark:text-gray-500" />
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 dark:border-gray-300 bg-gray-800 text-gray-300 dark:text-gray-600 dark:bg-white peer border-transparent focus:outline-none placeholder-transparent duration-1000"
                  placeholder=" "
                  required
                />
                <label 
                  htmlFor="email"
                  className="absolute left-3 -top-2.5 bg-gray-800 dark:bg-white px-1 text-sm text-gray-300 dark:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-gray-200 peer-focus:dark:text-gray-600 transition-all duration-200 pointer-events-none"
                >
                  Email Address
                </label>
                <FiMail className="absolute right-4 top-4 text-gray-400 dark:text-gray-500" />
              </div>

              <div className="relative">
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 dark:border-gray-300 bg-gray-800 text-gray-300 dark:text-gray-600 dark:bg-white peer border-transparent focus:outline-none placeholder-transparent duration-1000"
                  placeholder=" "
                  required
                />
                <label 
                  htmlFor="subject"
                  className="absolute left-3 -top-2.5 bg-gray-800 dark:bg-white px-1 text-sm text-gray-300 dark:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-gray-200 peer-focus:dark:text-gray-600 transition-all duration-200 pointer-events-none"
                >
                  Subject
                </label>
                <FiFileText className="absolute right-4 top-4 text-gray-400 dark:text-gray-500" />
              </div>

              <div className="relative">
                <textarea
                  name="message"
                  id="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 dark:border-gray-300 bg-gray-800 text-gray-300 dark:text-gray-600 dark:bg-white peer border-transparent focus:outline-none placeholder-transparent duration-1000"
                  placeholder=" "
                  required
                  maxLength={2000}
                />
                <label 
                  htmlFor="message"
                  className="absolute left-3 -top-2.5 bg-gray-800 dark:bg-white px-1 text-sm text-gray-300 dark:text-gray-600 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:dark:text-gray-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:left-4 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-gray-200 peer-focus:dark:text-gray-600 transition-all duration-200 pointer-events-none"
                >
                  Your Message
                </label>
                <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
                  {2000 - formData.message.length} characters remaining
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
              >
                <FiSend /> Send Request
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSupport;
