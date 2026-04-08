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
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const ViewPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [filteredPickups, setFilteredPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const token = localStorage.getItem("token");

  // Fetch logic wrapped in useCallback for stability
  const fetchPickups = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/waste/all-pickups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPickups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups]);

  // Filtering Logic
  useEffect(() => {
    let result = [...pickups];

    if (filterStatus !== "All") {
      result = result.filter((p) => p.status === filterStatus);
    }

    if (filterType !== "All") {
      result = result.filter((p) => p.type === filterType);
    }

    // Sort by Date (Descending - newest first)
    result.sort((a, b) => new Date(b.pickup_date) - new Date(a.pickup_date));
    setFilteredPickups(result);
  }, [pickups, filterStatus, filterType]);

  const handleStatusUpdate = async (id, currentStatus) => {
    // ENUM Switch: Database expects 'COMPLETED' or 'PENDING'
    const newStatus = currentStatus === "PENDING" ? "COMPLETED" : "PENDING";

    try {
      const res = await fetch(`${API_URL}/waste/pickup/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setPickups((prev) =>
          prev.map((p) =>
            Number(p.pickup_id) === Number(id)
              ? { ...p, status: newStatus }
              : p,
          ),
        );
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Network error. Check if your backend is running.");
    }
  };

  const formatType = (type) => {
    if (!type) return "";
    return type
      .toLowerCase()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 flex items-center p-10 text-white gap-6 print:hidden shadow-lg">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 hover:scale-110 transition-transform cursor-pointer" />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-4xl">Resident Pickups</h1>
          <p className="opacity-80 font-medium tracking-wide">
            Waste Collection Management Dashboard
          </p>
        </div>
        <button
          onClick={fetchPickups}
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
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-500">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Pending
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {pickups.filter((p) => p.status === "PENDING").length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-[#00704e]">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Completed
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {pickups.filter((p) => p.status === "COMPLETED").length}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">
              Total Today
            </p>
            <h3 className="text-3xl font-black text-gray-800">
              {pickups.length}
            </h3>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl shadow-sm print:hidden">
          <div className="flex items-center gap-2 text-gray-500 mr-4">
            <Filter size={18} />
            <span className="font-bold text-sm uppercase">Filters:</span>
          </div>

          <select
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-gray-50 font-medium cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none bg-gray-50 font-medium cursor-pointer"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Waste Types</option>
            <option value="BIODEGRADABLE">Biodegradable</option>
            <option value="NON-BIODEGRADABLE">Non-Biodegradable</option>
            <option value="RECYCLABLE">Recyclable</option>
          </select>

          <button
            onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-5 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md active:scale-95"
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
                  Waste Type
                </th>
                <th className="px-6 py-5 text-gray-500 font-black text-xs uppercase">
                  Schedule
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
                  <td
                    colSpan="5"
                    className="p-20 text-center text-gray-400 animate-pulse font-bold"
                  >
                    Fetching records from server...
                  </td>
                </tr>
              ) : filteredPickups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400">
                    No collection requests found.
                  </td>
                </tr>
              ) : (
                filteredPickups.map((item) => (
                  <tr
                    key={item.pickup_id}
                    className="hover:bg-green-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        {item.full_name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#00704e] font-bold mt-0.5">
                        <MapPin size={12} /> {item.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                          item.type === "BIODEGRADABLE"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : item.type === "RECYCLABLE"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}
                      >
                        {formatType(item.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700">
                        {new Date(item.pickup_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            timeZone: "UTC",
                          },
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
                        {item.time_slot}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-black uppercase ${
                          item.status === "COMPLETED"
                            ? "text-green-600"
                            : "text-orange-500"
                        }`}
                      >
                        {item.status === "COMPLETED" ? (
                          <CheckCircleIcon size={14} />
                        ) : (
                          <ClockIcon size={14} />
                        )}
                        {item.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center print:hidden">
                      <button
                        onClick={() =>
                          handleStatusUpdate(item.pickup_id, item.status)
                        }
                        className={`px-4 py-2 min-w-[120px] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 ${
                          item.status === "COMPLETED"
                            ? "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                            : "bg-[#00704e] text-white hover:bg-[#005a3e]"
                        }`}
                      >
                        {item.status === "COMPLETED"
                          ? "Undo Mark"
                          : "Mark Collected"}
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
