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

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

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

      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      // --- FIX STARTS HERE ---
      // Store token
      localStorage.setItem("token", data.token);

      // Store user object so GuardDashboard.js can read user.role
      const userObj = {
        role: data.role,
        email: email.trim(),
      };
      localStorage.setItem("user", JSON.stringify(userObj));
      // --- FIX ENDS HERE ---

      if (data.expiresIn) {
        startAutoLogout(data.expiresIn);
      }

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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#00704e] w-full rounded-xl h-12 text-white font-bold hover:bg-[#016446] transition-all shadow-lg disabled:opacity-50 active:scale-95"
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AuthCard;
