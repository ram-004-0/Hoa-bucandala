import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { Trash2, MapPin, CheckCircle, Loader2 } from "lucide-react";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app";

const ReportOverflow = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("Moderate");
  const [formData, setFormData] = useState({
    location: "",
    description: "",
  });

  const quickLocations = [
    "Main Gate",
    "Clubhouse",
    "Block 1 Park",
    "Basketball Court",
  ];

  const handleSendAlert = async () => {
    if (!formData.location) return alert("Please specify the location");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/reports/waste-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: "Overflowing Bins",
          location: formData.location,
          description: `Severity: ${severity}. Reported on: ${new Date().toLocaleDateString()}. ${formData.description}`,
        }),
      });

      if (response.ok) setIsSuccess(true);
    } catch (error) {
      console.error("Alert error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-orange-100">
          <CheckCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Alert Received</h2>
          <p className="text-gray-600 mt-2">Maintenance has been notified.</p>
          <Link
            to="/wastecollection"
            className="mt-6 inline-block bg-[#00704e] text-white px-8 py-3 rounded-xl font-bold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#00704e] h-40 flex items-center px-10 text-white gap-6">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 cursor-pointer hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Overflowing Bins</h1>
          <p className="opacity-90">
            Report community bins that need attention
          </p>
        </div>
      </div>

      <div className="m-10 max-w-2xl mx-auto space-y-6">
        <div className="bg-white shadow-xl rounded-3xl p-8 border border-gray-100 space-y-6">
          <div className="flex flex-wrap gap-2">
            {quickLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => setFormData({ ...formData, location: loc })}
                className="px-4 py-2 bg-gray-100 hover:bg-[#00704e] hover:text-white rounded-full text-xs font-bold transition-all"
              >
                {loc}
              </button>
            ))}
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Specify Bin Location (e.g. Block 2 Side Street)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSeverity("Moderate")}
              className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${severity === "Moderate" ? "border-orange-500 bg-orange-50 text-orange-700" : "border-gray-50 bg-gray-50 text-gray-400"}`}
            >
              MODERATE OVERFLOW
            </button>
            <button
              type="button"
              onClick={() => setSeverity("Critical")}
              className={`py-4 rounded-2xl border-2 font-black text-xs transition-all ${severity === "Critical" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-50 bg-gray-50 text-gray-400"}`}
            >
              CRITICAL / SPILLING
            </button>
          </div>

          <textarea
            rows="4"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Issue Details (e.g., bin is knocked over, smell is strong)"
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400"
          ></textarea>

          <button
            onClick={handleSendAlert}
            disabled={loading}
            className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              "SEND ALERT TO MAINTENANCE"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportOverflow;
