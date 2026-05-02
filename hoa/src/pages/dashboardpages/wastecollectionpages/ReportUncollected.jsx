import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { AlertCircle, MapPin, Calendar, Camera } from "lucide-react";

const ReportUncollected = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Integration logic for guard_requests or waste_pickups table would go here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md border border-green-100">
          <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Report Filed</h2>
          <p className="text-gray-600 mt-2">
            We've notified the waste management team. They will re-verify your
            street shortly.
          </p>
          <Link
            to="/wastecollection"
            className="mt-6 inline-block bg-[#00704e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005a3e] transition-all"
          >
            Back to Dashboard
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
          <h1 className="font-bold text-4xl">Uncollected Garbage</h1>
          <p className="opacity-90">Report a missed pickup for your address</p>
        </div>
      </div>

      <div className="m-10 max-w-2xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
          <p className="text-sm text-red-800 italic">
            <strong>Note:</strong> Please ensure your bins were out before the
            standard collection time (9:00 AM).
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-3xl p-8 space-y-6 border border-gray-100"
        >
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              Location / Block & Lot
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <input
                required
                type="text"
                placeholder="e.g. Block 12, Lot 4"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] focus:border-transparent outline-none transition-all"
              />
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Missed Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <input
                required
                type="date"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] outline-none"
              />
            </div>

            <label className="block text-sm font-bold text-gray-700">
              Additional Notes
            </label>
            <textarea
              rows="3"
              placeholder="Any details (e.g., bin was outside but truck skipped the street)"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00704e] outline-none"
            ></textarea>

            <label className="block text-sm font-bold text-gray-700 text-gray-400">
              Attach Photo (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 cursor-pointer transition-all">
              <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">
                Click to upload photo of uncollected bin
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#00704e] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#005a3e] transition-all transform active:scale-[0.98]"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportUncollected;
