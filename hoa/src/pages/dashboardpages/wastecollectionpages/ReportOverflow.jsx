import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { Trash2, MapPin, CheckCircle } from "lucide-react";

const ReportOverflow = () => {
  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-orange-100">
          <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-12 w-12 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Alert Received</h2>
          <p className="text-gray-600 mt-2">
            The maintenance team has been alerted to the overflowing bin. Thank
            you for keeping the community clean!
          </p>
          <Link
            to="/wastecollection"
            className="mt-6 inline-block bg-[#00704e] text-white px-8 py-3 rounded-xl font-bold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header matching WasteCollection */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Overflowing Bins</h1>
          <p className="opacity-90">
            Report community bins that need immediate emptying
          </p>
        </div>
      </div>

      <div className="m-10 max-w-2xl mx-auto">
        <div className="bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-100">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <Trash2 className="h-6 w-6 text-orange-500" />
              <h2 className="font-bold text-gray-700 text-lg">
                Report Details
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Location of the Bin
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="e.g. Near Community Park / Gate 2"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Severity Level
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-3 px-4 rounded-xl border-2 border-orange-200 bg-orange-50 text-orange-700 font-bold text-sm">
                    Moderate
                  </button>
                  <button className="py-3 px-4 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-400 font-bold text-sm hover:border-red-200 hover:text-red-500">
                    Critical / Spilling
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="4"
                  placeholder="Provide more context..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-orange-400"
                ></textarea>
              </div>
            </div>

            <button
              onClick={() => setIsSuccess(true)}
              className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <ExclamationTriangleIcon className="h-5 w-5" />
              SEND ALERT TO ADMIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportOverflow;
