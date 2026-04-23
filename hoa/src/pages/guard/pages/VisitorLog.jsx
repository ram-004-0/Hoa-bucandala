import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, Calendar, Search, LogOut } from "lucide-react";
import CheckOutModal from "../guard_modal/CheckOutModal";

const VisitorLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Added missing state
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://hoa-camellabucandalav-production.up.railway.app/api/visitors/all`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      if (res.ok) setLogs(data);
    } catch (err) {
      console.error("Fetch logs error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CHECK-OUT LOGIC ---
  const handleCheckOutConfirm = async (id) => {
    setIsProcessing(true);
    try {
      const res = await fetch(
        `https://hoa-camellabucandalav-production.up.railway.app/api/visitors/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "DEPARTED" }),
        },
      );

      if (res.ok) {
        setSelectedVisitor(null); // Close modal
        fetchLogs(); // Refresh data
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Check-out error:", err);
      alert("Error processing check-out");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesDate = log.expected_date.startsWith(selectedDate);
    const matchesSearch =
      log.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.host_resident.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDate && matchesSearch;
  });

  const stats = {
    total: filteredLogs.length,
    inside: filteredLogs.filter((l) => l.status === "ARRIVED").length,
    exited: filteredLogs.filter((l) => l.status === "DEPARTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
          <Link to="/guard" className="hover:scale-110 transition-transform">
            <ArrowLeftIcon className="h-8 w-8 md:h-10 md:w-10" />
          </Link>
          <div>
            <h1 className="font-bold text-2xl md:text-4xl">
              Visitor Log History
            </h1>
            <p className="text-sm md:text-base opacity-90 text-green-50">
              Entry and Exit records
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Filters Row */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search name or homeowner..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <Calendar className="text-gray-400" size={18} />
              <input
                type="date"
                className="bg-transparent outline-none text-sm font-medium"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="text-sm text-[#00704e] font-semibold hover:underline"
          >
            Refresh Records
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatBox label="Total for Day" value={stats.total} />
          <StatBox
            label="Inside Now"
            value={stats.inside}
            color="text-blue-600"
          />
          <StatBox label="Exited" value={stats.exited} color="text-gray-500" />
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Visitor Name",
                    "Homeowner",
                    "Purpose",
                    "Time",
                    "Status",
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className="px-6 py-4 font-bold text-gray-600 uppercase text-[10px] tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-400">
                      Loading records...
                    </td>
                  </tr>
                ) : filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.visitor_id}
                      className="hover:bg-green-50/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {log.visitor_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.host_resident}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {log.purpose_of_visit}
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-500 text-xs">
                        {log.expected_time}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={log.status} />
                      </td>
                      <td className="px-6 py-4">
                        {log.status === "ARRIVED" && (
                          <button
                            onClick={() => setSelectedVisitor(log)}
                            className="flex items-center gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-black transition-all active:scale-95"
                          >
                            <LogOut size={14} /> Check-out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-20 text-gray-400 font-medium"
                    >
                      No records found for this date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Render the CheckOut Modal if a visitor is selected */}
      {selectedVisitor && (
        <CheckOutModal
          visitor={selectedVisitor}
          loading={isProcessing}
          onClose={() => setSelectedVisitor(null)}
          onConfirm={handleCheckOutConfirm}
        />
      )}
    </div>
  );
};

// Sub-components
const StatBox = ({ label, value, color = "text-gray-800" }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
      {label}
    </p>
    <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    ARRIVED: "bg-blue-100 text-blue-700",
    DEPARTED: "bg-gray-100 text-gray-600",
    PENDING: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status] || styles.PENDING}`}
    >
      {status === "DEPARTED" ? "EXITED" : status}
    </span>
  );
};

export default VisitorLog;
