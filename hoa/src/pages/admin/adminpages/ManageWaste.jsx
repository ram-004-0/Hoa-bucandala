import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Trash2,
  ListChecks,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const ManageWaste = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Fetch reports on mount and set up real-time polling
  useEffect(() => {
    // Initial fetch
    fetchReports(true);

    // Set up interval for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchReports(false); // Pass false so the spinner doesn't flash every 5s
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reports/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch garbage reports");

      const data = await res.json();
      setReports(data);
      setError(""); // Clear error if fetch is successful
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      // Immediate fetch after update for better UX
      fetchReports(false);
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper to style status badges
  const getStatusStyle = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200 transition-all" />
        </Link>
        <h1 className="font-bold text-4xl tracking-tight">
          Waste Reports Management
        </h1>
      </div>

      <br />
      <br />
      <br />

      <div className="mx-10 -mt-8 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 mb-10">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-800">
                Resident Garbage Reports
              </h2>
              {/* Subtle Live Indicator */}
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                Live
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Monitor and resolve uncollected garbage or overflowing bin
              reports.
            </p>
          </div>
        </div>

        {error && (
          <div className="m-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-gray-400">
                  Resident
                </th>
                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-gray-400">
                  Type / Description
                </th>
                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-gray-400">
                  Location
                </th>
                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="px-8 py-5 font-black text-xs uppercase tracking-widest text-gray-400 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map((report) => (
                <tr
                  key={report.report_id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-800">
                      {report.full_name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                      {new Date(report.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-[#00704e] block mb-1">
                      {report.report_type}
                    </span>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {report.description || "No details provided"}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-700 font-medium italic text-sm">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      {report.location}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      {report.status === "Pending" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(report.report_id, "In Progress")
                          }
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Clock size={14} /> Start Task
                        </button>
                      )}
                      {report.status === "In Progress" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(report.report_id, "Resolved")
                          }
                          className="flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        >
                          <CheckCircle2 size={14} /> Mark Resolved
                        </button>
                      )}
                      {report.status === "Resolved" && (
                        <span className="text-gray-300 text-xs font-bold italic">
                          Completed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && reports.length === 0 && (
          <div className="py-32 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-400">All clear!</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-sm mt-2">
              No garbage collection reports have been filed by residents yet.
            </p>
          </div>
        )}

        {loading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <RefreshCcw className="animate-spin text-[#00704e]" size={32} />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
              Loading Reports...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWaste;
