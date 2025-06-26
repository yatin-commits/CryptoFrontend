import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const QuizHub = () => {
  const { uid, name, walletBalance, setWalletBalance } = useUser();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [level, setLevel] = useState(1);
  const navigate = useNavigate();


  useEffect(() => {
    if (!uid) {
      setError('Please log in to start your crypto quest!');
      setLoading(false);
      return;
    }

    const fetchQuizzesAndUser = async () => {
      try {
        const [quizResponse, userResponse] = await Promise.all([
          axios.get(`https://backendcrypto.onrender.com/api/quizzes?user_id=${uid}`),
          axios.get(`https://backendcrypto.onrender.com/api/users/${uid}`),
        ]);
        setQuizzes(quizResponse.data);
        setLevel(userResponse.data.level || 1);
        setWalletBalance(Number(userResponse.data.wallet_balance) || 0);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quizzes. Try again!');
        setLoading(false);
      }
    };
    fetchQuizzesAndUser();
  }, [uid, setWalletBalance]);

  if (loading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-2xl text-gray-600 animate-pulse">
        Loading your crypto adventure...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center text-red-500 text-xl mt-0">{error}</div>
      </div>
    );
  }

  return (
   <div className="w-screen bg-black bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-10">
  <div className=" w-full px-4 sm:px-6 lg:px-8">
    <div className="mb-4">
  <button
    onClick={() => navigate("/")}
    className="text-indigo-700 hover:text-white border border-indigo-700 hover:bg-indigo-700 font-medium py-2 px-4 rounded transition"
  >
    ← Back to Market
  </button>
</div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-indigo-700 mb-10 animate-fade-in">
          Crypto Quest Hub
        </h1>

        {/* Welcome Section */}
        <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 mb-10 space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <p className="text-xl">
              Welcome, <span className="font-bold text-indigo-600">{name || 'Crypto Explorer'}</span>!
            </p>
            <div className="flex gap-4 text-lg font-medium">
              <p className="bg-green-100 text-green-700 px-4 py-1 rounded-full">
                Level: <span className="font-semibold">{level}</span>
              </p>
              <p className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full">
                Wallet: <span className="font-semibold">${(Number(walletBalance) || 0).toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* How to Play Section */}
          <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl shadow-inner">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-3">🚀 How to Play</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 text-base leading-relaxed">
              <li>Select a quiz from the list below to challenge your crypto knowledge.</li>
              <li>Get all answers correct to earn up to <span className="font-bold">$600</span> per quiz (once per perfect score).</li>
              <li>Earn perfect scores in 10 quizzes to level up and unlock new challenges.</li>
              <li>Quizzes unlock in sequence—finish one to open the next.</li>
              <li>At level 5 and above, incorrect answers cost you <span className="font-bold text-red-600">$50</span> each!</li>
              <li>View your results to track your performance and learn from mistakes.</li>
            </ul>
          </div>
        </div>

        {/* Quiz List Section */}
        <h2 className="text-3xl font-bold text-indigo-700 mb-6 text-center">Available Quizzes</h2>

        {quizzes?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Link
                key={quiz.quiz_id}
                to={`/quiz/${quiz.quiz_id}`}
                className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-indigo-400"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-700 group-hover:underline">{quiz.title}</h3>
                    <p className="text-gray-600 mt-1">Level {quiz.level} • Attempts: {quiz.attempts}</p>
                  </div>
                  <span className="text-yellow-600 text-lg font-semibold bg-yellow-50 px-3 py-1 rounded-full shadow-sm">
                    ${quiz.reward_points}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-lg mt-6">No quizzes available at the moment. Stay tuned!</p>
        )}
      </div>
    </div>
  );
};

export default QuizHub;