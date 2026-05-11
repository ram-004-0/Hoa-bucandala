import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import {
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  TicketIcon,
  HomeIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  UsersIcon, // Added for Pax display
} from "@heroicons/react/24/outline";

const SuccessReservation = () => {
  const location = useLocation();

  // 1. Extract values directly from location.state
  const stateData = location.state?.data;
  const explicitStatus = location.state?.status; // The new key you added to state
  const amenityName = location.state?.amenityName || "Amenity";
  const displayDate = location.state?.displayDate;
  const displaySlot = location.state?.displaySlot;
  const pax = location.state?.pax || stateData?.guest_count || 1; // Extracting pax

  // Redirect back if accessed directly without data
  if (!stateData) {
    return <Navigate to="/amenities" replace />;
  }

  /**
   * Determine the status UI dynamically.
   * Priority: explicitStatus > stateData.status > Fallback "Pending"
   */
  const getStatusInfo = () => {
    const rawStatus = explicitStatus || stateData?.status || "Pending";
    const status = rawStatus.toLowerCase();

    // UI for Confirmed/Approved
    if (status === "confirmed" || status === "approved") {
      return {
        label: "Confirmed",
        containerClass: "bg-green-50",
        labelClass: "text-green-700",
        badgeClass: "bg-green-200 text-green-800",
      };
    }

    // UI for anything containing "pending" (catches "Pending" and "Pending Approval")
    if (status.includes("pending")) {
      return {
        label: "Pending Approval",
        containerClass: "bg-blue-50",
        labelClass: "text-blue-700",
        badgeClass: "bg-blue-200 text-blue-800",
      };
    }

    // Fallback for "Cancelled" or other custom states
    return {
      label: rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1),
      containerClass: "bg-gray-50",
      labelClass: "text-gray-700",
      badgeClass: "bg-gray-200 text-gray-800",
    };
  };

  const statusInfo = getStatusInfo();

  // Format the date for human readability
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

            {/* Guest Count (Pax) - Added Section */}
            <div className="pb-4 border-b border-dashed border-gray-200">
              <div className="flex items-center gap-2 text-gray-400">
                <UsersIcon className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">
                  Guest Count
                </span>
              </div>
              <p className="font-black text-[#00704e] text-lg">
                {pax} {pax > 1 ? "Persons" : "Person"}
              </p>
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

        {/* NEW: Admin Verification Tip Section */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-2xl no-print shadow-sm">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-tight">
                Wait! One more step...
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed mt-1 font-medium">
                To confirm your booking, please send a screenshot of your
                <strong> payment receipt</strong> to our admin email. This
                allows the admin to verify and confirm your reservation.
              </p>
              <div className="mt-3 flex items-center gap-2 bg-white/60 p-2.5 rounded-xl border border-blue-200 w-fit">
                <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-black text-blue-900 select-all">
                  lessandrabukandala2021@gmail.com
                </span>
              </div>
            </div>
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
            <button className="h-5 w-5" />
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
