import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Trash2, AlertCircle, History, clipboardList } from "lucide-react";

const WasteCollection = () => {
  // Logic could be added here to determine if today/tomorrow is collection day
  // For now, these are UI indicators
  const isCollectionTomorrow = true;
  const isCollectionToday = false;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Waste Management</h1>
          <p className="opacity-90">Monitor collection and report issues</p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-6 max-w-4xl mx-auto">
        {/* --- GARBAGE COLLECTION NOTIFICATIONS --- */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
            Notifications
          </h2>

          {isCollectionTomorrow && (
            <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
              <div className="bg-blue-500 p-2 rounded-full">
                <BellIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Collection Tomorrow</h3>
                <p className="text-sm text-blue-700">
                  Please prepare your bins tonight for tomorrow's pickup.
                </p>
              </div>
            </div>
          )}

          {isCollectionToday && (
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-5 rounded-2xl shadow-sm animate-pulse">
              <div className="bg-amber-500 p-2 rounded-full">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">
                  Today is Collection Day
                </h3>
                <p className="text-sm text-amber-700">
                  Trucks are currently operating in the community.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* --- WASTE MONITORING & REPORTING --- */}
        <section className="space-y-3 mt-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">
            Waste Monitoring / Reporting
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Report: Uncollected Garbage */}
            <Link to="/wastecollection/report-uncollected" className="group">
              <div className="shadow-md rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-white hover:bg-red-50 transition-all border border-transparent hover:border-red-200 items-center">
                <AlertCircle className="text-red-500 bg-red-100 rounded-xl p-2 w-12 h-12" />
                <div className="pl-4">
                  <h1 className="font-bold text-gray-800 text-lg">
                    Uncollected Garbage
                  </h1>
                  <p className="text-sm text-gray-500">
                    Report if your trash was skipped during schedule
                  </p>
                </div>
                <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-300 group-hover:text-red-600" />
              </div>
            </Link>

            {/* Report: Overflowing Bins */}
            <Link to="/wastecollection/report-overflow" className="group">
              <div className="shadow-md rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-white hover:bg-orange-50 transition-all border border-transparent hover:border-orange-200 items-center">
                <ExclamationTriangleIcon className="text-orange-500 bg-orange-100 rounded-xl p-2 w-12 h-12" />
                <div className="pl-4">
                  <h1 className="font-bold text-gray-800 text-lg">
                    Overflowing Bins
                  </h1>
                  <p className="text-sm text-gray-500">
                    Flag community bins that need immediate attention
                  </p>
                </div>
                <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-300 group-hover:text-orange-600" />
              </div>
            </Link>
          </div>
        </section>

        {/* --- HISTORY / DASHBOARD --- */}
        <Link to="/wastecollection/my-history" className="group mt-4">
          <div className="shadow-lg rounded-2xl p-6 grid grid-cols-[12%_76%_12%] bg-[#00704e] text-white hover:bg-[#005a3e] transition-all items-center">
            <History className="bg-white/20 rounded-xl p-2 w-12 h-12" />
            <div className="pl-4">
              <h1 className="font-bold text-lg">My Reporting Dashboard</h1>
              <p className="text-sm opacity-80">
                Track status of your reports and collection history
              </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-white" />
          </div>
        </Link>

        {/* --- SCHEDULE INFO --- */}
        <div className="bg-white shadow-sm rounded-2xl p-6 space-y-4 border border-gray-100">
          <h1 className="font-bold text-gray-800 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-[#00704e]" />
            Standard Schedule Reference
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-600">Biodegradable</span>
              <span className="text-[#00704e] font-bold">Mon, Wed, Fri</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold text-gray-600">
                Non-Bio / Recyclable
              </span>
              <span className="text-blue-600 font-bold">Tue, Thu, Sat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCollection;
