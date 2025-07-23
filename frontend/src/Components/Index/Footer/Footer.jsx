import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Swal from 'sweetalert2';

const Footer = () => {

const [email, setEmail] = useState("");

const handleSubscribe = async () => {
    if (!email) {
      Swal.fire({
        icon: 'warning',
        title: 'Email Required',
        text: 'Please enter your email address.',
      });
      return;
    }

    try {
      const response = await fetch("https://attendmaster.onrender.com/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Subscribed!',
          text: 'You have been subscribed to the newsletter.',
        });
        setEmail(""); // Clear the input
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Subscription Failed',
          text: 'Failed to subscribe. Try again later.',
        });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <footer className="relative bg-gray-900 text-white pt-20 pb-12 px-4 sm:px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-[30%] h-[30%] rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-purple-600 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AttendMaster
            </h2>
            <p className="mt-4 text-gray-400">
              Revolutionizing attendance management with cutting-edge technology for educational institutions worldwide.
            </p>
            <div className="mt-6 flex space-x-4">
              {[
                { icon: <Facebook className="w-5 h-5" />, color: "hover:bg-blue-600" },
                { icon: <Twitter className="w-5 h-5" />, color: "hover:bg-sky-500" },
                { icon: <Linkedin className="w-5 h-5" />, color: "hover:bg-blue-700" },
                { icon: <Instagram className="w-5 h-5" />, color: "hover:bg-pink-500" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href="#"
                  whileHover={{ y: -3 }}
                  className={`p-2 rounded-full bg-gray-800 text-gray-300 ${social.color} transition-all`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['About', 'Features', 'vision', 'Mission', 'Contact'].map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                >
                  <a 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-gray-400 hover:text-white no-underline hover:underline transition flex items-center"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {item}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">attendmaster750@gmail.com</span>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+91 7505784698</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-400">152107, AttendMaster HQ, Malout India</span>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new features and offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-grow px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubscribe}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Copyright Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-800 text-center"
        >
          <p className="text-gray-500">
            &copy; {new Date().getFullYear()} <span className="text-gray-300 font-medium">AttendMaster</span>. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
