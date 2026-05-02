import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { AlertCircle, MapPin, Calendar, Loader2 } from "lucide-react";

// Updated: Base URL without the /api suffix to prevent doubling
const API_URL = "https://hoa-camellabucandalav-production.up.railway.app";

const ReportUncollected = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    missedDate: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: Prevent future dates
    const selectedDate = new Date(formData.missedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return alert("You cannot report a missed pickup for a future date.");
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      // Fixed URL: Concatenates correctly to /api/reports/waste-report
      const response = await fetch(`${API_URL}/api/reports/waste-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: "Uncollected Garbage",
          location: formData.location,
          description: `Missed Date: ${formData.missedDate}. ${formData.description}`,
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
            We've notified the waste management team. They will re-verify your
            street shortly.
          </p>
          <Link
            to="/wastecollection"
            className="mt-6 inline-block bg-[#00704e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005a3e] transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Uncollected Garbage</h1>
          <p className="opacity-90">Report a missed pickup for your address</p>
        </div>
      </div>

      <div className="m-10 max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <p className="text-sm text-red-800 italic">
            <strong>Note:</strong> Pickup reports are only accepted for current
            or past dates.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-3xl p-8 space-y-6 border border-gray-100"
        >
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              Location / Block & Lot
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <input
                required
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g. Block 12, Lot 4"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
              />
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Missed Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <input
                required
                type="date"
                // Prevent selecting future dates in the browser picker
                max={new Date().toISOString().split("T")[0]}
                value={formData.missedDate}
                onChange={(e) =>
                  setFormData({ ...formData, missedDate: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] outline-none"
              />
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Additional Notes
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., bin was outside but truck skipped the street"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] outline-none"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00704e] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#005a3e] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              "Submit Report"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportUncollected;
