import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOutIcon,
  ShieldCheck,
  User2,
  BanknoteIcon,
  Calendar,
  TriangleAlert,
  RefreshCcw,
  Megaphone,
  Users,
} from "lucide-react";

import Card from "../../props/AdminComponent";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null); // Reference to cancel network requests

  const [statsData, setStatsData] = useState({
    residents: 0,
    unpaidDues: 0,
    reservations: 0,
    visitorCount: 0,
    securityReports: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token");

    // Safety 1: If no token (logged out), stop immediately
    if (!token) return;

    // Safety 2: Cancel any existing fetch before starting a new one
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const results = await Promise.allSettled([
        fetch(`${API_URL}/residents/count`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }),
        fetch(`${API_URL}/reservations`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }),
        fetch(`${API_URL}/guard-requests`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }),
        fetch(`${API_URL}/payments/unpaid-total`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }),
        fetch(`${API_URL}/visitors/all`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        }),
      ]);

      // Safety 3: If component unmounted during fetch, do not update state
      if (!isMounted.current) return;

      const newData = { ...statsData };

      const parseResult = async (res) => {
        if (res.status === "fulfilled" && res.value.ok) {
          return await res.value.json();
        }
        return null;
      };

      const res0 = await parseResult(results[0]);
      if (res0) newData.residents = res0.count || 0;

      const res1 = await parseResult(results[1]);
      if (res1) newData.reservations = Array.isArray(res1) ? res1.length : 0;

      const res2 = await parseResult(results[2]);
      if (res2) newData.securityReports = Array.isArray(res2) ? res2.length : 0;

      const res3 = await parseResult(results[3]);
      if (res3) newData.unpaidDues = res3.totalAmount || 0;

      const res4 = await parseResult(results[4]);
      if (res4) newData.visitorCount = Array.isArray(res4) ? res4.length : 0;

      setStatsData(newData);
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted safely");
      } else {
        console.error("Dashboard Fetch Error:", err);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchStats();

    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchStats]);

  const dynamicStats = [
    {
      icon: User2,
      label: "Total Residents",
      value: statsData.residents,
      color: "#2563eb",
    },
    {
      icon: BanknoteIcon,
      label: "Uncollected Dues",
      value: `₱${Number(statsData.unpaidDues).toLocaleString()}`,
      color: "#dc2626",
    },
    {
      icon: Calendar,
      label: "Reservations",
      value: statsData.reservations,
      color: "#7c3aed",
    },
    {
      icon: Users,
      label: "Visitor Count",
      value: statsData.visitorCount,
      color: "#059669",
    },
    {
      icon: TriangleAlert,
      label: "Security Reports",
      value: statsData.securityReports,
      color: "#e11d48",
    },
  ];

  const handleLogout = () => {
    // 1. Set the mounted ref to false first to stop all state updates
    isMounted.current = false;

    // 2. Kill pending network requests immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 3. Clear the token
    localStorage.removeItem("token");
    localStorage.removeItem("role"); // Also clear role

    // 4. Use a hard window navigation to clear the React state and memory entirely.
    // This is the "Nuclear Option" that guarantees the flicker stops.
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 antialiased font-sans">
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
          <button onClick={handleLogout}>
            <LogOutIcon className="w-6 h-6 cursor-pointer hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-10 flex flex-col gap-10">
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
            <Link to="/admin/manage-payments">
              <Card
                name="HOA Dues Management"
                desc="Track HOA payment status"
                image={<BanknoteIcon className="text-red-700 w-6 h-6" />}
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
                image={<Megaphone className="text-orange-600 w-6 h-6" />}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
