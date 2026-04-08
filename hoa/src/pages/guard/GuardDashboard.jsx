import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LogOutIcon,
  QrCode,
  User,
  Clipboard,
  Phone,
  Activity,
  RefreshCcw,
  Clock,
} from "lucide-react";
import Card from "../../props/AdminComponent"; // Using your Admin Card prop for consistency
import VerificationActionModal from "./guard_modal/VerificationActionModal";

const GuardDashboard = () => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, expected: 0, inside: 0 });

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/visitors/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats({
          total: data.length,
          expected: data.filter((v) => v.status === "PENDING").length,
          inside: data.filter((v) => v.status === "ARRIVED").length,
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans antialiased">
      {/* Header - Matching Admin Dashboard */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:px-10 md:py-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-2xl">
            <ShieldCheck className="w-10 h-10 text-green-300" />
          </div>
          <div>
            <h1 className="font-semibold text-2xl md:text-3xl tracking-tight">
              Security Portal
            </h1>
            <p className="opacity-90 text-sm">Gate 1 • Camella Bucandala V</p>
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
          <button onClick={handleLogout} className="group">
            <LogOutIcon className="w-6 h-6 cursor-pointer group-hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-10 max-w-7xl mx-auto flex flex-col gap-10">
        {/* Stats Grid - Using the Admin Stat Card Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatBox
            label="Today's Total"
            value={stats.total}
            icon={Activity}
            color="text-blue-600"
            loading={loading}
          />
          <StatBox
            label="Pending Entry"
            value={stats.expected}
            icon={Clock}
            color="text-amber-600"
            loading={loading}
          />
          <StatBox
            label="Currently Inside"
            value={stats.inside}
            icon={User}
            color="text-[#00704e]"
            loading={loading}
          />
        </div>

        {/* Action Section - Matching Management Portal Design */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-2 h-8 bg-[#00704e] rounded-full"></div>
            <h2 className="font-black text-xl text-gray-800 tracking-tight uppercase">
              Operations & Monitoring
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Main Action: Verification */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className="text-left group transition-all"
            >
              <Card
                name="Verification"
                desc="Scan QR or Search Visitor ID"
                image={<QrCode className="text-blue-600 w-6 h-6" />}
              />
            </button>

            {/* Secondary Action: List */}
            <Link to="/guard/visitor-list" className="group">
              <Card
                name="Visitor List"
                desc="View all pre-registered guests"
                image={<User className="text-[#00704e] w-6 h-6" />}
              />
            </Link>

            {/* History Log */}
            <Link to="/guard/visitor-log" className="group">
              <Card
                name="Entry/Exit Logs"
                desc="Detailed history of all movements"
                image={<Clipboard className="text-purple-600 w-6 h-6" />}
              />
            </Link>
          </div>
        </div>

        {/* Emergency Section - Kept but styled for alignment */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
            <h3 className="text-red-700 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
              <Phone size={16} /> Emergency Support
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Control Center
              </span>
              <span className="text-2xl font-black text-gray-800 tracking-tight">
                0917-000-0000
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                Police / Medical
              </span>
              <span className="text-2xl font-black text-red-600 underline decoration-2 underline-offset-8">
                911
              </span>
            </div>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <VerificationActionModal onClose={() => setShowVerifyModal(false)} />
      )}
    </div>
  );
};

// Internal Sub-component for Stats to match Admin style
const StatBox = ({ label, value, icon: Icon, color, loading }) => (
  <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col gap-2 hover:shadow-md transition-all duration-300">
    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50">
      <Icon className={`w-7 h-7 ${color}`} />
    </div>
    <p className={`text-3xl font-black text-gray-800 tracking-tight`}>
      {loading ? "..." : value}
    </p>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
      {label}
    </p>
  </div>
);

export default GuardDashboard;
