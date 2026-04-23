import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  Leaf,
  Trash,
  Recycle,
  History,
  ClipboardList,
  XCircle,
} from "lucide-react";

const ResidentPickups = () => {
  const [myPickups, setMyPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const fetchMyHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://hoa-camellabucandalav-production.up.railway.app/api/waste/my-pickups",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setMyPickups(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this pickup request?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `https://hoa-camellabucandalav-production.up.railway.app/api/waste/cancel/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        // Optimistic UI update: remove from list immediately
        setMyPickups(myPickups.filter((p) => p.pickup_id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to cancel pickup");
      }
    } catch (err) {
      console.error("Error canceling:", err);
      alert("Network error. Please try again.");
    }
  };

  const getIcon = (type) => {
    switch (type?.toUpperCase()) {
      case "BIODEGRADABLE":
        return (
          <Leaf className="bg-green-100 text-green-600 rounded p-2 w-11 h-11" />
        );
      case "NON-BIODEGRADABLE":
        return (
          <Trash className="bg-red-100 text-red-600 rounded p-2 w-11 h-11" />
        );
      case "RECYCLABLE":
        return (
          <Recycle className="bg-blue-100 text-blue-600 rounded p-2 w-11 h-11" />
        );
      default:
        return (
          <History className="bg-gray-100 text-gray-600 rounded p-2 w-11 h-11" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80 transition-opacity" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">My History</h1>
          <p className="opacity-90">
            Track your past waste collection requests
          </p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-4 content-center justify-center max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <ClipboardList className="text-[#00704e]" /> Recent Bookings
        </h2>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00704e]"></div>
            <p className="mt-4 text-gray-500">Loading your history...</p>
          </div>
        ) : myPickups.length > 0 ? (
          myPickups.map((p) => (
            <div
              key={p.pickup_id}
              className="shadow-md rounded-xl p-6 grid grid-cols-[12%_58%_30%] bg-white items-center border border-gray-100 hover:border-gray-200 transition-all"
            >
              {/* Icon Section */}
              <div className="flex justify-start">{getIcon(p.type)}</div>

              {/* Details Section */}
              <div>
                <h1 className="font-bold text-gray-800 capitalize leading-tight">
                  {p.type.toLowerCase().replace("-", " ")}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {new Date(p.pickup_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  • {p.time_slot}
                </p>
                {p.notes && (
                  <p className="text-xs text-gray-400 italic mt-1 truncate max-w-xs">
                    "{p.notes}"
                  </p>
                )}
              </div>

              {/* Actions Section */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider shadow-sm border ${
                    p.status === "COMPLETED"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}
                >
                  {p.status || "Pending"}
                </span>

                {/* Only show cancel button if status is PENDING */}
                {p.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(p.pickup_id)}
                    className="flex items-center gap-1 text-xs text-red-500 font-semibold hover:bg-red-50 px-2 py-1 rounded transition-colors mt-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Pickup
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              No pickup history found.
            </p>
            <Link
              to="/wastecollection"
              className="text-[#00704e] text-sm font-bold underline mt-2 inline-block"
            >
              Book your first pickup now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentPickups;
