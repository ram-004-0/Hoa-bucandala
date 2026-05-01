import React, { useState } from "react";

const AuthCard = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://hoa-camellabucandalav-production.up.railway.app/api/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        // Store the JWT token for other requests
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        // REDIRECT LOGIC: Matching your database ENUMs
        if (data.role === "ADMIN") {
          window.location.href = "/admin";
        } else if (data.role === "GUARD") {
          window.location.href = "/guard";
        } else {
          window.location.href = "/home"; // Default for RESIDENT
        }
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Server error. Please check if backend is running.");
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

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@email.com"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00704e] text-white font-bold py-3 rounded-lg hover:bg-[#005a3e] transition-colors shadow-lg active:transform active:scale-95 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AuthCard;
