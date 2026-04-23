import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import axios from "axios";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const SecurityAlerts = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/guard-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/guard-requests/${id}/status`,
        { status: "RESOLVED" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans antialiased">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#00704e] px-6 py-5 text-white shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/guard")}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-green-300" />
              Security Response Center
            </h1>
            <p className="text-[10px] font-bold opacity-70 uppercase tracking-[0.2em]">
              Real-time Incident Feed
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Gate 1 Active
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#00704e] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black text-xs uppercase tracking-widest">
              Scanning Network...
            </p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-200 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-gray-300 w-10 h-10" />
            </div>
            <h3 className="text-gray-800 font-bold text-lg">
              System Status: Clear
            </h3>
            <p className="text-gray-400 text-sm">
              No active security alerts at this time.
            </p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.request_id}
              className={`group bg-white rounded-[1.5rem] shadow-sm border-t-8 transition-all duration-300 hover:shadow-md ${
                req.status === "PENDING"
                  ? "border-red-500"
                  : "border-gray-300 grayscale-[0.5]"
              }`}
            >
              <div className="p-6">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div
                      className={`p-3 rounded-2xl ${req.priority_level === "URGENT" ? "bg-red-50" : "bg-amber-50"}`}
                    >
                      <AlertTriangle
                        className={`w-6 h-6 ${req.priority_level === "URGENT" ? "text-red-600" : "text-amber-600"}`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Incident Type
                      </span>
                      <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
                        {req.type_name}
                      </h2>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                        req.status === "PENDING"
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(req.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Resident Details
                    </p>
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-4 h-4 text-[#00704e]" />
                      <span className="text-sm font-bold text-slate-800">
                        {req.full_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#00704e]" />
                      <span className="text-sm font-medium text-slate-600">
                        {req.contact}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Location
                    </p>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-1" />
                      <span className="text-sm font-bold text-slate-800 leading-tight">
                        {req.location || "General Area"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Situation Details */}
                <div className="mb-6">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
                    Report Content
                  </p>
                  <div className="bg-white border-l-4 border-[#00704e] p-4 rounded-r-xl">
                    <p className="text-gray-700 text-base leading-relaxed italic">
                      "{req.situation_details}"
                    </p>
                  </div>
                </div>

                {/* Evidence Image */}
                {req.photo_url && (
                  <div className="relative group/img rounded-2xl overflow-hidden border border-gray-200 mb-6">
                    <img
                      src={`https://hoa-camellabucandalav-production.up.railway.app${req.photo_url}`}
                      alt="Evidence"
                      className="w-full h-56 object-cover transition-transform duration-500 group-hover/img:scale-110"
                    />
                    <button
                      onClick={() =>
                        window.open(
                          `https://hoa-camellabucandalav-production.up.railway.app${req.photo_url}`,
                          "_blank",
                        )
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2"
                    >
                      <ExternalLink size={20} /> View Full Detail
                    </button>
                  </div>
                )}

                {/* Actions */}
                {req.status === "PENDING" ? (
                  <button
                    onClick={() => handleResolve(req.request_id)}
                    className="w-full bg-[#00704e] text-white font-black py-4 rounded-2xl shadow-[0_10px_20px_-10px_rgba(0,112,78,0.4)] hover:bg-[#005a3e] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                  >
                    <CheckCircle size={20} />
                    Resolve Incident
                  </button>
                ) : (
                  <div className="text-center py-2 flex items-center justify-center gap-2 text-gray-400 font-bold text-xs uppercase italic">
                    <CheckCircle size={14} /> This issue has been addressed
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
