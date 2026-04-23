import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Plus,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import CreateUser from "./CreateUser";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const ManageResidents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/residents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const transformed = data.map((r) => ({
        id: r.resident_id,
        name: r.full_name,
        email: r.email,
        address: r.address,
        contact: r.contact,
        withBalance: !!r.has_balance,
      }));
      setResidents(transformed);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resident?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/residents/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setResidents((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Logic: Formats incoming data from CreateUser to match our local state 'transformed' shape
  const handleCreateResident = (newRes) => {
    const formatted = {
      id: newRes.resident_id || newRes.residentId,
      name: newRes.full_name,
      email: newRes.email,
      address: newRes.address,
      contact: newRes.contact,
      withBalance: !!newRes.has_balance,
    };
    setResidents((prev) => [...prev, formatted]);
  };

  // Logic: Finds and updates the specific resident in state
  const handleUpdateResident = (updated) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === (updated.resident_id || updated.id)
          ? {
              id: updated.resident_id || updated.id,
              name: updated.full_name,
              email: updated.email,
              address: updated.address,
              contact: updated.contact,
              withBalance: !!updated.has_balance,
            }
          : r,
      ),
    );
    setSelectedResident(null);
  };

  // The ?. prevents the error if r.name is missing
  // The || "" ensures we compare against an empty string instead of undefined
  const filteredResidents = residents.filter((r) => {
    const name = r.name || ""; // fallback to avoid .toLowerCase() crash
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Manage Residents</h1>
      </div>

      <div className="m-10">
        <div className="flex gap-4 mb-8">
          <StatCard title="Total Residents" value={residents.length} />
          <StatCard
            title="With Balance"
            value={residents.filter((r) => r.withBalance).length}
            red
          />
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full outline-none focus:ring-2 focus:ring-[#00704e]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#00704e] text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-[#005a3e]"
          >
            <Plus className="h-5 w-5" /> Add New Resident
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Name",
                  "Email",
                  "Address",
                  "Contact",
                  "Balance",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResidents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-semibold">{r.name}</td>
                  <td className="px-6 py-4 text-sm">{r.email}</td>
                  <td className="px-6 py-4 text-sm">{r.address}</td>
                  <td className="px-6 py-4 text-sm">{r.contact}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold ${r.withBalance ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {r.withBalance ? "Has Balance" : "No Balance"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedResident(r)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Loading/Empty State */}
          {loading && (
            <p className="p-10 text-center text-gray-500">
              Loading residents...
            </p>
          )}
          {!loading && filteredResidents.length === 0 && (
            <div className="p-20 text-center text-gray-400">
              <ShieldCheck className="h-12 w-12 mx-auto opacity-20" />
              <p>No residents found.</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateUser
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateResident}
        />
      )}

      {selectedResident && (
        <CreateUser
          editData={selectedResident}
          onClose={() => setSelectedResident(null)}
          onCreate={handleUpdateResident}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, red }) => (
  <div className="p-6 bg-white shadow-md rounded-lg flex-1 text-center border border-gray-100">
    <h2 className="text-sm text-gray-500 mb-2 font-medium">{title}</h2>
    <span
      className={`text-3xl font-bold ${red ? "text-red-600" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

export default ManageResidents;
