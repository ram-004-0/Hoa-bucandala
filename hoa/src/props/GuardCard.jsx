import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAutoLogout } from "../../../backend/utils/auth.js"; // Ensure path is correct

// Correct: A full, absolute URL
const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const GuardCard = () => {
  const navigate = useNavigate();

  // State Management
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    // Basic Validation
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim(),
        password: password.trim(),
        role: "GUARD", // Explicitly set role for Guards
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
        setError(data.message || "Invalid credentials");
        return;
      }

      // ✅ Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      // ✅ Start auto-logout timer
      if (data.expiresIn) {
        startAutoLogout(data.expiresIn);
      }

      // ✅ Redirect to Guard Dashboard
      navigate("/guard");
    } catch (err) {
      console.error("GUARD LOGIN ERROR:", err);
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4 text-[#3c3c3c]">
        Guard Login
      </h1>

      <div className="mb-4">
        <label className="block text-[#3c3c3c] mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full rounded-md p-2 border-gray-300 text-gray-700 outline-none focus:ring-2 focus:ring-green-400"
          placeholder="guard@hoa.com"
        />
      </div>

      <div className="mb-6">
        <label className="block text-[#3c3c3c] mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full rounded-md p-2 border-gray-300 text-gray-700 outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Enter your password"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-[#00704e] w-full rounded-3xl h-12 text-white hover:bg-[#016446] transition-colors disabled:opacity-50 active:scale-95"
      >
        {loading ? "Verifying..." : "Login"}
      </button>
    </div>
  );
};

export default GuardCard;
