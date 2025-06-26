import React from 'react';
import { useUser } from '../../Context/UserContext';

const WelcomeMsg = () => {
  const { name, email } = useUser();

  return (
    <div className="bg-white shadow-md rounded-xl px-6 py-4 w-full max-w-md">
      <h1 className="text-2xl font-bold font-[Poppins] text-indigo-700">
        👋 Welcome, {name || "Crypto Explorer"}!
      </h1>
      <p className="mt-1 text-sm text-gray-600 font-mono">
        {email || "your@email.com"}
      </p>
    </div>
  );
};

export default WelcomeMsg;
