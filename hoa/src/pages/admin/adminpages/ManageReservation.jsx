import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Info,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-bucandala.onrender.com/api";

export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

const ManageReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States for Rejection/Cancellation Reason
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/reservations`);
      const data = await res.json();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdateStatus = async (
    resId,
    residentId,
    amenityName,
    newStatus,
    reason = "",
  ) => {
    try {
      setIsUpdating(true);
      const res = await authFetch(`${API_URL}/reservations/${resId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          resident_id: residentId,
          amenity_name: amenityName,
          cancel_reason: reason, // Passing reason to backend
        }),
      });

      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.reservation_id === resId
              ? { ...r, status: newStatus, cancel_reason: reason }
              : r,
          ),
        );
        setShowReasonModal(false);
        setActionReason("");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const openRejectModal = (res) => {
    setSelectedRes(res);
    setShowReasonModal(true);
  };

  const handleDelete = async (reservationId, residentId, amenityName) => {
    if (!window.confirm("Permanently delete this record from history?")) return;

    try {
      const res = await authFetch(`${API_URL}/reservations/${reservationId}`, {
        method: "DELETE",
        body: JSON.stringify({
          resident_id: residentId,
          amenity_name: amenityName,
        }),
      });

      if (res.ok) {
        setReservations((prev) =>
          prev.filter((r) => r.reservation_id !== reservationId),
        );
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#00704e] h-48 flex flex-col justify-center px-6 md:px-20 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Calendar size={200} />
        </div>
        <div className="flex items-center gap-6 z-10">
          <Link to="/admin">
            <div className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/20">
              <ArrowLeftIcon className="h-8 w-8" />
            </div>
          </Link>
          <div>
            <h1 className="font-black text-4xl tracking-tight">Reservations</h1>
            <p className="text-green-100 opacity-80 font-medium uppercase tracking-widest text-xs mt-1">
              Admin Control Panel
            </p>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <div className="max-w-6xl mx-auto -mt-10 px-6">
        {loading ? (
          <div className="bg-white rounded-3xl p-20 shadow-xl flex flex-col items-center border border-gray-100">
            <Loader2 className="animate-spin h-12 w-12 text-[#00704e] mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              Loading Bookings...
            </p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 shadow-xl text-center border border-gray-100">
            <Info className="mx-auto h-16 w-16 text-gray-200 mb-4" />
            <p className="text-gray-500 text-xl font-bold">
              No reservations currently active.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reservations.map((r) => (
              <div
                key={r.reservation_id}
                className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-6 pb-0 flex justify-between items-start">
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                        r.status === "Approved"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : r.status === "Rejected" || r.status === "Cancelled"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : "bg-yellow-50 text-yellow-600 border-yellow-100"
                      }`}
                    >
                      {r.status || "Pending"}
                    </span>
                    <h3 className="text-xl font-black text-gray-800 mt-2">
                      {r.full_name}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Resident ID: #{r.resident_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-300 uppercase">
                      Ref ID
                    </p>
                    <p className="font-mono font-bold text-gray-500">
                      #{r.reservation_id.toString().padStart(4, "0")}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4 flex-grow">
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#00704e]">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase leading-none mb-1">
                        Amenity & Date
                      </p>
                      <p className="text-sm font-bold text-gray-700">
                        {r.amenity_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(r.reservation_date).toLocaleDateString(
                          "en-US",
                          { month: "long", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 border border-gray-100 p-3 rounded-2xl">
                      <Clock size={16} className="text-[#00704e]" />
                      <span className="text-xs font-black text-gray-600 uppercase">
                        {r.time_slot}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 border border-gray-100 p-3 rounded-2xl">
                      <Users size={16} className="text-[#00704e]" />
                      <span className="text-xs font-black text-gray-600 uppercase">
                        {r.guest_count} Pax
                      </span>
                    </div>
                  </div>

                  {/* REASON SECTION */}
                  {(r.cancel_reason ||
                    r.status === "Cancelled" ||
                    r.status === "Rejected") && (
                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
                        Reason / Note
                      </p>
                      <p className="text-sm text-red-800 italic leading-relaxed">
                        "{r.cancel_reason || "No specific reason provided."}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-6 pt-0 flex gap-2">
                  {r.status === "Pending" && (
                    <>
                      <button
                        onClick={() =>
                          handleUpdateStatus(
                            r.reservation_id,
                            r.resident_id,
                            r.amenity_name,
                            "Approved",
                          )
                        }
                        className="flex-1 bg-[#00704e] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(r)}
                        className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}
                  {(r.status === "Cancelled" ||
                    r.status === "Rejected" ||
                    r.status === "Approved") && (
                    <button
                      onClick={() =>
                        handleDelete(
                          r.reservation_id,
                          r.resident_id,
                          r.amenity_name,
                        )
                      }
                      className="w-full border border-red-100 text-red-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} /> Remove Record
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* REJECTION MODAL */}
      {showReasonModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReasonModal(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setShowReasonModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-orange-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-500">
                <XCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">
                Reject Booking
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Provide a reason for the resident.
              </p>
            </div>

            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#00704e] outline-none transition-all resize-none h-32"
              placeholder="e.g. Schedule conflict, Maintenance day, etc."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            ></textarea>

            <button
              onClick={() =>
                handleUpdateStatus(
                  selectedRes.reservation_id,
                  selectedRes.resident_id,
                  selectedRes.amenity_name,
                  "Rejected",
                  actionReason,
                )
              }
              disabled={isUpdating}
              className="w-full mt-6 bg-[#00704e] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Confirm Rejection"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageReservation;
