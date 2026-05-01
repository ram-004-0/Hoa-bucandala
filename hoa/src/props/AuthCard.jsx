import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAutoLogout } from "../../../backend/utils/auth.js";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const AuthCard = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Mobile fix: Always trim email to remove accidental trailing spaces
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        // If backend fails, show the specific message (e.g., "User not found")
        throw new Error(data.message || "Invalid credentials");
      }

      // 1. Store the token immediately
      localStorage.setItem("token", data.token);

      // 2. Store user data (Ensure data.role exists in your backend response)
      const userObj = {
        role: data.role,
        email: cleanEmail,
      };
      localStorage.setItem("user", JSON.stringify(userObj));

      // 3. Handle auto-logout if applicable
      if (data.expiresIn) {
        startAutoLogout(data.expiresIn);
      }

      // 4. Role-based Navigation
      if (data.role === "ADMIN") {
        navigate("/admin");
      } else if (data.role === "GUARD") {
        navigate("/guard");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      // This catches network errors (server down) AND the throw new Error above
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach server. Check your mobile data/WiFi."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#00704e]">HOA Portal</h2>
        <p className="text-gray-500 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[#3c3c3c] mb-1">
            Email Address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#3c3c3c] mb-1">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#00704e] w-full rounded-xl h-12 text-white font-bold hover:bg-[#016446] transition-all shadow-lg disabled:opacity-50 active:scale-95 flex items-center justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
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
