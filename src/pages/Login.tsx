import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase/config";

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.7 18.7 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <path d="M1 1l22 22" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setResetMessage("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.log("Login error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect email or password. Please try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setResetMessage("");

    if (!email) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError("Email not found. Please check and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1
            onClick={() => navigate("/")}
            className="text-base font-medium text-gray-900 cursor-pointer mb-6"
          >
            FYP Topic Prompting System
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-sm text-gray-400">
            Login to continue your project journey
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {resetMessage && (
            <div className="mb-5 p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm text-green-500">{resetMessage}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
            />
          </div>

          {/* Password with show/hide toggle */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-11 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <span
              onClick={handleForgotPassword}
              className="text-xs text-gray-400 hover:text-gray-700 cursor-pointer transition"
            >
              Forgot password?
            </span>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>

        <p className="text-center text-sm text-gray-400 mt-2">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-gray-900 font-medium cursor-pointer hover:underline"
          >
            Create one here
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;