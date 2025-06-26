// frontend/src/components/QuizList.jsx
import React from 'react';

const QuizList = ({ quizzes, onStartQuiz }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Quizzes</h2>
      {quizzes.length === 0 ? (
        <p className="text-gray-600">No quizzes available. Complete your current level to unlock more!</p>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li
              key={quiz.quiz_id}
              onClick={() => onStartQuiz(quiz)}
              className="p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition"
            >
              <p className="text-lg font-medium">{quiz.title}</p>
              <p className="text-sm text-gray-600">Level {quiz.level} | Reward: ${quiz.reward_points}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuizList;