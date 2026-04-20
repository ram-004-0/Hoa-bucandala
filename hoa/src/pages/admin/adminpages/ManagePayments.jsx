import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShieldCheck,
  Search,
  CircleDollarSign,
  X,
  CreditCard,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("pending");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [billData, setBillData] = useState({ amount: 1500, month: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [payRes, resRes] = await Promise.all([
        fetch(`${API_URL}/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/residents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!payRes.ok || !resRes.ok) throw new Error("Fetch failed");

      setPayments(await payRes.json());
      setResidents(await resRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/payments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      fetchData();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const newBill = {
      residentId: selectedResident.resident_id, // Ensure this isn't undefined
      amount: billData.amount || 1500,
      billingMonth: billData.month, // e.g., "2026-04"
      status: "Pending",
    };

    try {
      const res = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBill),
      });

      if (res.ok) {
        setShowModal(false);
        fetchData(); // Refresh the list
      } else {
        const err = await res.json();
        console.error("Server says:", err.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  // Logic for filtering
  const displayList = (() => {
    const term = searchTerm.toLowerCase();
    if (view === "residents") {
      return residents.filter((r) => r.full_name.toLowerCase().includes(term));
    }
    if (view === "pending") {
      return payments.filter(
        (p) =>
          p.status === "Pending" && p.residentName.toLowerCase().includes(term),
      );
    }
    if (view === "history") {
      return payments.filter(
        (p) =>
          p.status === "Paid" && p.residentName.toLowerCase().includes(term),
      );
    }
    return [];
  })();

  const totalCollected = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingCount = payments.filter((p) => p.status === "Pending").length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200 transition-colors" />
        </Link>
        <h1 className="font-bold text-4xl">Payment Verification</h1>
      </div>

      <div className="m-10">
        <div className="flex gap-4 mb-8">
          <StatCard
            title="Total Collections"
            value={`₱${totalCollected.toLocaleString()}`}
            green
          />
          <StatCard title="Pending Review" value={pendingCount} yellow />
          <StatCard title="Registered Residents" value={residents.length} />
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <TabBtn
              active={view === "pending"}
              onClick={() => setView("pending")}
              label="Pending"
            />
            <TabBtn
              active={view === "history"}
              onClick={() => setView("history")}
              label="History"
            />
            <TabBtn
              active={view === "residents"}
              onClick={() => setView("residents")}
              label="Resident List"
            />
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-[#00704e] outline-none border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {view === "residents"
                  ? ["Resident", "Address", "Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))
                  : [
                      "Resident",
                      "Billing Month",
                      "Amount",
                      "Status",
                      "Action",
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
              {displayList.map((item) => (
                <tr
                  key={item.id || item.resident_id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {view === "residents" ? (
                    <>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {item.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {item.address}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-bold ${item.has_balance ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {item.has_balance ? "Has Dues" : "No Dues"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedResident(item);
                            setShowModal(true);
                          }}
                          className="text-[#00704e] font-bold text-xs flex items-center gap-1 hover:underline"
                        >
                          <CreditCard className="h-4 w-4" /> Issue Bill
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {item.residentName}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm italic">
                        {item.billingMonth}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₱{Number(item.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-bold ${item.status === "Paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "Pending" ? (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "Paid")}
                            className="bg-[#00704e] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#005a3e]"
                          >
                            Verify
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleUpdateStatus(item.id, "Pending")
                            }
                            className="text-gray-400 hover:text-red-500 text-xs font-bold transition-colors"
                          >
                            Revert
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {displayList.length === 0 && !loading && (
            <div className="p-20 text-center text-gray-400">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="italic">No records found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <CircleDollarSign className="h-6 w-6 text-[#00704e]" />
                <h3 className="font-bold text-xl text-gray-900">
                  Issue Monthly Bill
                </h3>
              </div>
              <button onClick={() => setShowModal(false)}>
                <X className="h-6 w-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-8 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resident</p>
                <p className="font-bold text-lg text-gray-800">
                  {selectedResident?.full_name}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Billing Month
                  </label>
                  <input
                    type="month"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-[#00704e] outline-none"
                    onChange={(e) =>
                      setBillData({ ...billData, month: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    defaultValue="1500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 font-bold focus:ring-2 focus:ring-[#00704e] outline-none"
                    onChange={(e) =>
                      setBillData({ ...billData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl flex gap-2 border border-blue-100">
                <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-[11px] text-blue-800 leading-tight">
                  This creates a "Pending" record. You will manually verify this
                  once the resident provides proof of external payment.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00704e] text-white font-bold py-4 rounded-2xl hover:bg-[#005a3e] shadow-lg shadow-green-900/20 transition-all"
              >
                CONFIRM & ISSUE BILL
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, green, yellow, red }) => (
  <div className="p-6 bg-white shadow-md rounded-lg flex-1 text-center border border-gray-100">
    <h2 className="text-sm text-gray-500 mb-2 font-medium">{title}</h2>
    <span
      className={`text-3xl font-bold ${green ? "text-green-600" : yellow ? "text-yellow-600" : red ? "text-red-600" : "text-gray-800"}`}
    >
      {value}
    </span>
  </div>
);

const TabBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${active ? "bg-white text-[#00704e] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
  >
    {label}
  </button>
);

export default ManagePayments;
