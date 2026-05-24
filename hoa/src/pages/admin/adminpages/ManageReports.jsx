import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Loader2,
  Eye,
  MapPin,
  Calendar,
  Phone,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-bucandala.onrender.com/api";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null); // State for the modal

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/guard-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized or Server Error");
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200 transition-transform hover:-translate-x-1" />
        </Link>
        <h1 className="font-black text-4xl tracking-tight">Security Logs</h1>
      </div>
      <br />
      <br />
      <br />

      <div className="max-w-6xl mx-auto px-6 -mt-10">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
            <Loader2 className="animate-spin h-12 w-12 text-[#00704e] mb-4" />
            <p className="text-gray-500 font-bold">
              Loading security reports...
            </p>
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => (
              <div
                key={r.request_id}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col overflow-hidden group"
              >
                {/* Image Header */}
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  {r.photo_url ? (
                    <img
                      src={r.photo_url}
                      alt="Evidence"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ShieldCheck size={48} className="opacity-20" />
                    </div>
                  )}
                  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      r.status === "PENDING"
                        ? "bg-orange-500 text-white"
                        : "bg-green-500 text-white"
                    }`}
                  >
                    {r.status}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <span className="text-[10px] font-black text-[#00704e] uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                      {r.type_name}
                    </span>
                    <h3 className="font-black text-xl text-gray-800 mt-2 line-clamp-1">
                      {r.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                      <Phone size={12} /> {r.contact}
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-start gap-2 text-gray-600 text-sm italic">
                      <p className="line-clamp-2">"{r.situation_details}"</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <MapPin size={14} className="text-red-400" /> {r.location}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Calendar size={14} />{" "}
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        dateStyle: "long",
                      })}
                    </div>
                  </div>

                  {/* Action Button - Only show if RESOLVED */}
                  {r.status === "RESOLVED" ? (
                    <button
                      onClick={() => setSelectedReport(r)}
                      className="mt-auto w-full py-3 bg-gray-50 hover:bg-[#00704e] hover:text-white text-[#00704e] rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 border border-green-100"
                    >
                      <Eye size={16} /> VIEW RESOLUTION
                    </button>
                  ) : (
                    <div className="mt-auto w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-[10px] text-center uppercase tracking-widest">
                      Awaiting Action
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-2xl p-12 text-center border-2 border-dashed border-gray-100">
            <ShieldCheck className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-400">
              No security reports found
            </h3>
            <p className="text-gray-400 text-sm">
              Community security logs will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Modal for Resolution Narrative */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#00704e] p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="font-black text-xl">Guard Resolution</h2>
                <p className="text-xs opacity-80 uppercase font-bold tracking-tighter">
                  Case ID: #{selectedReport.request_id}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-[#00704e]">
                <p className="text-gray-700 leading-relaxed font-medium italic">
                  "
                  {selectedReport.report ||
                    "No narrative provided for this resolution."}
                  "
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-8 py-3 bg-gray-900 text-white font-black rounded-xl hover:bg-black transition-colors text-sm"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReports;
