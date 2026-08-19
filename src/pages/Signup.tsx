import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

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

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName,
        email,
        createdAt: new Date().toISOString()
      });

      navigate("/dashboard");
    } catch (err: any) {
      console.log("Full error:", err);
      console.log("Error code:", err.code);
      console.log("Error message:", err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please login.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
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
            Create your account
          </h2>
          <p className="text-sm text-gray-400">
            Start your personalized project topic journey
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
            />
          </div>

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
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 pr-11 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
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

          {/* Confirm Password with show/hide toggle */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 pr-11 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

        </div>

        <p className="text-center text-sm text-gray-400 mt-2">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-gray-900 font-medium cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>

      </div>
    </div>
  );
};

export default Signup;