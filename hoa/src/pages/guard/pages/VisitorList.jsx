import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  Search,
  UserPlus,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import VisitorListProps from "../guard_modal/VisitorListProps";

const VisitorList = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchVisitors = async (isAutoRefresh = false) => {
    // Only show the full-page loading spinner on the initial load
    if (!isAutoRefresh) setLoading(true);
    else setBackgroundLoading(true);

    try {
      const res = await fetch(
        "https://hoa-camellabucandalav-production.up.railway.app/api/visitors/all",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setVisitors(data);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
    }
  };

  // Real-time fetching logic
  useEffect(() => {
    // Initial fetch
    fetchVisitors();

    // Set up interval for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      fetchVisitors(true);
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Filter Logic: Show only PENDING or ARRIVED for the main "Active" list
  // and filter by search term
  const activeVisitors = visitors.filter((v) => {
    const visitorName = v.visitor_name?.toLowerCase() || "";
    const hostResident = v.host_resident?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      visitorName.includes(search) || hostResident.includes(search);

    return matchesSearch && v.status !== "DEPARTED";
  });

  const stats = {
    total: activeVisitors.length,
    arrived: activeVisitors.filter((v) => v.status === "ARRIVED").length,
    pending: activeVisitors.filter((v) => v.status === "PENDING").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header - Styled like VisitorLog */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/guard" className="hover:scale-110 transition-transform">
            <ArrowLeftIcon className="h-8 w-8 md:h-10 md:w-10" />
          </Link>
          <div>
            <h1 className="font-bold text-2xl md:text-4xl uppercase tracking-tight">
              Active Visitor Management
            </h1>
            <p className="text-sm md:text-base opacity-90 text-green-50 font-medium">
              Validate entries and manage current guests
            </p>
          </div>

          {/* Status Indicator (Replacing the manual sync button) */}
          <div className="md:ml-auto flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
            <div
              className={`w-2 h-2 rounded-full bg-green-400 ${backgroundLoading ? "animate-ping" : ""}`}
            ></div>
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              Live Monitoring{" "}
              {backgroundLoading && (
                <RefreshCw size={10} className="animate-spin" />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Filters Row */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search visitor or homeowner..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Grid - Standardized Design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBox
            label="Active Expectations"
            value={stats.total}
            icon={<UserPlus className="w-5 h-5 text-blue-500" />}
          />
          <StatBox
            label="Pending Arrival"
            value={stats.pending}
            color="text-amber-600"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <StatBox
            label="Verified Inside"
            value={stats.arrived}
            color="text-green-600"
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          />
        </div>

        {/* Visitor Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 border-4 border-[#00704e] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
              Loading Visitor Data...
            </p>
          </div>
        ) : activeVisitors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeVisitors.map((v) => (
              <VisitorListProps
                key={v.visitor_id}
                id={v.visitor_id}
                name={v.visitor_name}
                state={v.status} // This prop inside VisitorListProps handles the status update UI
                homeowner={v.host_resident}
                address={v.address_to_visit}
                purpose={v.purpose_of_visit}
                time={`${v.expected_date ? v.expected_date.split("T")[0] : "N/A"} @ ${v.expected_time}`}
                onUpdate={() => fetchVisitors(true)} // Status updates trigger a background refresh
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-xl text-center shadow-sm border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
              No active visitors matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Sub-component to match VisitorLog style
const StatBox = ({ label, value, color = "text-gray-800", icon }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
        {label}
      </p>
      <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
    </div>
    <div className="bg-gray-50 p-3 rounded-lg">{icon}</div>
  </div>
);

export default VisitorList;
