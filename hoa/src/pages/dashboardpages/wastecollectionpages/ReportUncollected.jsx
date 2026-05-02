import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { AlertCircle, MapPin, Calendar, Loader2, Info } from "lucide-react";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app";

const ReportUncollected = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    missedDate: new Date().toISOString().split("T")[0], // Defaults to today
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation: Prevent future dates
    const selectedDate = new Date(formData.missedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return alert(
        "Error: You cannot report a missed pickup for a future date.",
      );
    }

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
          reportType: "Uncollected Garbage",
          location: formData.location,
          description: `${isUrgent ? "[HIGH URGENCY] " : ""}Missed Date: ${formData.missedDate}. ${formData.description}`,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-green-100">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Report Filed</h2>
          <p className="text-gray-600 mt-2">
            We've notified the team. Thank you for reporting!
          </p>
          <Link
            to="/wastecollection"
            className="mt-6 inline-block bg-[#00704e] text-white px-8 py-3 rounded-xl font-bold"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#00704e] h-40 flex items-center px-10 text-white gap-6">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 hover:opacity-80 transition-opacity" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Uncollected Garbage</h1>
          <p className="opacity-90 font-medium">
            Let us know if your street was skipped
          </p>
        </div>
      </div>

      <div className="m-10 max-w-2xl mx-auto space-y-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-3xl p-8 space-y-6 border border-gray-100"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location / Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Phase 1, Block 5, Lot 2"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Missed Date
                </label>
                <input
                  required
                  type="date"
                  max={new Date().toISOString().split("T")[0]} // Prevents future date selection
                  value={formData.missedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, missedDate: e.target.value })
                  }
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`w-full py-4 rounded-2xl font-bold border-2 transition-all ${isUrgent ? "bg-red-50 border-red-500 text-red-700" : "bg-gray-50 border-gray-100 text-gray-400"}`}
                >
                  {isUrgent ? "⚠️ High Urgency Set" : "Mark as Urgent?"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="e.g., The truck passed by but didn't pick up my bin."
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00704e] text-white font-black py-5 rounded-2xl shadow-lg hover:shadow-[#00704e]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              "SUBMIT REPORT"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportUncollected;
