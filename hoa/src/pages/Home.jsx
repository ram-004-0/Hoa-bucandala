import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardCard from "../props/DashboardCard";
import LogutPopUp from "../props/LogutPopUp";

import { UserIcon } from "@heroicons/react/24/solid";
import {
  Trash2,
  Calendar1,
  DollarSign,
  Shield,
  UserPlus,
  LucideSpeaker,
  Volume2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Home = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);

  // Fetch latest announcement
  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const res = await fetch(`${API_URL}/announcements`);
        if (!res.ok) throw new Error("Failed to fetch announcements");
        const data = await res.json();

        // Sort by date descending and take the first announcement
        const sorted = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setLatestAnnouncement(sorted[0] || null);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#00704e] text-white px-4 py-6 md:px-10 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">Camella Bucandala V</h1>
            <p className="text-sm opacity-90">Welcome, name</p>
            <p className="text-sm opacity-90">
              What would you like to do today?
            </p>
          </div>

          {/* User menu */}
          <div className="relative self-end md:self-auto">
            <button
              onClick={() => setShowLogout((prev) => !prev)}
              className="focus:outline-none"
            >
              <UserIcon className="w-10 h-10 text-white" />
            </button>

            {showLogout && (
              <div className="absolute right-0 mt-2 z-50">
                <LogutPopUp
                  logout={() => {
                    console.log("Logging out...");
                    setShowLogout(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}

      <div className="p-4 sm:p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/amenities">
          <DashboardCard
            image={
              <Calendar1 className="w-11 h-11 text-blue-600 bg-blue-100 rounded-lg p-2" />
            }
            name="Amenity Reservation"
            description="Book club house, pool & more."
          />
        </Link>

        <Link to="/hoadues">
          <DashboardCard
            image={
              <DollarSign className="w-11 h-11 text-yellow-600 bg-yellow-100 rounded-lg p-2" />
            }
            name="HOA Dues"
            description="View payment history & pay dues."
          />
        </Link>

        <Link to="/wastecollection">
          <DashboardCard
            image={
              <Trash2 className="w-11 h-11 text-green-600 bg-green-100 rounded-lg p-2" />
            }
            name="Waste Collection"
            description="Schedule pickup."
          />
        </Link>

        <Link to="/securityassistance">
          <DashboardCard
            image={
              <Shield className="w-11 h-11 text-red-600 bg-red-100 rounded-lg p-2" />
            }
            name="Security Assistance"
            description="Request security support."
          />
        </Link>

        <Link to="/visitorregistration">
          <DashboardCard
            image={
              <UserPlus className="w-11 h-11 text-purple-600 bg-purple-100 rounded-lg p-2" />
            }
            name="Visitor Registration"
            description="Register your visitors here."
          />
        </Link>

        <Link to="/announcements">
          <DashboardCard
            image={
              <LucideSpeaker className="w-11 h-11 text-amber-600 bg-amber-100 rounded-lg p-2" />
            }
            name="Announcements"
            description="HOA news and updates."
          />
        </Link>
      </div>

      {/* Announcement Banner */}
      {latestAnnouncement && (
        <div className="mx-4 sm:mx-6 md:mx-10 mb-10 p-4 flex gap-4 items-start bg-amber-100 border-2 border-dashed border-amber-400 rounded-lg shadow-md">
          <Volume2 className="text-orange-600 w-10 h-10 shrink-0" />
          <div>
            <h2 className="font-bold">{latestAnnouncement.title}</h2>
            <p className="text-sm">{latestAnnouncement.content}</p>
            <span className="text-xs text-gray-600 mt-1 block">
              Posted on:{" "}
              {new Date(latestAnnouncement.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {!latestAnnouncement && (
        <div className="mx-4 sm:mx-6 md:mx-10 mb-10 p-4 flex gap-4 items-start bg-amber-100 border-2 border-dashed border-amber-400 rounded-lg shadow-md">
          <Volume2 className="text-orange-600 w-10 h-10 shrink-0" />
          <div>
            <h2 className="font-bold">No announcements yet</h2>
            <p className="text-sm">Check back later for updates.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
