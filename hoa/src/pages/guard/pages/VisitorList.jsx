import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import VisitorListProps from "../guard_modal/VisitorListProps";

const VisitorList = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all visitors from backend
  const fetchVisitors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/visitors/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setVisitors(data);
      }
    } catch (err) {
      console.error("Failed to fetch visitors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  // Calculate Stats dynamically
  const stats = {
    total: visitors.length,
    arrived: visitors.filter((v) => v.status === "ARRIVED").length,
    pending: visitors.filter((v) => v.status === "PENDING").length,
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:px-10 md:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:gap-10 max-w-7xl mx-auto">
          <Link
            to="/guard"
            className="w-fit hover:scale-110 transition-transform"
          >
            <ArrowLeftIcon className="h-8 w-8 md:h-10 md:w-10 cursor-pointer" />
          </Link>

          <div className="mt-4 md:mt-0">
            <h1 className="font-bold text-2xl md:text-4xl">Visitor List</h1>
            <p className="opacity-90">Manage pre-registered entries</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10 flex flex-col gap-8">
        {/* Dynamic Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatBox label="Total Expected" value={stats.total} />
          <StatBox
            label="Arrived"
            value={stats.arrived}
            color="text-green-600"
          />
          <StatBox
            label="Pending"
            value={stats.pending}
            color="text-yellow-600"
          />
        </div>

        {/* Visitor Grid */}
        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading visitors...</p>
        ) : visitors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visitors.map((v) => (
              <VisitorListProps
                key={v.visitor_id}
                id={v.visitor_id}
                name={v.visitor_name}
                state={v.status}
                homeowner={v.host_resident} // From your SQL JOIN
                address={v.address_to_visit}
                purpose={v.purpose_of_visit}
                time={`${v.expected_date.split("T")[0]} @ ${v.expected_time}`}
                onUpdate={fetchVisitors} // Refresh list after status change
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-xl text-center shadow-sm border border-dashed">
            <p className="text-gray-400">
              No visitors registered in the system.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color = "text-gray-800" }) => (
  <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6 text-center">
    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">
      {label}
    </p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

export default VisitorList;
