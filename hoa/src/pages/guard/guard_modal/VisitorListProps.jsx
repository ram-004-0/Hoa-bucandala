import React from "react";
import {
  UserIcon,
  MapPinIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowLeftEndOnRectangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const VisitorListProps = ({
  id,
  name,
  state,
  homeowner,
  address,
  purpose,
  time,
  onUpdate,
}) => {
  // Logic to handle the status update via the API
  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(
        `https://hoa-camellabucandalav-production.up.railway.app/api/visitors/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        // Refresh the parent list after a successful update
        onUpdate();
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const statusStyles = {
    PENDING: "bg-amber-100 text-amber-700",
    ARRIVED: "bg-green-100 text-green-700",
    DEPARTED: "bg-gray-100 text-gray-500",
  };

  return (
    <div
      className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full transition-all ${
        state === "DEPARTED" ? "opacity-60" : "hover:shadow-md"
      }`}
    >
      <div className="p-6 flex flex-col gap-5 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-black text-gray-800 text-lg leading-tight uppercase tracking-tight">
            {name}
          </h3>
          <span
            className={`text-[10px] font-black px-3 py-1 rounded-full tracking-widest ${statusStyles[state]}`}
          >
            {state}
          </span>
        </div>

        <div className="space-y-4">
          <InfoItem icon={MapPinIcon} label="Destination" value={address} />
          <InfoItem icon={UserIcon} label="Resident Host" value={homeowner} />
          <InfoItem
            icon={InformationCircleIcon}
            label="Purpose"
            value={purpose}
          />
          <InfoItem icon={ClockIcon} label="Expected Time" value={time} />
        </div>
      </div>

      {/* FOOTER ACTIONS: Where the update happens */}
      <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
        {state === "PENDING" && (
          <button
            onClick={() => handleStatusChange("ARRIVED")}
            className="w-full bg-[#00704e] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-green-800 transition-all uppercase text-xs tracking-widest shadow-lg"
          >
            <CheckCircleIcon className="w-5 h-5" />
            Check In Visitor
          </button>
        )}

        {state === "ARRIVED" && (
          <button
            onClick={() => handleStatusChange("DEPARTED")}
            className="w-full bg-red-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-700 transition-all uppercase text-xs tracking-widest shadow-lg"
          >
            <ArrowLeftEndOnRectangleIcon className="w-5 h-5" />
            Check Out Visitor
          </button>
        )}

        {state === "DEPARTED" && (
          <div className="text-center py-2 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Visit Completed
          </div>
        )}
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 items-start">
    <div className="bg-gray-100 p-2 rounded-lg shrink-0">
      <Icon className="w-4 h-4 text-gray-500" />
    </div>
    <div>
      <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-700 font-bold leading-tight">{value}</p>
    </div>
  </div>
);

export default VisitorListProps;
