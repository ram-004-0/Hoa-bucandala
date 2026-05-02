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
  const [users, setUsers] = useState([]); // Renamed to users since it holds both
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      // Changed endpoint to /users to get the joined data from the controller above
      const res = await fetch(`${API_URL}/guards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const transformed = data.map((u) => ({
        id: u.id,
        name: u.name || "Unnamed",
        email: u.email,
        address: u.address || "N/A",
        contact: u.contact || "N/A",
        role: u.role,
        withBalance: !!u.has_balance,
      }));
      setUsers(transformed);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This deletes the login account and profile.",
      )
    )
      return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCreateEntry = (newEntry) => {
    const formatted = {
      id: newEntry.id,
      name: newEntry.full_name || newEntry.username,
      email: newEntry.email,
      address: newEntry.address || "N/A",
      contact: newEntry.contact || "N/A",
      role: newEntry.role,
      withBalance: !!newEntry.has_balance,
    };
    setUsers((prev) => [...prev, formatted]);
  };

  const handleUpdateEntry = (updated) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updated.id
          ? {
              ...u,
              ...updated,
              name: updated.full_name || updated.username || u.name,
            }
          : u,
      ),
    );
    setSelectedUser(null);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Community Management</h1>
      </div>

      <div className="m-10">
        <div className="flex gap-4 mb-8">
          <StatCard
            title="Total Residents"
            value={users.filter((u) => u.role === "RESIDENT").length}
          />
          <StatCard
            title="Security Staff"
            value={users.filter((u) => u.role === "GUARD").length} // Fixed the variable here
            blue
          />
          <StatCard
            title="Outstanding Balance"
            value={users.filter((u) => u.withBalance).length}
            red
          />
        </div>

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
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                        u.role === "GUARD"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.contact}
                  </td>
                  <td className="px-6 py-4">
                    {u.role === "RESIDENT" ? (
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-bold ${
                          u.withBalance
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {u.withBalance ? "Has Balance" : "Cleared"}
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
                        onClick={() => setSelectedUser(u)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-red-400 hover:text-red-600"
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
        </div>
      </div>

      {showCreateModal && (
        <CreateUser
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateEntry}
        />
      )}
      {showGuardModal && (
        <CreateUser
          isGuardRole={true}
          onClose={() => setShowGuardModal(false)}
          onCreate={handleCreateEntry}
        />
      )}
      {selectedUser && (
        <CreateUser
          editData={selectedUser}
          isGuardRole={selectedUser.role === "GUARD"}
          onClose={() => setSelectedUser(null)}
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
      className={`text-4xl font-black ${red ? "text-red-500" : blue ? "text-blue-600" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

export default ManageResidents;
