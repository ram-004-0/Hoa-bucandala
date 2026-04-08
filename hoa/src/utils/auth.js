import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startAutoLogout } from "../../../backend/utils/auth.js"; // make sure path is correct

const API_URL = "http://localhost:5000/api";

const ResidentCard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: "RESIDENT",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      // Store token & role
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "RESIDENT");

      // Auto logout after token expiry
      startAutoLogout(data.expiresIn || 3600); // optional: backend can return expiry in seconds

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Server unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Resident Login</h1>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded-lg"
          placeholder="resident@example.com"
        />
      </div>

      <div>
        <label className="block mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded-lg"
          placeholder="Enter your password"
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-[#00704e] text-white w-full p-3 rounded-xl mt-2 hover:bg-[#016446] disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default ResidentCard;
