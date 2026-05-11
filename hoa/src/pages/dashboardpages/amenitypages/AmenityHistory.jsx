import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, Trash2 } from "lucide-react"; // Added Trash2 for the cancel icon
import { Calendar, Clock, MapPin, Info } from "lucide-react";
import axios from "axios";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const AmenityHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null); // Track which item is being cancelled
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/my-history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(response.data);
      } catch (error) {
        console.error("Error fetching reservation history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Function to handle the click and pass data to Success page
  const handleRowClick = (res) => {
    navigate("/amenities/success", {
      state: {
        data: {
          insertId: res.reservation_id,
          reservation_date: res.reservation_date,
          time_slot: res.time_slot,
        },
        amenityName: res.amenity_name,
      },
    });
  };

  // NEW: Function to handle cancellation
  const handleCancel = async (e, reservationId) => {
    e.stopPropagation(); // Prevents navigating to success page when clicking cancel

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this reservation? This action cannot be undone.",
    );

    if (!confirmCancel) return;

    setCancellingId(reservationId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the cancelled reservation from local state
      setReservations((prev) =>
        prev.filter((res) => res.reservation_id !== reservationId),
      );
      alert("Reservation cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert(
        error.response?.data?.message ||
          "Failed to cancel reservation. Please try again.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase() || "pending") {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-500 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/amenities">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Reservation History</h1>
          <p>Track your amenity bookings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00704e]"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-sm text-center border border-gray-100">
            <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">
              No reservations found.
            </p>
            <Link
              to="/amenities"
              className="text-[#00704e] mt-2 inline-block font-bold"
            >
              Book your first amenity now
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {reservations.map((res) => (
              <div
                key={res.reservation_id}
                onClick={() => handleRowClick(res)}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-[#00704e] hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-green-50 p-3 rounded-xl text-[#00704e]">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">
                      {res.amenity_name || "Amenity"}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />{" "}
                        {res.reservation_date
                          ? new Date(res.reservation_date).toLocaleDateString()
                          : "N/A"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />{" "}
                        {res.time_slot || "No time set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 border-t md:border-none pt-3 md:pt-0">
                  <div className="flex items-center justify-between md:justify-end gap-4 w-full">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        res.status,
                      )}`}
                    >
                      {(res.status || "pending").toUpperCase()}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Reference ID</p>
                      <p className="text-sm font-mono font-bold text-gray-600">
                        {res.reservation_id
                          ? `#${res.reservation_id.toString().padStart(4, "0")}`
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Cancel Button - Only shows if status is not 'rejected' or 'cancelled' */}
                  {res.status?.toLowerCase() !== "rejected" &&
                    res.status?.toLowerCase() !== "cancelled" && (
                      <button
                        onClick={(e) => handleCancel(e, res.reservation_id)}
                        disabled={cancellingId === res.reservation_id}
                        className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === res.reservation_id ? (
                          <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        CANCEL BOOKING
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AmenityHistory;
