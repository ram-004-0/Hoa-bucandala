import React, { useState, useEffect } from "react"; // Added useEffect import
import { useNavigate } from "react-router-dom";
import { startAutoLogout } from "../../../backend/utils/auth.js";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const AuthCard = () => {
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * FIX: Moved useEffect to the top level of the component.
   * This checks if the user is already logged in when the page loads.
   */
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      if (role === "ADMIN") navigate("/admin");
      else if (role === "GUARD") navigate("/guard");
      else navigate("/home");
    }
  }, [navigate]);

  // Validation Logic
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Basic & Format Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
      };

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 3. Handle Unauthorized/Errors
      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      // 4. Store Auth Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // 5. Start auto-logout timer
      if (data.expiresIn) {
        startAutoLogout(data.expiresIn);
      }

      // 6. Role-Based Redirection
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "GUARD") {
        navigate("/guard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server unreachable. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 w-105 shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#00704e]">HOA Portal</h2>
        <p className="text-gray-500 mt-2">
          Enter your credentials to access your account
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#3c3c3c] mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className={`w-full p-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all ${
              error && error.toLowerCase().includes("email")
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            required
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-semibold text-[#3c3c3c]">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-[#00704e] font-bold hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            className={`w-full p-3 border text-gray-800 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all ${
              error && error.toLowerCase().includes("password")
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            className="accent-[#00704e] w-4 h-4"
          />
          <label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </label>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded border border-red-100">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#00704e] w-full rounded-xl h-12 text-white font-bold hover:bg-[#016446] transition-all shadow-lg disabled:opacity-50 active:scale-95 flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </div>
  );
};

export default AuthCard;
