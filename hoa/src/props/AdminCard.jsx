import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const AdminCard = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
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
        role: "ADMIN",
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      navigate("/admin");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Server unreachable. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Admin Login</h1>
      <div>
        <label className="block mb-1 text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded-lg border-gray-400 text-gray-900"
          placeholder="admin@example.com"
        />
      </div>
      <div>
        <label className="block mb-1 text-gray-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded-lg border-gray-400 text-gray-900"
          placeholder="Enter your password"
        />
      </div>
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      <button
        onClick={handleLogin}
        disabled={loading}
        className="bg-[#00704e] text-white w-full p-3 rounded-xl mt-2 hover:bg-[#016446] disabled:opacity-50 transition-colors"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
};

export default AdminCard;
