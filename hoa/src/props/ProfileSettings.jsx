import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  LockClosedIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    contactNumber: "",
  });

  // 1. Fetch current user data on load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "https://hoa-camellabucandalav-production.up.railway.app/api/me",
          {
            // Assuming you have a /me or profile route
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await res.json();
        if (res.ok) {
          setFormData((prev) => ({
            ...prev,
            contactNumber: data.contact || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch initial profile data");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Password Match Validation
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setMessage({ type: "error", text: "New passwords do not match!" });
      return;
    }

    // Current Password Requirement
    if (formData.newPassword && !formData.currentPassword) {
      setMessage({
        type: "error",
        text: "Current password required to set a new one.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "https://hoa-camellabucandalav-production.up.railway.app/api/update-profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            contactNumber: formData.contactNumber,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        // Clear sensitive fields only
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage({ type: "error", text: data.message || "Update failed." });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Network error. Is the server running?",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-[#00704e] text-white px-6 py-12 shadow-lg rounded-b-[2rem]">
        <div className="max-w-3xl mx-auto flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <ArrowLeftIcon className="h-7 w-7" />
          </button>
          <div>
            <h1 className="font-black text-3xl uppercase tracking-tighter italic">
              Settings
            </h1>
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest mt-1">
              Manage your security & profile
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-20">
        {/* Modernized Feedback Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border transition-all animate-in slide-in-from-top-4 ${
              message.type === "success"
                ? "bg-green-50 border-green-100 text-green-800"
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="font-black text-xs uppercase tracking-widest">
              {message.text}
            </span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Section: Personal Info */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-100 p-2 rounded-xl">
                <UserIcon className="w-5 h-5 text-[#00704e]" />
              </div>
              <h2 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em]">
                Personalization
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Current Contact Number
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                placeholder="e.g. 0917 123 4567"
                className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 font-bold transition-all text-gray-700"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section: Security */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-100 p-2 rounded-xl">
                <LockClosedIcon className="w-5 h-5 text-[#00704e]" />
              </div>
              <h2 className="font-black text-gray-800 uppercase text-xs tracking-[0.2em]">
                Security Access
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold"
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-green-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    className="w-full p-4 bg-green-50/30 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold"
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-green-700">
                    Verify Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    className="w-full p-4 bg-green-50/30 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full font-black py-5 rounded-[1.5rem] shadow-xl transition-all uppercase text-sm tracking-widest active:scale-[0.98] ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#00704e] text-white hover:bg-green-800 hover:shadow-green-900/20"
            }`}
          >
            {loading ? "Updating Account..." : "Confirm & Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
