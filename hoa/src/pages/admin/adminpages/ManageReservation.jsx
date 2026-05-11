import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
  Users, // Added for Guest Count icon
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

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

  // Update Status (Confirm/Approve or Reject)
  const handleUpdateStatus = async (
    resId,
    residentId,
    amenityName,
    newStatus,
  ) => {
    const actionText = newStatus === "Approved" ? "approve" : "reject";
    if (
      !window.confirm(
        `Are you sure you want to ${actionText} this reservation?`,
      )
    )
      return;

    try {
      const res = await authFetch(`${API_URL}/reservations/${resId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          resident_id: residentId,
          amenity_name: amenityName,
        }),
      });

      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.reservation_id === resId ? { ...r, status: newStatus } : r,
          ),
        );
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("An error occurred while updating status.");
    }
  };

  const handleDelete = async (reservationId, residentId, amenityName) => {
    if (
      !window.confirm(
        "Cancel and delete this reservation? This will notify the resident and remove the record.",
      )
    )
      return;

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 flex items-center px-10 text-white shadow-lg">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 cursor-pointer hover:scale-110 transition-transform" />
        </Link>
        <h1 className="font-bold text-4xl ml-10">Manage Reservations</h1>
      </div>

      <div className="m-10">
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Resident",
                  "Amenity",
                  "Date & Slot",
                  "Guests",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#00704e]" />
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="py-20 text-center text-gray-500 font-medium"
                  >
                    No reservations found.
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr
                    key={r.reservation_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-700">{r.full_name}</p>
                      <p className="text-[10px] text-gray-400 uppercase">
                        ID: {r.resident_id}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      {r.amenity_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.reservation_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-[#00704e] bg-green-50 px-2 py-0.5 rounded w-fit uppercase">
                          {r.time_slot}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-bold">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {r.guest_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          r.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : r.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {r.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Approve Button */}
                        {r.status !== "Approved" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                r.reservation_id,
                                r.resident_id,
                                r.amenity_name,
                                "Approved",
                              )
                            }
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}

                        {/* Reject Button (Optional but useful for Admins) */}
                        {r.status === "Pending" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                r.reservation_id,
                                r.resident_id,
                                r.amenity_name,
                                "Rejected",
                              )
                            }
                            className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        )}

                        {/* Delete/Cancel Button */}
                        <button
                          onClick={() =>
                            handleDelete(
                              r.reservation_id,
                              r.resident_id,
                              r.amenity_name,
                            )
                          }
                          className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                          title="Cancel & Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageReservation;
