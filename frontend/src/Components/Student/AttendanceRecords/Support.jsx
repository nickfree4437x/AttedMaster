import React, { useState } from 'react';
import axios from 'axios';
import { FiMail, FiUser, FiMessageSquare } from 'react-icons/fi';

function SupportFAQPage() {
  // Support Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'General Query',
    message: '',
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // FAQ State
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const token = localStorage.getItem('studentToken');
      await axios.post('http://localhost:5000/api/students/support', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      setFormData({ name: '', email: '', category: 'General Query', message: '' });
    } catch (err) {
      console.error('Error submitting support request:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FAQ Data
  const faqs = [
    {
      question: "How long does it take to get a response?",
      answer: "Typically, we respond within 24-48 hours. High-priority requests are addressed sooner."
    },
    {
      question: "What should I do if my attendance is marked wrong?",
      answer: "Submit a support request with the date, class, and any proof (e.g., screenshot)."
    },
    {
      question: "Can I edit my support request after submitting?",
      answer: "No, but you can submit a follow-up request referencing your ticket ID."
    },
    {
      question: "Do you provide support on weekends?",
      answer: "Yes, but responses may take longer during weekends and holidays."
    },
    {
      question: "How do I check the status of my request?",
      answer: "You'll receive email updates. Alternatively, log in to your dashboard for status changes."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all submissions are encrypted and comply with privacy regulations."
    },
    {
      question: "Can I request urgent support?",
      answer: "Yes, select 'High Priority' when submitting your request for urgent issues."
    },
    {
      question: "Who can I contact for account-related issues?",
      answer: "Use the 'Technical Issue' category or email accounts@university.edu directly."
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 duration-1000">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-sky-600 mb-8">Help Center</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* FAQ Section (Left) */}
          <div className="w-full lg:w-1/2 bg-gray-800 dark:bg-white p-6 rounded-xl shadow-md duration-1000">
            <h2 className="text-2xl font-semibold text-gray-300 dark:text-gray-700 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex justify-between items-center w-full text-left font-medium text-gray-300 dark:text-gray-700 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    {activeIndex === index ? (
                      <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {activeIndex === index && (
                    <div className="mt-2 text-gray-300 dark:text-gray-700 pl-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Support Form (Right) */}
          <div className="w-full lg:w-1/2 bg-gray-800 dark:bg-white p-6 rounded-xl shadow-md duration-1000">
            <h2 className="text-2xl font-semibold text-gray-300 dark:text-gray-700 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </h2>

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                ✅ Your request has been submitted! We'll email you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-1.5 top-3 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  required
                />
              </div>

              <div className="relative">
                <FiMail className="absolute left-1.5 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className=" w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  required
                />
              </div>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className=" w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
              >
                <option>General Query</option>
                <option>Wrong Attendance</option>
                <option>Technical Issue</option>
                <option>Account Problem</option>
              </select>

              <div className="relative">
                <FiMessageSquare className="absolute left-1.5 top-3 text-gray-400" />
                <textarea
                  name="message"
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className=" w-full px-4 py-2 bg-gray-800 dark:bg-white text-gray-200 dark:text-gray-600 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-transparent transition-all duration-1000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${loading ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'} transition-colors flex items-center justify-center`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportFAQPage;