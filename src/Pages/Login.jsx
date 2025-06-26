import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { auth, googleProvider } from "../auth/firebase";
import { signInWithRedirect, getRedirectResult } from "firebase/auth";
import Sidebar from "../Components/Sidebar";
import { useUser } from "../../Context/UserContext";
import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "https://backendcrypto.onrender.com";

// Function to get cookie value, parse to JSON, and provide default if missing
const getCookie = (name, defaultValue = null) => {
  try {
    const cookieValue = Cookies.get(name);
    return cookieValue ? JSON.parse(cookieValue) : defaultValue;
  } catch (error) {
    console.error(`Error parsing cookie ${name}:`, error);
    return defaultValue;
  }
};

const Login = () => {
  const { setEmail, setName, setUid } = useUser();
  const navigate = useNavigate();

  const [email, setLocalEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle redirect result after Google Sign-In
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const user = result.user;
          console.log("Google Sign-In Success:", user);

          setUid(user.uid);
          setEmail(user.email);
          setName(user.displayName);

          console.log("Sending request to backend:", {
            user_id: user.uid,
            username: user.displayName,
            email: user.email,
          });
          const response = await axios.post(`${API_BASE_URL}/api/user/google-login`, {
            user_id: user.uid,
            username: user.displayName,
            email: user.email,
          });
          console.log("Backend Response:", response.data);

          Cookies.set("token", JSON.stringify(response.data.token), { expires: 7 });
          navigate("/");
        }
      } catch (error) {
        console.error("Google Sign-In Error:", {
          message: error.message,
          code: error.code,
          details: error,
        });
        setMessage(`Google Sign-In Failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, [navigate, setEmail, setName, setUid]);

  // Google Sign-In handler using redirect
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      console.log("Initiating Google Sign-In with Redirect");
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google Sign-In Error:", {
        message: error.message,
        code: error.code,
        details: error,
      });
      setMessage(`Google Sign-In Failed: ${error.message}`);
      setLoading(false);
    }
  };

  // Email/password login handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setEmail(email);
        setUid(data.user_id);
        setName(data.username);

        Cookies.set("token", JSON.stringify(data.token), { expires: 7 });
        Cookies.set("user_id", JSON.stringify(data.user_id), { expires: 7 });
        Cookies.set("username", JSON.stringify(data.username), { expires: 7 });

        setMessage("Login successful!");
        navigate("/");
      } else {
        setMessage(response.data.message || "Login failed due to server error.");
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response ? error.response.data : null,
        status: error.response ? error.response.status : null,
      });

      if (error.response) {
        setMessage(error.response.data.message || "Invalid email or password.");
      } else if (error.request) {
        setMessage("Network error. Please check your connection and try again.");
      } else {
        setMessage("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="flex items-center justify-center w-full min-h-screen bg-white">
        <div className="bg-[#1E3A8A] p-8 rounded-2xl shadow-lg w-96 text-white">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome Back</h2>
          <p className="text-white text-xl text-center mb-6">Sign in to your account</p>

          {message && <p className="text-center text-red-500 mb-2">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setLocalEmail(e.target.value)}
                className="w-full p-3 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-black bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex justify-between items-center mb-4">
              <Link to="/forgot-password" className="text-purple-400 hover:text-purple-500 text-sm">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 font-semibold py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
              disabled={loading}
            >
              <FcGoogle size={24} />
              <span>{loading ? "Processing..." : "Sign in with Google"}</span>
            </button>
          </div>

          <p className="text-center text-white mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-400 hover:text-purple-500">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;