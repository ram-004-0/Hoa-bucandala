import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  ShieldAlert,
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
  const [showGuardModal, setShowGuardModal] = useState(false); // New state for Guard
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

      // We filter or label them if the API returns both,
      // but usually this API only returns residents.
      const transformed = data.map((r) => ({
        id: r.resident_id || r.id,
        name: r.full_name,
        email: r.email,
        address: r.address,
        contact: r.contact,
        role: r.role || "RESIDENT",
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
    if (!window.confirm("Are you sure you want to delete this account?"))
      return;
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

  const handleCreateEntry = (newEntry) => {
    const formatted = {
      id: newEntry.resident_id || newEntry.id,
      name: newEntry.full_name,
      email: newEntry.email,
      address: newEntry.address,
      contact: newEntry.contact,
      role: newEntry.role || "RESIDENT",
      withBalance: !!newEntry.has_balance,
    };
    setResidents((prev) => [...prev, formatted]);
  };

  const handleUpdateEntry = (updated) => {
    setResidents((prev) =>
      prev.map((r) =>
        r.id === (updated.resident_id || updated.id)
          ? {
              id: updated.resident_id || updated.id,
              name: updated.full_name,
              email: updated.email,
              address: updated.address,
              contact: updated.contact,
              role: updated.role || r.role,
              withBalance: !!updated.has_balance,
            }
          : r,
      ),
    );
    setSelectedResident(null);
  };

  const filteredResidents = residents.filter((r) => {
    const name = r.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Community Management</h1>
      </div>

      <div className="m-10">
        {/* Statistics Cards */}
        <div className="flex gap-4 mb-8">
          <StatCard
            title="Total Residents"
            value={residents.filter((r) => r.role === "RESIDENT").length}
          />
          <StatCard
            title="Security Staff"
            value={residents.filter((r) => r.role === "GUARD").length}
            blue
          />
          <StatCard
            title="Outstanding Balance"
            value={residents.filter((r) => r.withBalance).length}
            red
          />
        </div>

        {/* Search and Action Buttons */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="pl-10 pr-4 py-2 border rounded-xl w-full outline-none focus:ring-2 focus:ring-[#00704e] bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowGuardModal(true)}
              className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md"
            >
              <ShieldCheck className="h-5 w-5" /> Add Guard
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 md:flex-none bg-[#00704e] text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#005a3e] transition-all shadow-md"
            >
              <UserPlus className="h-5 w-5" /> Add Resident
            </button>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Role",
                  "Name",
                  "Address",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredResidents.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                        r.role === "GUARD"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {r.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {r.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.contact}
                  </td>
                  <td className="px-6 py-4">
                    {r.role === "RESIDENT" ? (
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-bold ${
                          r.withBalance
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {r.withBalance ? "Has Balance" : "Cleared"}
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs rounded-full font-bold bg-blue-100 text-blue-700">
                        Active Duty
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedResident(r)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p className="p-10 text-center text-gray-500 animate-pulse">
              Syncing database records...
            </p>
          )}

          {!loading && filteredResidents.length === 0 && (
            <div className="p-20 text-center text-gray-400">
              <ShieldAlert className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="font-medium">No records matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Resident */}
      {showCreateModal && (
        <CreateUser
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEntry}
        />
      )}

      {/* Modal for Guard */}
      {showGuardModal && (
        <CreateUser
          isGuardRole={true}
          onClose={() => setShowGuardModal(false)}
          onCreate={handleCreateEntry}
        />
      )}

      {/* Modal for Editing */}
      {selectedResident && (
        <CreateUser
          editData={selectedResident}
          isGuardRole={selectedResident.role === "GUARD"}
          onClose={() => setSelectedResident(null)}
          onCreate={handleUpdateEntry}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, red, blue }) => (
  <div className="p-6 bg-white shadow-sm rounded-2xl flex-1 border border-gray-100">
    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
      {title}
    </h2>
    <span
      className={`text-4xl font-black ${
        red ? "text-red-500" : blue ? "text-blue-600" : "text-gray-800"
      }`}
    >
      {value}
    </span>
  </div>
);

export default ManageResidents;
