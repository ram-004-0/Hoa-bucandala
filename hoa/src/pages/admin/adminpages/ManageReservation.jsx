import React, { useEffect, useState } from "react";
import {
  ArrowLeftIcon,
  Trash2,
  Calendar,
  Loader2,
  CheckCircle,
  XCircle,
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

  // Update Status (Confirm/Approve)
  const handleUpdateStatus = async (
    resId,
    residentId,
    amenityName,
    newStatus,
  ) => {
    if (!window.confirm(`Mark this reservation as ${newStatus}?`)) return;

    try {
      const res = await authFetch(`${API_URL}/${resId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          resident_id: residentId, // Sent so backend can create a notification
          amenity_name: amenityName,
        }),
      });

      if (res.ok) {
        setReservations((prev) =>
          prev.map((r) =>
            r.reservation_id === resId ? { ...r, status: newStatus } : r,
          ),
        );
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDelete = async (reservationId, residentId, amenityName) => {
    if (
      !window.confirm(
        "Cancel and delete this reservation? This will notify the resident.",
      )
    )
      return;

    const res = await authFetch(`${API_URL}/${reservationId}`, {
      method: "DELETE",
      // Include resident info so backend knows who to notify about the cancellation
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
                {["Resident", "Amenity", "Date", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#00704e]" />
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr
                    key={r.reservation_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {r.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.amenity_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(r.reservation_date).toLocaleDateString()} (
                        {r.time_slot})
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
                    <td className="px-6 py-4 flex gap-2">
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
                      <button
                        onClick={() =>
                          handleDelete(
                            r.reservation_id,
                            r.resident_id,
                            r.amenity_name,
                          )
                        }
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        title="Cancel/Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
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
