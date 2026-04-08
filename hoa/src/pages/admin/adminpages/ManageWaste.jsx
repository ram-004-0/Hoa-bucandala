import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Trash2,
  Plus,
  ListChecks,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ManageWaste = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState("BIODEGRADABLE");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchSchedules();
  }, []);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
  }, [showModal]);

  const fetchSchedules = async () => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/waste`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch waste schedules");

      const data = await res.json();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      // Handle the ERR_CONNECTION_REFUSED case
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to server. Is your backend running on port 5000?"
          : err.message,
      );
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!type || !date) {
      setError("Type and Pickup Date are required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/waste`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, pickup_date: date, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add schedule");

      fetchSchedules();
      setDate("");
      setNotes("");
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This only works if no residents have booked this slot.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/waste/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete");

      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Waste Management</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="mx-10 mt-6 flex gap-4">
        <Link
          to="/admin/manage-waste"
          className={`flex items-center gap-2 px-6 py-2 rounded-t-lg font-bold transition-all ${
            location.pathname.includes("manage-waste")
              ? "bg-white text-[#00704e] shadow-sm"
              : "text-gray-500 hover:text-[#00704e]"
          }`}
        >
          <Calendar size={18} /> Master Schedule
        </Link>
        <Link
          to="/admin/view-pickups"
          className="flex items-center gap-2 px-6 py-2 rounded-t-lg font-bold text-gray-500 hover:text-[#00704e] transition-all"
        >
          <ListChecks size={18} /> Resident Pickups
        </Link>
      </div>

      <div className="mx-10 mb-10 p-6 bg-white rounded-b-xl rounded-tr-xl shadow-sm">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Available Slots
            </h2>
            <p className="text-gray-500 text-sm">
              Create and delete dates available for resident booking.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#00704e] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#005a3e] shadow-md transition-all"
          >
            <Plus className="h-5 w-5" />
            Add New Slot
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                ✖
              </button>

              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Add Waste Schedule
              </h2>

              <form onSubmit={handleAdd} className="grid gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Waste Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00704e] outline-none"
                  >
                    <option value="BIODEGRADABLE">BIODEGRADABLE</option>
                    <option value="NON-BIODEGRADABLE">NON-BIODEGRADABLE</option>
                    <option value="RECYCLABLE">RECYCLABLE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Pickup Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00704e] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <input
                    placeholder="e.g. Morning Collection 8am-12pm"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#00704e] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-[#00704e] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-[#005a3e] transition-all flex justify-center items-center gap-2 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Processing..." : "Create Schedule Slot"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-600">Type</th>
                <th className="px-6 py-4 font-bold text-gray-600">
                  Pickup Date
                </th>
                <th className="px-6 py-4 font-bold text-gray-600">Notes</th>
                <th className="px-6 py-4 font-bold text-gray-600 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {schedules.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#00704e]">
                    {s.type}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    {new Date(s.pickup_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">
                    {s.notes || "Standard Collection"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                      title="Delete Slot"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {schedules.length === 0 && !loading && !error && (
          <div className="py-20 text-center">
            <ShieldCheck className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">
              No schedules defined
            </h3>
            <p className="text-gray-400">
              Add dates so residents can start booking pickups.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageWaste;
