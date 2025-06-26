// src/AskAi.jsx
import React, { useContext, useState } from 'react';
import Sidebar from '../Components/Sidebar';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandSparkles, faExpand, faBars, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Context } from '../../Context/Context';
import gemini from "../assets/gemini_icon.png";
import ReactMarkdown from 'react-markdown';

const AskAi = () => {
  const { onSent, showResult, loading, setInput, input, prevPrompts } = useContext(Context);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClearInput = () => {
    setInput('');
  };

  return (
    <div className="flex w-screen h-screen bg-gradient-to-br from-[#f4f5f7] to-[#d1e7ff] overflow-hidden font-sans">
      <div className={`fixed z-40 h-full bg-black bg-opacity-30 backdrop-blur-lg transition-all duration-300 ease-in-out 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <div className={`flex flex-col w-full h-full transition-all duration-300 
        ${isSidebarOpen ? 'pl-64' : 'pl-16'}`}>
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#007bff] to-[#00b8d4] shadow-lg rounded-b-xl">
          <div className="flex items-center space-x-4">
            <button onClick={toggleSidebar} className="text-white hover:text-gray-200 transition-all duration-300">
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
            <motion.h1 
              className="text-3xl font-extrabold text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Ask AI
            </motion.h1>
          </div>
          <button onClick={toggleFullScreen} className="text-white hover:text-gray-200 transition-all duration-300">
            <FontAwesomeIcon icon={faExpand} size="lg" />
          </button>
        </div>

        <div className="flex flex-col flex-grow p-6 overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 bg-white rounded-lg shadow-xl space-y-6">
            {!showResult ? (
              <div className="text-center text-gray-600">
                <p className="text-lg font-medium">I'm ready to help! Ask about cryptocurrencies (e.g., "Compare BTC,ETH") or anything else.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {prevPrompts.map((item, index) => (
                  <div key={index} className="space-y-4 animate__animated animate__fadeIn animate__delay-1s">
                    <div className="flex justify-end">
                      <div className="bg-[#007bff] text-white px-4 py-3 rounded-2xl max-w-3xl shadow-md">
                        <p>{item.query}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <img src={gemini} alt="AI" className="w-12 h-12 rounded-full flex-shrink-0" />
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl shadow-lg text-gray-800 max-w-3xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
                        {loading && index === prevPrompts.length - 1 ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">Thinking...</span>
                            <div className="flex space-x-1">
                              <span className="w-2.5 h-2.5 bg-[#007bff] rounded-full animate-ping"></span>
                              <span className="w-2.5 h-2.5 bg-[#007bff] rounded-full animate-ping delay-200"></span>
                              <span className="w-2.5 h-2.5 bg-[#007bff] rounded-full animate-ping delay-400"></span>
                            </div>
                          </div>
                        ) : (
                          <ReactMarkdown
                            components={{
                              table: ({ node, ...props }) => (
                                <table
                                  className="w-full border-collapse text-sm my-2"
                                  {...props}
                                />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="border border-gray-300 p-2 bg-gray-200 font-semibold text-left"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td
                                  className="border border-gray-300 p-2"
                                  {...props}
                                />
                              ),
                            }}
                          >
                            {item.result}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center bg-white p-4 rounded-2xl shadow-lg mt-6 space-x-4">
            <input 
              type="text" 
              placeholder="Ask about crypto (e.g., 'Compare BTC,ETH')..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSent()}
              className="flex-grow p-4 text-lg border-2 border-gray-300 rounded-xl outline-none focus:border-[#00b8d4] focus:ring-2 focus:ring-[#00b8d4] transition-all duration-300 shadow-md"
            />
            <button onClick={handleClearInput} className="text-gray-500 hover:text-gray-700 transition-all duration-300">
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
            <button onClick={onSent} className="bg-[#007bff] text-white p-3 rounded-lg hover:bg-[#0056b3] transition-all duration-300 shadow-md">
              <FontAwesomeIcon icon={faWandSparkles} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAi;
