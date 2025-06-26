import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { RecoilRoot } from "recoil"; // Uncommented for state management
import ProtectedRoute from "./Components/ProtectedRoute";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Leaderboard from "./Pages/Leaderboard";
import Account from "./Pages/Account";
import Portfolio from "./Pages/Portfolio";
import News from "./Pages/News";
import AskAi from "./Pages/AskAi";
import Register from "./Pages/Register";
import StockDetails from "./Pages/StockDetails";
import AdminPanel from "./Pages/AdminPanel";
import { useUser } from "../Context/UserContext";
import LearningSection from "./Components/LearningSection";
import QuizHub from "./Components/QuizHub";
import QuizResult from "./Components/QuizResult";
import Quiz from "./Components/Quiz";

const App = () => {
  const { uid } = useUser();
  return (
    // <RecoilRoot>
    <>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <div className="flex">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/stock/:symbol" element={<StockDetails />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
            <Route path="/askai" element={<ProtectedRoute><AskAi /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><QuizHub /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/quiz-result" element={<ProtectedRoute><QuizResult /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
      </>
  );
};

export default App;
