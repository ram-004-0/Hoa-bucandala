import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  Filter,
  MapPin,
  Printer,
  RefreshCcw,
  AlertTriangle,
  Trash2,
} from "lucide-react";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const ViewPickups = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const token = localStorage.getItem("token");

  const fetchReports = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Endpoint matches the 'reports' table we created earlier
      const res = await fetch(`${API_URL}/reports/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Filtering Logic
  useEffect(() => {
    let result = [...reports];

    if (filterStatus !== "All") {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (filterType !== "All") {
      result = result.filter((r) => r.report_type === filterType);
    }

    // Sort by Date Descending
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    setFilteredReports(result);
  }, [reports, filterStatus, filterType]);

  const handleStatusUpdate = async (id, currentStatus) => {
    // ENUM Switch based on your schema: 'Pending', 'In Progress', 'Resolved'
    let newStatus = "In Progress";
    if (currentStatus === "In Progress") newStatus = "Resolved";
    if (currentStatus === "Resolved") newStatus = "Pending";

    try {
      const res = await fetch(`${API_URL}/reports/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.report_id === id ? { ...r, status: newStatus } : r,
          ),
        );
      }
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 flex items-center p-10 text-white gap-6 print:hidden shadow-lg">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 hover:scale-110 transition-transform cursor-pointer" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-4xl">Waste Reports</h1>
          <p className="opacity-80 font-medium tracking-wide">
            Uncollected Garbage & Overflow Alerts
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={isRefreshing}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all"
        >
          <RefreshCcw
            className={`h-6 w-6 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <div className="m-10">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:hidden">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Pending Reports
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {reports.filter((r) => r.status === "Pending").length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Overflow Alerts
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {
                reports.filter((r) => r.report_type === "Overflowing Bins")
                  .length
              }
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#00704e]">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Resolved
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {reports.filter((r) => r.status === "Resolved").length}
            </h3>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm print:hidden">
          <select
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-gray-50 font-medium"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-gray-50 font-medium"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Report Types</option>
            <option value="Uncollected Garbage">Uncollected Garbage</option>
            <option value="Overflowing Bins">Overflowing Bins</option>
          </select>

          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold shadow-md"
          >
            <Printer size={16} /> Print Report
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase">
                  Resident & Location
                </th>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase">
                  Type
                </th>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase">
                  Details
                </th>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase">
                  Status
                </th>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase text-center print:hidden">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center animate-pulse">
                    Loading Reports...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400">
                    No reports found.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.report_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        {report.full_name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#00704e] font-bold">
                        <MapPin size={12} /> {report.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          report.report_type === "Overflowing Bins"
                            ? "bg-orange-100 text-orange-700 border-orange-200"
                            : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-sm text-gray-600 truncate">
                        {report.description}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                          report.status === "Resolved"
                            ? "text-green-600"
                            : "text-orange-500"
                        }`}
                      >
                        {report.status === "Resolved" ? (
                          <CheckCircleIcon size={14} />
                        ) : (
                          <ClockIcon size={14} />
                        )}
                        {report.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      <button
                        onClick={() =>
                          handleStatusUpdate(report.report_id, report.status)
                        }
                        className="px-4 py-2 bg-[#00704e] text-white rounded-xl text-[11px] font-black uppercase hover:bg-[#005a3e]"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewPickups;
