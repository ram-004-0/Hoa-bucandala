import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ClockIcon,
  PlusIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
import VisitorRegistered from "./visitorregistration_modal/VisitorRegistered";
import VisitorPass from "../dashboardpages/visitorregistration_modal/VisitorPass";
import VisitorImage from "../../assets/visitorbg.png";

const VisitorRegistration = () => {
  const API_URL = "https://hoa-bucandala.onrender.com/api";

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const currentTime =
    today.getHours().toString().padStart(2, "0") +
    ":" +
    today.getMinutes().toString().padStart(2, "0");

  // UI State
  const [activeTab, setActiveTab] = useState("register");
  const [showRegistered, setShowRegistered] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data State
  const [history, setHistory] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [formData, setFormData] = useState({
    visitorName: "",
    contactNumber: "",
    purpose: "",
    date: minDate,
    time: "",
    phase: "",
    block: "",
    lot: "",
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/visitors/my-history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  const handleChange = (e) => {
    const { id, value } = e.target;

    // --- START PHONE VALIDATION ---
    if (id === "contactNumber") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [id]: numericValue }));
      return;
    }
    // --- END PHONE VALIDATION ---

    if (id === "date" && value === minDate) {
      if (formData.time && formData.time < currentTime) {
        setFormData((prev) => ({ ...prev, date: value, time: "" }));
        return;
      }
    }

    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phPhoneRegex = /^09\d{9}$/;
    if (formData.contactNumber && !phPhoneRegex.test(formData.contactNumber)) {
      alert("Invalid format. Use 09XXXXXXXXX (11 digits).");
      return;
    }

    // Final Validation Check
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime < new Date()) {
      alert("You cannot schedule a visit in the past.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/visitors/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        const newVisitor = { ...formData, id: data.visitorId };
        setSelectedVisitor(newVisitor);
        setShowRegistered(true);
        setFormData({
          visitorName: "",
          contactNumber: "",
          purpose: "",
          date: minDate,
          time: "",
          phase: "",
          block: "",
          lot: "",
        });
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const openPassFromHistory = (v) => {
    setSelectedVisitor({
      id: v.visitor_id,
      visitorName: v.visitor_name,
      contactNumber: v.contact_number,
      purpose: v.purpose_of_visit,
      date: v.expected_date,
      time: v.expected_time,
      address: v.address_to_visit,
    });
    setShowPass(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${VisitorImage})` }}
      >
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <div className="relative z-10">
            <h1 className="font-bold text-4xl">Visitor Management</h1>
            <p className="opacity-80 mt-1">
              Register visitors or view past passes
            </p>
          </div>
          <Link to="/home" className="relative z-10">
            <ArrowLeftIcon className="h-10 w-10 cursor-pointer hover:scale-110 transition-transform" />
          </Link>
        </div>
        <br />
        <br />
        <br />
        <div className="max-w-5xl mx-auto w-full flex gap-4 mt-8 relative z-10">
          <button
            onClick={() => setActiveTab("register")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 font-semibold transition-all ${
              activeTab === "register"
                ? "bg-white text-[#00704e]"
                : "bg-white/40 hover:bg-white/50"
            }`}
          >
            <PlusIcon className="w-5 h-5" /> New Entry
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2 rounded-full flex items-center gap-2 font-semibold transition-all ${
              activeTab === "history"
                ? "bg-white text-[#00704e]"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <ClockIcon className="w-5 h-5" /> My History
          </button>
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-10">
        {activeTab === "register" ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-6"
          >
            <div className="shadow-md rounded-xl p-8 bg-white flex flex-col gap-6 w-full max-w-lg border border-gray-100">
              <h2 className="font-bold text-2xl text-gray-800">
                Visitor Information
              </h2>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Visitor Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={handleChange}
                    className="border rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Full Name"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    inputMode="numeric" // Triggers numeric keypad on mobile
                    id="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    maxLength={11} // Optional: limits length to standard 11 digits
                    className="border rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="09..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="date"
                      id="date"
                      min={minDate}
                      value={formData.date}
                      onChange={handleChange}
                      className="border rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-700">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="time"
                      id="time"
                      min={formData.date === minDate ? currentTime : "00:00"}
                      value={formData.time}
                      onChange={handleChange}
                      className="border rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Purpose <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    id="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="border rounded-lg p-2.5 mt-2 outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="Reason for visit"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <input
                      required
                      type="text"
                      id="phase"
                      placeholder="Phase"
                      value={formData.phase}
                      onChange={handleChange}
                      className="border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <input
                      required
                      type="text"
                      id="block"
                      placeholder="Block"
                      value={formData.block}
                      onChange={handleChange}
                      className="border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <input
                      required
                      type="text"
                      id="lot"
                      placeholder="Lot"
                      value={formData.lot}
                      onChange={handleChange}
                      className="border rounded-lg p-2.5 focus:ring-2 focus:ring-green-400 outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-[#00704e] text-white font-bold rounded-xl mt-4 hover:bg-green-800 transition-all shadow-lg active:scale-95"
              >
                Register Visitor
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 text-center py-10 text-gray-500">
                Loading your visitors...
              </div>
            ) : history.length > 0 ? (
              history.map((v) => (
                <div
                  key={v.visitor_id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {v.visitor_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(v.expected_date).toLocaleDateString()} at{" "}
                      {v.expected_time}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          v.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {v.status}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        #{v.visitor_id}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => openPassFromHistory(v)}
                    className="bg-green-50 text-[#00704e] p-4 rounded-xl hover:bg-[#00704e] hover:text-white transition-all shadow-sm"
                  >
                    <QrCodeIcon className="w-6 h-6" />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-2 bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">
                  No visitor history found.
                </p>
                <button
                  onClick={() => setActiveTab("register")}
                  className="text-[#00704e] font-bold mt-2"
                >
                  Register one now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {showRegistered && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <VisitorRegistered
            visitor={selectedVisitor}
            onViewPass={() => {
              setShowRegistered(false);
              setShowPass(true);
            }}
            onClose={() => setShowRegistered(false)}
          />
        </div>
      )}

      {showPass && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <VisitorPass
            visitor={selectedVisitor}
            onBack={() => {
              setShowPass(false);
              if (activeTab === "register") setShowRegistered(true);
            }}
            onDone={() => setShowPass(false)}
          />
        </div>
      )}
    </div>
  );
};

export default VisitorRegistration;
