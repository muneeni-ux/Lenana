import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-6 mt-12 border-t border-gray-200 dark:border-gray-700 ">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        {/* Left Side */}
        <div className="text-center md:text-left">
          <p className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Lenana Drops System. All rights reserved.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex space-x-4 text-sm">
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="hover:text-green-600 transition-colors"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
