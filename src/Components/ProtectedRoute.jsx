import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../../Context/UserContext"; // Import the User Context

const ProtectedRoute = ({ children }) => {
  const { uid } = useUser(); // Get login state

  return uid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
