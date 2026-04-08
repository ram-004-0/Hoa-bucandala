import React, { useState } from "react";
import { ClockIcon, CheckIcon } from "@heroicons/react/24/outline";

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
  const [updating, setUpdating] = useState(false);
  const isArrived = state === "ARRIVED";

  const handleMarkArrived = async () => {
    setUpdating(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/visitors/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "ARRIVED" }),
        },
      );

      if (res.ok) {
        onUpdate(); // Trigger parent refresh
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-gray-800">{name}</h2>
          <p className="text-[10px] font-mono text-gray-400 uppercase">
            ID: {id}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            isArrived
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {state}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 text-sm border-t border-gray-50 pt-4">
        <DetailRow label="Homeowner" value={homeowner} />
        <DetailRow label="Address" value={address} />
        <DetailRow label="Purpose" value={purpose} />
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Expected</span>
          <span className="flex items-center gap-1 font-semibold text-gray-700">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            {time}
          </span>
        </div>
      </div>

      {/* Action */}
      {!isArrived && (
        <button
          onClick={handleMarkArrived}
          disabled={updating}
          className="mt-2 w-full bg-[#00704e] hover:bg-green-800 disabled:opacity-50 transition-all text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckIcon className="w-5 h-5" />
          {updating ? "Processing..." : "Mark as Arrived"}
        </button>
      )}
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between gap-4">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold text-gray-700 text-right">
      {value || "---"}
    </span>
  </div>
);

export default VisitorListProps;
