import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 mt-3 text-white py-8">
      <div className="max-w-screen-xl mx-auto px-4 text-center">
        <p className="text-sm mb-4">&copy; 2025 CryptoTrade</p>
        <div className="flex justify-center space-x-8 text-sm">
          <a
            href="/about"
            className="text-white hover:text-blue-500 transition-colors"
          >
            Market
          </a>
          <a
            href="/services"
            className="text-white hover:text-blue-500 transition-colors"
          >
            Portfolio
          </a>
          <a
            href="/privacy-policy"
            className="text-white hover:text-blue-500 transition-colors"
          >
            Account
          </a>
          <a
            href="/terms-of-service"
            className="text-white hover:text-blue-500 transition-colors"
          >
            News
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
