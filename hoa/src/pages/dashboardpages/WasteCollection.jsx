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
  CalendarDays,
  Clock,
} from "lucide-react";
import WasteImage from "../../assets/wastebg.png";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const WasteCollection = () => {
  const [notification, setNotification] = useState({
    isCollectionDay: false,
    currentDayName: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ description: "", location: "" });

  useEffect(() => {
    const checkSchedule = () => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const now = new Date();
      const dayIndex = now.getDay();
      const collectionDays = [1, 5]; // Mon and Fri

      setNotification({
        isCollectionDay: collectionDays.includes(dayIndex),
        currentDayName: days[dayIndex],
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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error: Invalid JSON response");
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
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10">
          <Link to="/home">
            <ArrowLeftIcon className="h-10 w-10 mb-4 cursor-pointer text-white hover:scale-110 transition-transform" />
          </Link>
          <h1 className="font-black text-4xl tracking-tight uppercase">
            Waste Management
          </h1>
          <p className="opacity-90 font-medium tracking-wide">
            Camella Bucandala Phase 5 Monitoring
          </p>
        </div>
      </div>
      <br />
      <br />
      <br />

      <div className="m-10 flex flex-col gap-8 max-w-4xl mx-auto -mt-16 relative z-20">
        {/* --- SCHEDULE OVERVIEW (MONDAY & FRIDAY) --- */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="text-[#00704e]" size={24} />
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
              Weekly Collection Schedule
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monday Card */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all ${notification.currentDayName === "Monday" ? "border-[#00704e] bg-green-50/50" : "border-gray-50 bg-gray-50/30"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-2xl text-gray-800">
                  Monday
                </span>
                {notification.currentDayName === "Monday" && (
                  <span className="bg-[#00704e] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    Today
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <Clock size={16} /> 7:00 AM - 12:00 PM
              </div>
              <p className="mt-4 text-xs font-medium text-gray-400 leading-relaxed">
                Regular household waste collection for all blocks in Phase 5.
              </p>
            </div>

            {/* Friday Card */}
            <div
              className={`p-6 rounded-3xl border-2 transition-all ${notification.currentDayName === "Friday" ? "border-[#00704e] bg-green-50/50" : "border-gray-50 bg-gray-50/30"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-black text-2xl text-gray-800">
                  Friday
                </span>
                {notification.currentDayName === "Friday" && (
                  <span className="bg-[#00704e] text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">
                    Today
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                <Clock size={16} /> 7:00 AM - 12:00 PM
              </div>
              <p className="mt-4 text-xs font-medium text-gray-400 leading-relaxed">
                Regular household waste collection for all blocks in Phase 5.
              </p>
            </div>
          </div>

          {/* Current Status Banner */}
          {notification.isCollectionDay && (
            <div className="mt-6 flex items-center gap-4 bg-amber-50 border border-amber-100 p-5 rounded-2xl animate-pulse">
              <Trash2 className="h-6 w-6 text-amber-600" />
              <p className="text-sm font-black text-amber-900 tracking-tight">
                Active: The collection truck is currently in the neighborhood.
              </p>
            </div>
          )}
        </section>

        {/* --- REPORTING ACTION --- */}
        <section>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full shadow-xl rounded-[2.5rem] p-10 grid grid-cols-[15%_70%_15%] bg-white hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-100 items-center text-left group"
            >
              <div className="bg-red-100 rounded-3xl p-5 w-20 h-20 flex items-center justify-center transition-transform group-hover:scale-110">
                <AlertCircle className="text-red-600 w-10 h-10" />
              </div>
              <div className="pl-8">
                <h1 className="font-black text-gray-800 text-2xl tracking-tighter uppercase">
                  Report Uncollected
                </h1>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Direct alert to HOA Admin
                </p>
              </div>
              <ArrowRightIcon className="h-10 w-10 ml-auto text-gray-200 group-hover:text-red-600 transition-colors" />
            </button>
          ) : (
            <div className="bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 animate-in slide-in-from-top duration-300">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-black text-3xl text-gray-800 tracking-tighter italic uppercase">
                  File Report
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 font-black hover:text-red-500 uppercase text-xs tracking-widest transition-colors"
                >
                  Close
                </button>
              </div>

              {success ? (
                <div className="bg-green-50 text-green-700 p-10 rounded-[2rem] flex flex-col items-center text-center gap-4">
                  <CheckCircle2 className="w-16 h-16" />
                  <p className="font-black text-xl uppercase">
                    Report Filed Successfully!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReport} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Exact Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-5 h-6 w-6 text-gray-400" />
                      <input
                        required
                        placeholder="e.g. Blk 5 Lot 2"
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-[1.5rem] py-5 pl-14 pr-6 outline-none focus:border-[#00704e] focus:bg-white transition-all font-bold text-gray-700"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                      Description
                    </label>
                    <textarea
                      required
                      placeholder="Provide details about the uncollected trash..."
                      className="w-full bg-gray-50 border-2 border-gray-50 rounded-[1.5rem] p-6 outline-none focus:border-[#00704e] focus:bg-white transition-all font-bold text-gray-700 h-40 resize-none"
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
                    className="w-full bg-[#00704e] text-white font-black py-6 rounded-[1.5rem] hover:bg-[#005a3e] shadow-2xl shadow-green-900/30 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                    <span className="uppercase tracking-widest">
                      {loading ? "Processing..." : "Submit to HOA"}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </section>

        {/* --- HISTORY DASHBOARD --- */}
        <Link to="/wastecollection/my-history" className="group">
          <div className="shadow-xl rounded-[2.5rem] p-8 grid grid-cols-[15%_70%_15%] bg-[#00704e] text-white hover:bg-[#005a3e] hover:translate-y-[-4px] transition-all items-center">
            <div className="bg-white/10 rounded-2xl p-5 w-16 h-16 flex items-center justify-center">
              <History className="w-8 h-8" />
            </div>
            <div className="pl-6">
              <h1 className="font-black text-xl tracking-tight uppercase">
                My Report History
              </h1>
              <p className="text-xs opacity-70 font-bold uppercase tracking-widest mt-1">
                Track pending and resolved reports
              </p>
            </div>
            <ArrowRightIcon className="h-8 w-8 ml-auto opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WasteCollection;
