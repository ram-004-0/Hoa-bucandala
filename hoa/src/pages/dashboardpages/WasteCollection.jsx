import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Trash2, AlertCircle, History } from "lucide-react";

const WasteCollection = () => {
  const [notification, setNotification] = useState({
    today: false,
    tomorrow: false,
    type: "",
  });

  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

      const bioDays = [1, 3, 5]; // Mon, Wed, Fri
      const nonBioDays = [2, 4, 6]; // Tue, Thu, Sat

      const tomorrow = (day + 1) % 7;

      let status = { today: false, tomorrow: false, type: "" };

      // Check Today
      if (bioDays.includes(day)) {
        status.today = true;
        status.type = "Biodegradable";
      } else if (nonBioDays.includes(day)) {
        status.today = true;
        status.type = "Non-Bio / Recyclable";
      }

      // Check Tomorrow
      if (bioDays.includes(tomorrow)) {
        status.tomorrow = true;
      } else if (nonBioDays.includes(tomorrow)) {
        status.tomorrow = true;
      }

      setNotification(status);
    };

    checkSchedule();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Waste Management</h1>
          <p className="opacity-90">Automated monitoring and reporting</p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-6 max-w-4xl mx-auto">
        {/* --- AUTOMATED NOTIFICATIONS --- */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
            Live Notifications
          </h2>

          {notification.today && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm animate-pulse">
              <div className="bg-amber-500 p-2 rounded-full">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">
                  Today is Collection Day
                </h3>
                <p className="text-sm text-amber-700">
                  The <strong>{notification.type}</strong> truck is operating
                  today.
                </p>
              </div>
            </div>
          )}

          {notification.tomorrow && !notification.today && (
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
              <div className="bg-blue-500 p-2 rounded-full">
                <BellIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Collection Tomorrow</h3>
                <p className="text-sm text-blue-700">
                  Prepare your bins tonight for tomorrow morning's pickup.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* --- MONITORING & REPORTING --- */}
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

            <Link to="/wastecollection/report-overflow" className="group">
              <div className="shadow-md rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-white hover:bg-orange-50 transition-all border border-transparent hover:border-orange-200 items-center">
                <ExclamationTriangleIcon className="text-orange-500 bg-orange-100 rounded-xl p-2 w-12 h-12" />
                <div className="pl-4">
                  <h1 className="font-bold text-gray-800 text-lg">
                    Overflowing Bins
                  </h1>
                  <p className="text-sm text-gray-500">
                    Instant notification to community cleaners
                  </p>
                </div>
                <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-300 group-hover:text-orange-600" />
              </div>
            </Link>
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
