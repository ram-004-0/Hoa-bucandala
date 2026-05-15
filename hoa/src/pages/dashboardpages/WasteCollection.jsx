import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import {
  Trash2,
  AlertCircle,
  History,
  CheckCircle2,
  MapPin,
  Send,
  Loader2,
} from "lucide-react";
import WasteImage from "../../assets/wastebg.png";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const WasteCollection = () => {
  const [notification, setNotification] = useState({
    isCollectionDay: false,
    phase5Completed: false,
  });

  // Reporting Form States
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
  });

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay();
      const collectionDays = [1, 5]; // Mon and Fri

      setNotification({
        isCollectionDay: collectionDays.includes(day),
        phase5Completed: false, // In a real app, fetch this from /api/reports/status
      });
    };
    checkSchedule();
  }, []);

  const handleReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/reports/waste-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: "Uncollected Garbage",
          description: formData.description,
          location: formData.location,
        }),
      });

      // Handle HTML 404 responses safely
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response (Check API URL)");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      setSuccess(true);
      setFormData({ description: "", location: "" });
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 3000);
    } catch (err) {
      alert("Submission error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      {/* Header */}
      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${WasteImage})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10">
          <Link to="/home">
            <ArrowLeftIcon className="h-10 w-10 mb-4 cursor-pointer text-white hover:scale-110 transition-transform" />
          </Link>
          <h1 className="font-black text-4xl tracking-tight">
            Waste Management
          </h1>
          <p className="opacity-90 font-medium">
            Automated monitoring and reporting
          </p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-6 max-w-4xl mx-auto -mt-12 relative z-20">
        {/* --- SCHEDULE STATUS --- */}
        <section className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 ml-1">
            Today's Status
          </h2>

          {notification.isCollectionDay ? (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-100 p-5 rounded-2xl">
              <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-200">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-black text-amber-900">
                  Collection in Progress
                </h3>
                <p className="text-sm text-amber-700">
                  The truck is currently operating in Camella Bucandala.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-5 rounded-2xl italic text-gray-500">
              <Clock className="h-5 w-5" /> No active collections scheduled for
              today.
            </div>
          )}
        </section>

        {/* --- ACTION CARD --- */}
        <section className="space-y-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full shadow-lg rounded-[2rem] p-8 grid grid-cols-[15%_70%_15%] bg-white hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-100 items-center text-left"
            >
              <div className="bg-red-100 rounded-2xl p-4 w-16 h-16 flex items-center justify-center">
                <AlertCircle className="text-red-600 w-8 h-8" />
              </div>
              <div className="pl-6">
                <h1 className="font-black text-gray-800 text-xl tracking-tight">
                  Report Uncollected Garbage
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Notify the HOA Admin immediately
                </p>
              </div>
              <ArrowRightIcon className="h-8 w-8 ml-auto text-gray-200 group-hover:text-red-600" />
            </button>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-gray-100 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-2xl text-gray-800 tracking-tight">
                  File a Report
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-bold hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              {success ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-2xl flex flex-col items-center text-center gap-2">
                  <CheckCircle2 className="w-12 h-12" />
                  <p className="font-black">Report Sent Successfully!</p>
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Precise Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                      <input
                        required
                        placeholder="e.g. Block 12, Lot 4, Phase 5"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                      Details
                    </label>
                    <textarea
                      required
                      placeholder="Describe the situation..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-red-500 transition-all font-bold h-32"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-[#00704e] text-white font-black py-5 rounded-2xl hover:bg-[#005a3e] shadow-xl shadow-green-900/20 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    {loading ? "SENDING..." : "SUBMIT REPORT"}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>

        {/* --- DASHBOARD LINK --- */}
        <Link to="/wastecollection/my-history" className="group">
          <div className="shadow-lg rounded-[2rem] p-8 grid grid-cols-[15%_70%_15%] bg-[#00704e] text-white hover:scale-[1.02] transition-all items-center">
            <div className="bg-white/20 rounded-2xl p-4 w-16 h-16 flex items-center justify-center">
              <History className="w-8 h-8" />
            </div>
            <div className="pl-6">
              <h1 className="font-black text-xl tracking-tight">
                Report Dashboard
              </h1>
              <p className="text-sm opacity-80 font-medium">
                Track your report statuses
              </p>
            </div>
            <ArrowRightIcon className="h-8 w-8 ml-auto text-white/50 group-hover:text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
};

// Simple Clock Icon for the placeholder
const Clock = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default WasteCollection;
