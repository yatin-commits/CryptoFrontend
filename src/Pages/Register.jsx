import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // Unique ID generate karne ke liye
import { useUser } from "../../Context/UserContext"; // Global user context use karne ke liye

const API_BASE_URL = "https://backendcrypto.onrender.com"; // Backend API ka base URL

const Register = () => {
  // Global context se values aur functions le rahe hain
  const { name, setName, setEmail, setUid } = useUser();

  // Local states (component ke andar ke data) define kiye gaye hain
  const [fullName, setFullName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(false); // OTP button disable karne ke liye
  const navigate = useNavigate(); // Page navigation ke liye

  // OTP bhejne ka function
  const handleSendOTP = async () => {
    if (!tempEmail) {
      setMessage("Please enter your email first.");
      return;
    }

    if (otpCooldown) return; // Agar cooldown chal raha hai toh OTP dobara nahi bhejenge

    try {
      setLoading(true); // Loader dikhane ke liye
      setOtpCooldown(true); // Button disable kar diya
      const response = await axios.post(`${API_BASE_URL}/api/send-otp`, { email: tempEmail });
      setMessage(response.data.message); // Server ka message show karna

      // 60 second ke liye cooldown lagaya gaya hai
      setTimeout(() => setOtpCooldown(false), 60000);
    } catch (error) {
      // Agar backend se response aaya toh uska message show karo, warna default error
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false); // Loader band kar diya
    }
  };

  // Register button click hone par ye function chalega
  const handleRegister = async (e) => {
    e.preventDefault(); // Page reload hone se rokne ke liye

    // Sare fields fill kiye gaye hain ya nahi, ye check kar rahe hain
    if (!fullName || !tempEmail || !otp || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    // Password match kar raha hai ya nahi
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    // Password ki length check kar rahe hain
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    const uniqueId = uuidv4(); // Har user ke liye unique ID bana rahe hain

    try {
      setLoading(true); // Register hone tak loading dikhayenge

      // API call to register the user
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        user_id: uniqueId,
        username: fullName,
        email: tempEmail,
        otp,
        password,
      });

      // Register hone ke baad token local storage me save karo
      setMessage(response.data.message);
      localStorage.setItem("token", response.data.token);

      // Global context update kar rahe hain
      setName(fullName);
      setEmail(tempEmail);
      setUid(uniqueId);

      navigate("/"); // Home page pe redirect kar rahe hain
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false); // Loader band kar diya
    }
  };

  return (
    <>
      <Sidebar />
      <div className="flex items-center p-4 justify-center w-full min-h-screen bg-white">
        <div className="bg-[#1E3A8A] p-8 rounded-2xl shadow-lg w-96 text-white">
          <h2 className="text-2xl font-semibold text-center mb-4">Create an Account</h2>

          {/* Agar koi message hai (error ya success), toh show karo */}
          {message && <p className="text-center text-red-500 mb-2">{message}</p>}

          {/* Register form */}
          <form onSubmit={handleRegister}>
            {/* Full name input */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email + OTP field */}
            <div className="mb-4 flex space-x-2">
              <div className="w-2/3">
                <label className="block text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  required
                />
              </div>

              {/* OTP field and Send OTP button */}
              <div className="w-1/3 flex flex-col">
                <label className="block text-white mb-1">OTP</label>
                <input
                  type="text"
                  className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`mt-1 text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md transition ${
                    otpCooldown ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={handleSendOTP}
                  disabled={loading || otpCooldown}
                >
                  {loading ? "Sending..." : otpCooldown ? "Wait 60s" : "Send OTP"}
                </button>
              </div>
            </div>

            {/* Password field */}
            <div className="mb-4">
              <label className="block text-white mb-1">Password</label>
              <input
                type="password"
                className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm password field */}
            <div className="mb-4">
              <label className="block text-white mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full p-3 bg-white text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Register button */}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Link to login page */}
          <p className="text-center text-white mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 hover:text-purple-500">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
