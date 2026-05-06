import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import {
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

const SuccessReservation = () => {
  const location = useLocation();

  // Data passed from navigation state
  const stateData = location.state?.data;
  const amenityName = location.state?.amenityName || "Amenity";
  const displayDate = location.state?.displayDate;
  const displaySlot = location.state?.displaySlot;

  // Redirect back if accessed directly without data
  if (!stateData) {
    return <Navigate to="/amenities" replace />;
  }

  // Determine the status dynamically from the backend response
  // We check for 'status' or 'reservation_status' depending on your API output
  const getStatusInfo = () => {
    const rawStatus =
      stateData.status || stateData.reservation_status || "Pending Approval";
    const status = rawStatus.toLowerCase();

    if (status === "confirmed" || status === "approved") {
      return {
        label: "Confirmed",
        containerClass: "bg-green-50",
        labelClass: "text-green-700",
        badgeClass: "bg-green-200 text-green-800",
      };
    }

    if (status === "pending" || status === "pending approval") {
      return {
        label: "Pending Approval",
        containerClass: "bg-blue-50",
        labelClass: "text-blue-700",
        badgeClass: "bg-blue-200 text-blue-800",
      };
    }

    // Default fallback
    return {
      label: rawStatus,
      containerClass: "bg-gray-50",
      labelClass: "text-gray-700",
      badgeClass: "bg-gray-200 text-gray-800",
    };
  };

  const statusInfo = getStatusInfo();

  // Format the date
  const dateToFormat = stateData.reservation_date || displayDate;
  const formattedDate = dateToFormat
    ? new Date(dateToFormat).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        {/* Success Header */}
        <div className="text-center mb-8 no-print">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-12 w-12 text-[#00704e]" />
          </div>
          <h1 className="text-3xl font-black text-gray-800">
            Booking Received!
          </h1>
          <p className="text-gray-500 mt-2">
            Your reservation has been recorded successfully.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 print:shadow-none print:border-gray-300">
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
                #{stateData.reservation_id || stateData.insertId || "N/A"}
              </span>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">Date</span>
                </div>
                <p className="font-bold text-gray-700">{formattedDate}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase">
                    Time Slot
                  </span>
                </div>
                <p className="font-bold text-gray-700">
                  {displaySlot || stateData.time_slot || "Not Specified"}
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`${statusInfo.containerClass} p-4 rounded-2xl flex items-center justify-between`}
            >
              <span
                className={`${statusInfo.labelClass} text-xs font-bold uppercase`}
              >
                Current Status
              </span>
              <span
                className={`${statusInfo.badgeClass} text-[10px] px-3 py-1 rounded-full font-black uppercase`}
              >
                {statusInfo.label}
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
        <div className="mt-8 flex flex-col gap-3 no-print">
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

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; }
          .min-h-screen { min-height: auto !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default SuccessReservation;
