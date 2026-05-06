import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import {
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const SuccessReservation = () => {
  const location = useLocation();
  // Get data passed from the navigation state
  const reservationData = location.state?.data;
  const amenityName = location.state?.amenityName || "Basketball Court";

  // Redirect back if accessed directly without data
  if (!reservationData) {
    return <Navigate to="/amenities" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-12 w-12 text-[#00704e]" />
          </div>
          <h1 className="text-3xl font-black text-gray-800">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500 mt-2">
            Your slot has been successfully reserved.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-[#00704e] p-6 text-white text-center">
            <p className="text-sm opacity-80 uppercase font-bold tracking-widest">
              Reservation Details
            </p>
            <h2 className="text-xl font-bold mt-1">{amenityName}</h2>
          </div>

          <div className="p-8 space-y-6">
            {/* Reference Number */}
            <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-3">
                <TicketIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-semibold text-gray-400 uppercase">
                  Reference ID
                </span>
              </div>
              <span className="font-mono font-bold text-gray-800">
                #{reservationData.id || "RES-7721"}
              </span>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Date</span>
                </div>
                <p className="font-bold text-gray-700">
                  {reservationData.reservation_date}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">
                    Time Slot
                  </span>
                </div>
                <p className="font-bold text-gray-700">
                  {reservationData.time_slot}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-between">
              <span className="text-blue-700 text-xs font-bold uppercase">
                Status
              </span>
              <span className="bg-blue-200 text-blue-800 text-[10px] px-3 py-1 rounded-full font-black uppercase">
                Pending Approval
              </span>
            </div>
          </div>

          {/* Footer Instruction */}
          <div className="bg-gray-50 p-6 text-center">
            <p className="text-xs text-gray-400 leading-relaxed px-4">
              Please present this confirmation to the security guard upon
              arrival at the facility.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/amenities"
            className="w-full bg-[#00704e] text-white py-4 rounded-2xl font-black text-center shadow-lg shadow-green-100 flex items-center justify-center gap-2 hover:bg-[#005a3e] transition-all"
          >
            <HomeIcon className="h-5 w-5" />
            BACK TO AMENITIES
          </Link>

          <button
            onClick={() => window.print()}
            className="w-full bg-white text-gray-600 py-4 rounded-2xl font-black text-center border border-gray-200 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            PRINT CONFIRMATION
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessReservation;
