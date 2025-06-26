import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../../Context/UserContext';

const QuizResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setWalletBalance } = useUser();

  if (!state)
    return (
      <div className="text-center text-red-500 text-2xl mt-20 font-semibold">
        No result data available!
      </div>
    );

  const {
    score,
    total_points,
    reward_earned,
    total_deduction,
    completed,
    level_up,
    new_level,
    attempts,
    answer_feedback,
  } = state;

  React.useEffect(() => {
    const reward = Number(reward_earned) || 0;
    const deduction = Number(total_deduction) || 0;
    if (reward > 0 || deduction > 0) {
      setWalletBalance((prev) => Number(prev) + reward - deduction);
    }
  }, [reward_earned, total_deduction, setWalletBalance]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 via-blue-50 to-purple-100 px-4 py-8 w-full">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <h2 className="text-4xl font-bold text-center text-indigo-700 animate-fade-in">
          Quiz Results
        </h2>

        {/* Score Card */}
        <div className="bg-white shadow-xl rounded-xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3 text-center md:text-left">
            <p className="text-3xl font-bold">
              Score:{' '}
              <span
                className={
                  score === total_points
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }
              >
                {score} / {total_points}
              </span>
            </p>
            <p className="text-xl">
              Reward Earned:{' '}
              <span className="font-bold text-yellow-600">
                ${Number(reward_earned || 0).toFixed(2)}
              </span>
            </p>
            {total_deduction > 0 && (
              <p className="text-xl">
                Deduction:{' '}
                <span className="font-bold text-red-600">
                  -${Number(total_deduction || 0).toFixed(2)}
                </span>
              </p>
            )}
            <p className="text-lg">Attempts: {attempts}</p>
            {completed ? (
              <p className="text-green-600 font-medium text-lg animate-bounce">
                Perfect Score! 🎉
              </p>
            ) : (
              <p className="text-yellow-600 text-lg">Try again to ace it!</p>
            )}
            {level_up && (
              <p className="text-indigo-600 text-xl font-bold animate-pulse">
                Leveled up to Level {new_level}! 🚀
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 space-y-3 shadow-sm">
            <h3 className="text-xl font-semibold text-indigo-800">
              How It Works
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2 text-base">
              <li>Perfect scores earn you rewards once per quiz.</li>
              <li>
                Level up after 10 perfect quizzes to unlock new challenges.
              </li>
              <li>
                At Level 5+, incorrect answers deduct $50 from your wallet.
              </li>
              <li>Review your answers below to learn and improve.</li>
              <li>Head back to the hub to try another quiz!</li>
            </ul>
          </div>
        </div>

        {/* Answers Section */}
        <div>
          <h3 className="text-3xl font-semibold text-indigo-700 mb-4">
            Your Answers
          </h3>
          {answer_feedback?.length ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {answer_feedback.map((feedback, index) => (
                <div
                  key={feedback.question_id}
                  className={`p-4 rounded-lg shadow-md border ${
                    feedback.is_correct
                      ? 'bg-green-50 border-green-300'
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <p className="text-lg font-semibold text-gray-800">
                    Question {index + 1}
                  </p>
                  <p className="text-gray-700">
                    Your Answer:{' '}
                    <span className="font-bold">{feedback.user_answer}</span>
                  </p>
                  <p
                    className={
                      feedback.is_correct ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {feedback.is_correct
                      ? 'Correct! 🎉'
                      : `Incorrect. Correct Answer: ${feedback.correct_answer}`}
                  </p>
                  {feedback.deduction > 0 && (
                    <p className="text-red-600 mt-1">
                      -${Number(feedback.deduction).toFixed(2)} deducted
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No answer feedback available.
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/learn')}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-full transition-all duration-300"
          >
            Back to Quest Hub
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
