import React, { useState, useEffect } from "react";
import { ShieldCheck, ArrowLeftIcon, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import CreateUser from "./CreateUser";

const API_URL = "http://localhost:5000/api";

const ManageResidents = () => {
  const [residents, setResidents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch residents with JWT token
  useEffect(() => {
    const token = localStorage.getItem("token"); // Get stored JWT

    if (!token) return; // no token, skip fetching

    fetch(`${API_URL}/residents`, {
      headers: {
        Authorization: `Bearer ${token}`, // send token in header
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or failed to fetch");
        return res.json();
      })
      .then((data) => {
        const transformed = data.map((r) => ({
          id: r.resident_id, // matches backend field
          name: r.full_name,
          email: r.email,
          address: r.address,
          contact: r.contact,
          withBalance: !!r.has_balance,
        }));
        setResidents(transformed);
      })
      .catch((err) => console.error("Failed to fetch residents:", err.message));
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showCreateModal ? "hidden" : "auto";
  }, [showCreateModal]);

  // Add newly created resident to state
  const handleCreateResident = (newResident) => {
    setResidents((prev) => [
      ...prev,
      {
        id: newResident.residentId,
        name: newResident.full_name,
        email: newResident.email,
        address: newResident.address,
        contact: newResident.contact,
        withBalance: newResident.has_balance,
      },
    ]);
  };

  const totalResidents = residents.length;
  const residentsWithBalance = residents.filter((r) => r.withBalance).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Manage Residents</h1>
      </div>

      <div className="m-10">
        {/* Stats */}
        <div className="flex gap-4 mb-8">
          <StatCard title="Total Residents" value={totalResidents} />
          <StatCard title="Active" value={totalResidents} green />
          <StatCard title="With Balance" value={residentsWithBalance} red />
        </div>

        {/* Header + Button */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Residents List</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#00704e] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#005a3e]"
          >
            <Plus className="h-5 w-5" />
            Add New Resident
          </button>
        </div>

        {/* Modal */}
        {showCreateModal && (
          <CreateUser
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateResident}
          />
        )}

        {/* Residents Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {residents.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{r.name}</td>
                  <td className="px-6 py-4 text-gray-600">{r.email}</td>
                  <td className="px-6 py-4 text-gray-600">{r.address}</td>
                  <td className="px-6 py-4 text-gray-600">{r.contact}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        r.withBalance
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {r.withBalance ? "Has Balance" : "No Balance"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <Edit className="h-4 w-4 text-blue-600 cursor-pointer" />
                    <Trash2 className="h-4 w-4 text-red-600 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {residents.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center mt-8">
            <ShieldCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No residents found</h3>
            <p className="text-gray-500">Add your first resident</p>
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, green, red }) => (
  <div className="p-6 bg-white shadow-md rounded-lg flex-1 text-center">
    <h2 className="text-sm text-gray-600 mb-2">{title}</h2>
    <span
      className={`text-3xl font-bold ${green ? "text-green-600" : red ? "text-red-600" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

export default ManageResidents;
