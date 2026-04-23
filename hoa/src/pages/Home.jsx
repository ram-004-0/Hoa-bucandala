import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../props/DashboardCard";
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
} from "lucide-react";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const Home = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
  const [userData, setUserData] = useState({ name: "Resident" });

  useEffect(() => {
    // 1. Fetch User Profile Data to get the ACTUAL full name
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/me`, {
          // Create this endpoint or use /residents/me
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUserData({ name: data.full_name || data.name });
          // Sync with localStorage just in case
          localStorage.setItem("userName", data.full_name || data.name);
        } else {
          // Fallback to localStorage if API fails
          const storedName = localStorage.getItem("userName");
          if (storedName) setUserData({ name: storedName });
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    // 2. Fetch Announcements
    const fetchLatestAnnouncement = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();

        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setLatestAnnouncement(sorted[0] || null);
      } catch (err) {
        console.error("Announcement fetch error:", err);
      }
    };

    fetchProfile();
    fetchLatestAnnouncement();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20">
      {/* Dynamic Header with Branding */}
      <div className="bg-[#00704e] text-white px-6 pt-12 pb-20 md:px-16 shadow-2xl relative overflow-hidden">
        {/* Background Decorative Element */}
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
            <p className="text-sm font-bold opacity-80 uppercase tracking-widest pt-2">
              Resident Dashboard
            </p>
          </div>

          {/* User Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              className="group flex items-center gap-3 bg-black/20 hover:bg-black/40 p-2 pr-5 rounded-2xl transition-all border border-white/10 backdrop-blur-md"
            >
              <div className="relative">
                <UserCircleIcon className="w-12 h-12 text-white" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#00704e] rounded-full"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-black uppercase opacity-60">
                  Profile
                </p>
                <p className="text-xs font-black">Settings</p>
              </div>
            </button>

            {showMenu && <UserMenuPopUp logout={handleLogout} />}
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
      <div className="max-w-7xl mx-auto px-4 md:px-10 -mt-10 relative z-20">
        {/* Announcement Card - Glassmorphism style */}
        <div className="mb-10">
          {latestAnnouncement ? (
            <div className="group flex flex-col md:flex-row gap-5 items-center bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all">
              <div className="bg-amber-50 p-4 rounded-2xl shrink-0 group-hover:rotate-12 transition-transform">
                <Bell className="text-amber-600 w-7 h-7" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Important Update
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(
                      latestAnnouncement.created_at,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-black text-gray-900 text-lg leading-tight mb-1">
                  {latestAnnouncement.title}
                </h3>
                <p className="text-gray-500 text-sm font-medium line-clamp-1 max-w-2xl">
                  {latestAnnouncement.content}
                </p>
              </div>
              <Link
                to="/announcements"
                className="flex items-center gap-2 text-xs font-black text-[#00704e] uppercase bg-green-50 px-6 py-3 rounded-xl hover:bg-[#00704e] hover:text-white transition-all shadow-sm"
              >
                Read More <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="bg-white/50 backdrop-blur-sm border border-dashed border-gray-200 p-6 rounded-[2rem] text-center italic text-gray-400 text-sm">
              All quiet in the community. No new announcements.
            </div>
          )}
        </div>

        {/* Dashboard Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-gray-900 text-sm uppercase tracking-[0.2em]">
              Resident Services
            </h3>
            <div className="h-px bg-gray-100 flex-grow mx-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <ServiceLink
              to="/announcements"
              color="amber"
              icon={Speaker}
              title="News"
              desc="HOA Updates & Events"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceLink = ({ to, color, icon: Icon, title, desc }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
    green: "text-green-600 bg-green-50 border-green-100",
    red: "text-red-600 bg-red-50 border-red-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <Link to={to} className="group block">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
        {/* Subtle hover background decoration */}
        <div
          className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colors[color].split(" ")[1]}`}
        ></div>

        <Icon
          className={`w-14 h-14 p-3.5 rounded-2xl mb-6 border transition-all group-hover:rotate-6 ${colors[color]}`}
        />

        <h4 className="font-black text-gray-900 text-xl mb-1 uppercase tracking-tighter">
          {title}
        </h4>
        <p className="text-gray-500 text-sm font-medium leading-relaxed">
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
