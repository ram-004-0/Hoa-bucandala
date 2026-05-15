import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserMenuPopUp from "../props/LogutPopUp";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import {
  Trash2,
  Calendar1,
  DollarSign,
  Shield,
  UserPlus,
  Speaker,
  Bell,
  ChevronRight,
  Inbox,
} from "lucide-react";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [userData, setUserData] = useState({ name: "Resident" });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData({ name: data.full_name || data.name });
          localStorage.setItem("userName", data.full_name || data.name);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    const fetchLatestAnnouncement = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        const data = await res.json();
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setLatestAnnouncement(sorted[0] || null);
      } catch (err) {
        console.error("Announcement fetch error:", err);
      }
    };

    const fetchUnreadNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (err) {
        console.error("Notification fetch error:", err);
      }
    };

    fetchProfile();
    fetchLatestAnnouncement();
    fetchUnreadNotifications();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      <div className="bg-[#00704e] text-white px-6 pt-12 pb-20 md:px-16 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto flex justify-between items-start relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-yellow-400"></span>
              <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400">
                Camella Bucandala V
              </h1>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
              Hello, <br className="md:hidden" />
              <span className="text-white underline decoration-yellow-400 underline-offset-8">
                {userData.name.split(" ")[0]}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 backdrop-blur-md"
            >
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#00704e]">
                  {unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="group flex items-center gap-3 bg-black/20 hover:bg-black/40 p-2 pr-5 rounded-2xl transition-all border border-white/10 backdrop-blur-md"
              >
                <UserCircleIcon className="w-12 h-12 text-white" />
                <div className="hidden md:block text-left">
                  <p className="text-[10px] font-black uppercase opacity-60">
                    Account
                  </p>
                  <p className="text-xs font-black">Settings</p>
                </div>
              </button>
              {showMenu && <UserMenuPopUp logout={handleLogout} />}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-10 relative z-20">
        {/* Latest Announcement */}
        <div className="mb-10">
          {latestAnnouncement ? (
            <div className="group flex flex-col md:flex-row gap-5 items-center bg-white border border-gray-100 p-6 rounded-4xl shadow-xl">
              <div className="bg-amber-50 p-4 rounded-2xl shrink-0 group-hover:rotate-12 transition-transform">
                <Speaker className="text-amber-600 w-7 h-7" />
              </div>
              <div className="grow text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Latest Update
                  </span>
                </div>
                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">
                  {latestAnnouncement.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium line-clamp-1">
                  {latestAnnouncement.content}
                </p>
              </div>
              <Link
                to="/announcements"
                className="flex items-center gap-2 text-xs font-black text-[#00704e] uppercase bg-green-50 px-6 py-3 rounded-xl hover:bg-[#00704e] hover:text-white transition-all"
              >
                Read More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm border border-dashed border-gray-200 p-6 rounded-4xl text-center italic text-gray-400 text-sm">
              All quiet in the community.
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          <h3 className="font-black text-gray-900 text-sm uppercase tracking-[0.2em] px-2">
            Community Services
          </h3>
          {/* FIXED GRID: Added 'items-stretch' to ensure all children take full height 
              and ensured grid-cols are defined clearly for all breakpoints.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            <ServiceLink
              to="/amenities"
              color="blue"
              icon={Calendar1}
              title="Amenities"
              desc="Pool & Clubhouse Booking"
            />
            <ServiceLink
              to="/hoadues"
              color="yellow"
              icon={DollarSign}
              title="HOA Dues"
              desc="Payment Records & Billing"
            />
            <ServiceLink
              to="/wastecollection"
              color="green"
              icon={Trash2}
              title="Waste Management"
              desc="Collection Schedules"
            />
            <ServiceLink
              to="/securityassistance"
              color="red"
              icon={Shield}
              title="Security"
              desc="Emergency Assistance"
            />
            <ServiceLink
              to="/visitorregistration"
              color="purple"
              icon={UserPlus}
              title="Visitors"
              desc="Pre-register Guests"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceLink = ({ to, color, icon: Icon, title, desc }) => {
  const colors = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
    green: "text-green-600 bg-green-50 border-green-100",
    red: "text-red-600 bg-red-50 border-red-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
  };

  return (
    <Link to={to} className="group block h-full">
      {/* FIXED CARD: Added 'flex flex-col h-full' to ensure the card container 
          expands to the height of the tallest card in the row. 
      */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden h-full flex flex-col">
        <Icon
          className={`w-14 h-14 p-3.5 rounded-2xl mb-6 border transition-all group-hover:rotate-6 shrink-0 ${colors[color]}`}
        />
        <h4 className="font-black text-gray-900 text-xl mb-1 uppercase tracking-tighter">
          {title}
        </h4>
        <p className="text-gray-500 text-sm font-medium leading-relaxed grow">
          {desc}
        </p>
        <div className="mt-6 flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#00704e] transition-colors">
          Access Service <ChevronRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  );
};

export default Home;
