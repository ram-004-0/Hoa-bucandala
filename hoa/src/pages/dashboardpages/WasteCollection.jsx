import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClockIcon, // Added for the history icon
} from "@heroicons/react/24/solid";
import { Leaf, Trash, Recycle, History } from "lucide-react";

const WasteCollection = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Waste Collection</h1>
          <p className="opacity-90">Schedule and track your pickups</p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-6 content-center justify-center max-w-4xl mx-auto">
        {/* --- BOOKING CARDS --- */}

        <Link to="/wastecollection/bookbiodegradable" className="group">
          <div className="pl-10 shadow-md rounded-lg p-6 grid grid-cols-[15%_70%_15%] bg-white hover:bg-green-50 transition-all border border-transparent hover:border-green-200">
            <Leaf
              color="green"
              className="bg-green-200 rounded p-1 w-11 h-11"
            />
            <div>
              <h1 className="font-bold text-gray-800">Biodegradable</h1>
              <p className="text-sm text-gray-500">Food Waste, Paper, Plants</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </Link>

        <Link to="/wastecollection/booknonbiodegradable" className="group">
          <div className="pl-10 shadow-md rounded-lg p-6 grid grid-cols-[15%_70%_15%] bg-white hover:bg-red-50 transition-all border border-transparent hover:border-red-200">
            <Trash color="red" className="bg-red-100 rounded p-1 w-11 h-11" />
            <div>
              <h1 className="font-bold text-gray-800">Non-Biodegradable</h1>
              <p className="text-sm text-gray-500">
                Plastic, Styrofoam, and Rubber
              </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
        </Link>

        <Link to="/wastecollection/bookrecyclable" className="group">
          <div className="pl-10 shadow-md rounded-lg p-6 grid grid-cols-[15%_70%_15%] bg-white hover:bg-blue-50 transition-all border border-transparent hover:border-blue-200">
            <Recycle
              color="blue"
              className="bg-blue-100 rounded p-1 w-11 h-11"
            />
            <div>
              <h1 className="font-bold text-gray-800">Recyclable</h1>
              <p className="text-sm text-gray-500">Glass, Metal, Cardboard</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </Link>

        {/* --- NEW RESIDENT DASHBOARD / HISTORY CARD --- */}
        <Link to="/wastecollection/my-history" className="group mt-4">
          <div className="pl-10 shadow-lg rounded-lg p-6 grid grid-cols-[15%_70%_15%] bg-[#00704e] text-white hover:bg-[#005a3e] transition-all">
            <History className="bg-white/20 rounded p-1 w-11 h-11" />
            <div>
              <h1 className="font-bold">My Pickup Dashboard</h1>
              <p className="text-sm opacity-80">
                View history and collection status
              </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-white" />
          </div>
        </Link>

        {/* --- INFO SECTION --- */}

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4 border border-gray-100">
          <h1 className="font-bold text-gray-800 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-[#00704e]" />
            Weekly Collection Schedule
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Leaf
                color="green"
                className="bg-green-100 rounded p-1 w-8 h-8"
              />
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">Bio</p>
                <p className="text-sm font-medium">Mon, Wed, Fri</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Trash color="red" className="bg-red-50 rounded p-1 w-8 h-8" />
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  Non-Bio
                </p>
                <p className="text-sm font-medium">Tuesday and Thursday</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Recycle
                color="blue"
                className="bg-blue-50 rounded p-1 w-8 h-8"
              />
              <div>
                <p className="text-xs font-bold uppercase text-gray-400">
                  Recyclable
                </p>
                <p className="text-sm font-medium">Tue- Thu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 shadow-sm rounded-lg p-6">
          <p className="text-amber-800 text-sm italic">
            <strong>Note:</strong> Special pickups can be scheduled for large
            items (furniture, appliances). Please contact the HOA office for
            manual arrangements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WasteCollection;
