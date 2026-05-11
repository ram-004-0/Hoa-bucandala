import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ShieldCheck,
  ArrowLeftIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import CreateUser from "./CreateUser";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const ManageResidents = () => {
  const navigate = useNavigate();
  const isMounted = useRef(true); // Track if component is still in the DOM

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("RESIDENT");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGuardModal, setShowGuardModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Stabilized fetch with AbortController support
  const fetchAllUsers = useCallback(async (signal) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/residents`, {
        headers: { Authorization: `Bearer ${token}` },
        signal, // Attach the abort signal here
      });

      const data = await res.json();

      // Only update state if the component hasn't been unmounted/logged out
      if (isMounted.current) {
        const transformed = data.map((u) => ({
          id: u.resident_id || u.id,
          account_id: u.account_id,
          name: u.full_name || u.name || u.username,
          email: u.email,
          address: u.address,
          contact: u.contact,
          role: u.role || "RESIDENT",
          withBalance: !!u.has_balance,
        }));
        setUsers(transformed);
      }
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Fetch aborted on logout/unmount");
      } else {
        console.error("Fetch failed:", err);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();

    fetchAllUsers(controller.signal);

    return () => {
      // KILL everything when the user leaves or logs out
      isMounted.current = false;
      controller.abort();
    };
  }, [fetchAllUsers]);

  // Updated Logout logic to prevent the "Node not found" error
  const handleLogout = () => {
    isMounted.current = false;
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`))
      return;

    const token = localStorage.getItem("token");
    const rolePath = user.role === "RESIDENT" ? "residents" : "guards";

    try {
      const res = await fetch(`${API_URL}/${rolePath}/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok && isMounted.current) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleCreateEntry = (newEntry) => {
    if (newEntry.role === "ADMIN") return;

    const formatted = {
      id: newEntry.resident_id || newEntry.id,
      account_id: newEntry.account_id,
      name: newEntry.full_name || newEntry.username || newEntry.name,
      email: newEntry.email,
      address: newEntry.address || "N/A",
      contact: newEntry.contact || "N/A",
      role: newEntry.role,
      withBalance: !!newEntry.has_balance,
    };
    setUsers((prev) => [...prev, formatted]);
    setShowCreateModal(false);
    setShowGuardModal(false);
  };

  const handleUpdateEntry = (updated) => {
    setSelectedUser(null);
    setUsers((prev) =>
      prev.map((u) => {
        const isMatch =
          u.account_id === updated.account_id ||
          u.id === (updated.resident_id || updated.id);
        if (isMatch) {
          return {
            ...u,
            name: updated.full_name || updated.name || u.name,
            email: updated.email || u.email,
            address: updated.address || u.address,
            contact: updated.contact || u.contact,
            withBalance:
              updated.has_balance !== undefined
                ? !!updated.has_balance
                : u.withBalance,
          };
        }
        return u;
      }),
    );
  };

  const filteredDisplay = users.filter(
    (u) =>
      u.role === currentTab &&
      (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 hover:text-gray-200" />
        </Link>
        <div className="flex justify-between items-center w-full pr-10">
          <h1 className="font-bold text-4xl">Community Management</h1>
          {/* Added a Logout button here as well just in case, or you can use your sidebar/header */}
        </div>
      </div>

      <div className="m-10">
        <div className="flex gap-4 mb-8">
          <StatCard
            title="Total Residents"
            value={users.filter((u) => u.role === "RESIDENT").length}
          />
          <StatCard
            title="Security Staff"
            value={users.filter((u) => u.role === "GUARD").length}
            blue
          />
          <StatCard
            title="Outstanding Balance"
            value={users.filter((u) => u.withBalance).length}
            red
          />
        </div>

        {/* ... (rest of your UI: Tabs, Search, Table) ... */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setCurrentTab("RESIDENT")}
            className={`px-6 py-3 font-bold text-sm transition-all flex items-center gap-2 ${
              currentTab === "RESIDENT"
                ? "border-b-2 border-[#00704e] text-[#00704e]"
                : "text-gray-400"
            }`}
          >
            <Users className="h-4 w-4" /> Residents
          </button>
          <button
            onClick={() => setCurrentTab("GUARD")}
            className={`px-6 py-3 font-bold text-sm transition-all flex items-center gap-2 ${
              currentTab === "GUARD"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400"
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> Security Guards
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${currentTab.toLowerCase()}s...`}
              className="pl-10 pr-4 py-2 border rounded-xl w-full outline-none focus:ring-2 focus:ring-[#00704e] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() =>
              currentTab === "GUARD"
                ? setShowGuardModal(true)
                : setShowCreateModal(true)
            }
            className={`px-6 py-2.5 rounded-xl text-white font-bold flex items-center gap-2 ${currentTab === "GUARD" ? "bg-blue-600" : "bg-[#00704e]"}`}
          >
            {currentTab === "GUARD" ? <Plus /> : <UserPlus />} Add {currentTab}
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Address", "Contact", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredDisplay.map((u) => (
                <tr key={u.account_id || u.id}>
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
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-bold ${u.withBalance ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                    >
                      {u.role === "GUARD"
                        ? "Active Duty"
                        : u.withBalance
                          ? "Has Balance"
                          : "Cleared"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-4">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-blue-500 hover:scale-110 transition-transform"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-red-400 hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
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
    <h2 className="text-[10px] font-black text-gray-400 uppercase mb-1">
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
