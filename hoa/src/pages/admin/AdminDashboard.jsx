import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LogOutIcon,
  ShieldCheck,
  User2,
  DollarSign,
  Calendar,
  Trash,
  TriangleAlert,
  RefreshCcw,
} from "lucide-react";

import Card from "../../props/AdminComponent";

const API_URL = "http://localhost:5000/api";

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState({
    residents: 0,
    unpaidDues: 0,
    reservations: 0,
    wasteRequests: 0,
    visitorCount: 0, // Keep as placeholder or map to a specific logic
    securityReports: 0,
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Use Promise.allSettled so one failing endpoint doesn't crash the whole dashboard
      const results = await Promise.allSettled([
        fetch(`${API_URL}/residents/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/waste/all-pickups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/billing/unpaid-total`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const data = { ...statsData };

      // Resident Count
      if (results[0].status === "fulfilled" && results[0].value.ok) {
        const res = await results[0].value.json();
        data.residents = res.count || 0;
      }

      // Reservations Count
      if (results[1].status === "fulfilled" && results[1].value.ok) {
        const res = await results[1].value.json();
        data.reservations = Array.isArray(res) ? res.length : 0;
      }

      // Waste Requests Count
      if (results[2].status === "fulfilled" && results[2].value.ok) {
        const res = await results[2].value.json();
        data.wasteRequests = Array.isArray(res) ? res.length : 0;
      }

      // Security Reports Count
      if (results[3].status === "fulfilled" && results[3].value.ok) {
        const res = await results[3].value.json();
        data.securityReports = Array.isArray(res) ? res.length : 0;
      }

      // Unpaid Dues (Total Sum)
      if (results[4].status === "fulfilled" && results[4].value.ok) {
        const res = await results[4].value.json();
        data.unpaidDues = res.totalAmount || 0;
      }

      setStatsData(data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const dynamicStats = [
    {
      icon: User2,
      label: "Total Residents",
      value: statsData.residents,
      color: "blue",
    },
    {
      icon: DollarSign,
      label: "Unpaid Dues",
      value: `₱${Number(statsData.unpaidDues).toLocaleString()}`,
      color: "red",
    },
    {
      icon: Calendar,
      label: "Reservations",
      value: statsData.reservations,
      color: "purple",
    },
    {
      icon: Trash,
      label: "Waste Requests",
      value: statsData.wasteRequests,
      color: "green",
    },
    {
      icon: User2,
      label: "Visitor Count",
      value: statsData.visitorCount,
      color: "emerald",
    },
    {
      icon: TriangleAlert,
      label: "Security Reports",
      value: statsData.securityReports,
      color: "rose",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:px-10 md:py-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <ShieldCheck className="w-10 h-10" />
          <div>
            <h1 className="font-semibold text-2xl md:text-3xl">
              Admin Dashboard
            </h1>
            <p className="opacity-90">Camella Bucandala V Management</p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="p-2 hover:bg-white/10 rounded-full transition-all disabled:opacity-50"
          >
            <RefreshCcw
              className={`w-6 h-6 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          <button onClick={handleLogout}>
            <LogOutIcon className="w-6 h-6 cursor-pointer hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-10 flex flex-col gap-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicStats.map(({ icon: Icon, label, value, color }, i) => (
            <div
              key={i}
              className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col gap-2 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50">
                <Icon className="w-7 h-7" style={{ color: color }} />
              </div>
              <p className="text-2xl font-black text-gray-800">
                {loading ? "..." : value}
              </p>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Management Section */}
        <div className="flex flex-col gap-6">
          <h2 className="font-bold text-xl text-gray-800 border-b pb-2">
            Management Portal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/admin/manage-residents">
              <Card
                name="Manage Residents"
                desc="View and edit resident information"
                image={<User2 className="text-blue-700 w-6 h-6" />}
              />
            </Link>
            <Link to="/admin/manage-reservations">
              <Card
                name="Amenity Reservations"
                desc="Manage booking and reservations"
                image={<Calendar className="text-purple-700 w-6 h-6" />}
              />
            </Link>
            <Link to="/admin/dues">
              <Card
                name="HOA Dues Management"
                desc="Track HOA payment status"
                image={<DollarSign className="text-red-700 w-6 h-6" />}
              />
            </Link>
            <Link to="/admin/view-pickups">
              <Card
                name="Waste Requests"
                desc="Manage pickup schedules"
                image={<Trash className="text-green-700 w-6 h-6" />}
              />
            </Link>
            <Link to="/admin/manage-reports">
              <Card
                name="Security Logs"
                desc="View incident reports"
                image={<TriangleAlert className="text-rose-700 w-6 h-6" />}
              />
            </Link>
            <Link to="/admin/create-announcement">
              <Card
                name="Create Announcement"
                desc="Post community updates"
                image={<User2 className="text-blue-700 w-6 h-6" />}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
