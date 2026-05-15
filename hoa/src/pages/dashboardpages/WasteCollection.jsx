import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import { Trash2, AlertCircle, History, CheckCircle2 } from "lucide-react";
import WasteImage from "../../assets/wastebg.png";

const WasteCollection = () => {
  const [notification, setNotification] = useState({
    isCollectionDay: false,
    phase5Completed: true, // This would typically come from an API/Database
  });

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

      // New Schedule: Monday (1) and Friday (5)
      const collectionDays = [1, 5];

      let status = {
        isCollectionDay: collectionDays.includes(day),
        phase5Completed: true, // Simulated status
      };

      setNotification((prev) => ({ ...prev, ...status }));
    };

    checkSchedule();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${WasteImage})` }}
      >
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Waste Management</h1>
          <p className="opacity-90">Automated monitoring and reporting</p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-6 max-w-4xl mx-auto">
        {/* --- WASTE NOTIFICATIONS --- */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
            Schedule Overview
          </h2>

          {/* Collection Day Notification */}
          {notification.isCollectionDay && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm animate-pulse">
              <div className="bg-amber-500 p-2 rounded-full">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">
                  Today is Collection Day
                </h3>
                <p className="text-sm text-amber-700">
                  The waste collection truck is operating in the neighborhood
                  today.
                </p>
              </div>
            </div>
          )}

          {/* Phase 5 Completion Notification */}
          {notification.phase5Completed && (
            <div className="flex items-center gap-4 bg-green-50 border border-green-200 p-5 rounded-2xl shadow-sm">
              <div className="bg-green-600 p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900">
                  Trash Collection Completed
                </h3>
                <p className="text-sm text-green-700">
                  Waste collection for Phase 5 has been successfully completed
                  for today.
                </p>
              </div>
            </div>
          )}

          {!notification.isCollectionDay && !notification.phase5Completed && (
            <div className="flex items-center gap-4 bg-gray-100 border border-gray-200 p-5 rounded-2xl shadow-sm italic text-gray-500">
              No active collections scheduled for today.
            </div>
          )}
        </section>

        {/* --- REPORTING CHANNELS --- */}
        <section className="space-y-3 mt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
            Reporting Channels
          </h2>
          <div className="grid grid-cols-1 gap-4">
            <Link to="/wastecollection/report-uncollected" className="group">
              <div className="shadow-md rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-white hover:bg-red-50 transition-all border border-transparent hover:border-red-200 items-center">
                <AlertCircle className="text-red-500 bg-red-100 rounded-xl p-2 w-12 h-12" />
                <div className="pl-4">
                  <h1 className="font-bold text-gray-800 text-lg">
                    Uncollected Garbage
                  </h1>
                  <p className="text-sm text-gray-500">
                    Auto-sends report to HOA Admin
                  </p>
                </div>
                <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-300 group-hover:text-red-600" />
              </div>
            </Link>

            {/* "Overflowing Bins" has been removed as requested */}
          </div>
        </section>

        {/* --- DASHBOARD --- */}
        <Link to="/wastecollection/my-history" className="group mt-4">
          <div className="shadow-lg rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-[#00704e] text-white hover:bg-[#005a3e] transition-all items-center">
            <History className="bg-white/20 rounded-xl p-2 w-12 h-12" />
            <div className="pl-4">
              <h1 className="font-bold text-lg">My Reporting Dashboard</h1>
              <p className="text-sm opacity-80">
                Track the status of your sent reports
              </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-white" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WasteCollection;
