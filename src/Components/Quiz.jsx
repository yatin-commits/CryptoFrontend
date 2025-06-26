import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../Context/UserContext';

const Quiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { uid } = useUser();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizId || isNaN(parseInt(quizId))) {
      setError('Invalid quiz ID!');
      setLoading(false);
      return;
    }
    if (!uid) {
      setError('Please log in to take the quiz!');
      setLoading(false);
      return;
    }

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`https://backendcrypto.onrender.com/api/quizzes/${quizId}/questions`);
        setQuestions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz questions. Try again!');
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [quizId, uid]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (Object.keys(answers).length !== questions.length) {
      setError('Please answer all questions before submitting!');
      return;
    }

    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.question_id,
        user_answer: answers[q.question_id] || '',
      }));

      const response = await axios.post(`https://backendcrypto.onrender.com/api/quizzes/${quizId}/submit`, {
        user_id: uid,
        answers: formattedAnswers,
      });

      navigate('/quiz-result', { state: response.data });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz. Try again!');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-2xl text-gray-600 animate-pulse">Loading quiz...</div>;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-4 py-10">
      <h2 className="text-4xl font-extrabold text-indigo-800 text-center mb-10 animate-fade-in">Quiz {quizId}</h2>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Instructions */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-lg p-6 space-y-4 border border-indigo-200">
          <h3 className="text-2xl font-bold text-indigo-700">Instructions</h3>
          <ul className="list-disc pl-5 text-gray-700 space-y-2 text-sm">
            <li>Select one answer per question.</li>
            <li>Answer all questions to submit.</li>
            <li>Earn rewards for perfect scores!</li>
            <li>You can retry as many times as you like.</li>
          </ul>
        </div>

        {/* Quiz Questions */}
        <div className="md:col-span-3 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {questions.map((q, index) => (
              <div key={q.question_id} className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 transition-all duration-300 hover:shadow-xl">
                <p className="text-lg font-semibold text-gray-800 mb-4">Q{index + 1}. {q.question_text}</p>
                <div className="grid gap-3">
                  {['A', 'B', 'C', 'D'].map(option => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-indigo-700 transition-colors">
                      <input
                        type="radio"
                        name={`question-${q.question_id}`}
                        value={option}
                        checked={answers[q.question_id] === option}
                        onChange={() => handleAnswerChange(q.question_id, option)}
                        className="accent-indigo-600 w-5 h-5"
                      />
                      <span>{q[`option_${option.toLowerCase()}`]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="text-center">
              <button
                type="submit"
                disabled={questions.length === 0}
                className="bg-indigo-600 text-white px-8 py-3 rounded-full text-lg font-medium shadow hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50"
              >
                Submit Quiz
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
