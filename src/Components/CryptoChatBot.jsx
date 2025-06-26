import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const CryptoChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi! I'm your Crypto Assistant. Ask about cryptocurrencies (e.g., 'Price of BTC'). For comparisons, visit Ask AI.",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("https://backendcrypto.onrender.com/api/crypto-query", {
        query: input,
      });

      const botResponse = response.data.answer || "I couldn't process that request.";
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error in chatbot:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Error fetching response.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform"
        >
          💬 Chat
        </button>
      )}

      {isOpen && (
        <div className="w-96 h-96 rounded-2xl shadow-2xl bg-white border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white p-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Crypto Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-red-200 transition text-xl"
            >
              ✕
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-3 overflow-y-auto bg-gradient-to-b from-white to-blue-50 scrollbar-thin scrollbar-thumb-blue-300">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex mb-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="mr-2 text-xl">🤖</div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-md text-sm ${
                    msg.sender === "user"
                      ? "bg-indigo-100 text-indigo-900 rounded-br-none"
                      : "bg-sky-100 text-sky-900 rounded-bl-none"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === "user" && (
                  <div className="ml-2 text-xl">👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm pl-2">
                <div className="animate-bounce">🤖</div>
                <div className="italic">typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about crypto..."
                className="flex-1 p-2 px-4 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoChatBot;
