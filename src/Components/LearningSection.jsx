// src/components/LearningHub.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import QuizList from './QuizList';
import Quiz from './Quiz';
import Result from '../Components/QuizResult';

const API_BASE_URL = 'http://your-backend-api.com/api'; // Replace with your API URL
const USER_ID = 'pWIsc4zwErZpXwsf6vrtIRC54o93'; // Replace with dynamic user_id (e.g., from auth context)

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
`;

const Header = styled.h1`
  color: #333;
  text-align: center;
`;

const UserInfo = styled.div`
  margin-bottom: 20px;
  p {
    margin: 5px 0;
    color: #555;
  }
`;

const LearningSection = () => {
  const [user, setUser] = useState({ username: '', level: 1, wallet_balance: 0 });
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user info and quizzes on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch user info
        const userResponse = await axios.get(`${API_BASE_URL}/users/${USER_ID}`);
        setUser(userResponse.data);

        // Fetch quizzes
        const quizzesResponse = await axios.get(`${API_BASE_URL}/quizzes?user_id=${USER_ID}`);
        setQuizzes(quizzesResponse.data);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Start a quiz
  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setResult(null);
  };

  // Handle quiz submission
  const handleQuizSubmit = async (answers) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/quizzes/${currentQuiz.quiz_id}/submit`, {
        user_id: USER_ID,
        answers, // Format: [{ question_id: 1, user_answer: 'B' }, ...]
      });
      setResult(response.data);
      setCurrentQuiz(null);

      // Refresh user info and quizzes
      const userResponse = await axios.get(`${API_BASE_URL}/users/${USER_ID}`);
      setUser(userResponse.data);
      const quizzesResponse = await axios.get(`${API_BASE_URL}/quizzes?user_id=${USER_ID}`);
      setQuizzes(quizzesResponse.data);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error(err);
    }
  };

  // Back to quiz list
  const backToQuizzes = () => {
    setResult(null);
    setCurrentQuiz(null);
  };

  if (loading) return <Container>Loading...</Container>;
  if (error) return <Container>{error}</Container>;

  return (
    <Container>
      <Header>CryptoTrade Learning Hub</Header>
      <UserInfo>
        <p>Username: {user.username}</p>
        <p>Level: {user.level}</p>
        <p>Wallet Balance: ${user.wallet_balance.toFixed(2)}</p>
      </UserInfo>
      {currentQuiz ? (
        <Quiz quiz={currentQuiz} onSubmit={handleQuizSubmit} onCancel={backToQuizzes} />
      ) : result ? (
        <Result result={result} onBack={backToQuizzes} />
      ) : (
        <QuizList quizzes={quizzes} onStartQuiz={startQuiz} />
      )}
    </Container>
  );
};

export default LearningSection;