import React, { useEffect, useState } from "react";
import { ArrowLeftIcon, Trash2, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

// Helper for authenticated requests
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
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
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

  const handleDelete = async (reservationId) => {
    if (!window.confirm("Cancel this reservation?")) return;

    // Use authFetch to ensure the token is sent with the DELETE request
    const res = await authFetch(`${API_URL}/reservations/${reservationId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReservations((prev) =>
        prev.filter((r) => r.reservation_id !== reservationId),
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 flex items-center px-10 text-white shadow-lg">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 cursor-pointer hover:scale-110 transition-transform" />
        </Link>
        <h1 className="font-bold text-4xl ml-10">Manage Reservations</h1>
      </div>

      <div className="m-10">
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {["Resident", "Amenity", "Date", "Time Slot", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
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
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-green-600" />
                    <p className="mt-2 text-gray-500">
                      Loading reservations...
                    </p>
                  </td>
                </tr>
              ) : reservations.length > 0 ? (
                reservations.map((r) => (
                  // FIXED: key prop uses reservation_id from your SQL schema
                  <tr
                    key={r.reservation_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {r.full_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.amenity_name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(r.reservation_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {r.time_slot}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(r.reservation_id)}
                        className="p-2 hover:bg-red-50 rounded-lg group transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-500 group-hover:text-red-700" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="p-10 text-center text-gray-500 italic"
                  >
                    No reservations found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageReservation;
