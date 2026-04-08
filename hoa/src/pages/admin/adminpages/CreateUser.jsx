import React, { useState } from "react";
import { Save, User, X } from "lucide-react";

const API_URL = "http://localhost:5000/api"; // Add /api to match backend

const CreateUser = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    withBalance: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token"); // get JWT from storage

      const response = await fetch(`${API_URL}/residents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // include JWT if route is protected
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          address: formData.address,
          contact: formData.contact,
          has_balance: formData.withBalance,
        }),
      });

      if (!response.ok) {
        const text = await response.text(); // fallback for HTML 404
        console.error("Failed to create resident:", text);
        throw new Error(text || "Failed to create resident");
      }

      const data = await response.json(); // parse JSON only if OK

      alert(`Resident created! Password: ${data.password}`);
      onCreate({
        residentId: data.residentId,
        full_name: formData.name,
        email: formData.email,
        address: formData.address,
        contact: formData.contact,
        has_balance: formData.withBalance,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Network error or invalid request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-[#00704e]" />
          <h2 className="text-xl font-semibold">Create New Resident</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <input
            name="name"
            placeholder="Full Name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="input"
          />
          <textarea
            name="address"
            placeholder="Address"
            required
            value={formData.address}
            onChange={handleInputChange}
            className="input"
          />
          <input
            name="contact"
            placeholder="Contact"
            required
            value={formData.contact}
            onChange={handleInputChange}
            className="input"
          />
          <label className="flex gap-2 items-center">
            <input
              type="checkbox"
              name="withBalance"
              checked={formData.withBalance}
              onChange={handleInputChange}
            />
            Has outstanding balance
          </label>
          <button
            type="submit"
            disabled={loading}
            className={`bg-[#00704e] text-white py-3 rounded-md flex justify-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Save className="h-5 w-5" />
            {loading ? "Creating..." : "Create Resident"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
