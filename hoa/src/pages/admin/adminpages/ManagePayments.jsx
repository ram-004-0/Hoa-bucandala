import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ShieldCheck,
  Search,
  CircleDollarSign,
  X,
  CreditCard,
  AlertCircle,
  Loader2,
} from "lucide-react";

// const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";
const API_URL = "https://hoa-bucandala.onrender.com/api";
const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("pending");

  const [showModal, setShowModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [billData, setBillData] = useState({ amount: 1500, month: "" });
  const [error, setError] = useState("");

  const currentMonthStr = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    setSearchTerm("");
    setSelectedResident(null);
    setError("");
  };

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

      const paymentsData = await payRes.json();
      const residentsData = await resRes.json();

      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setResidents(Array.isArray(residentsData) ? residentsData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX 1: Safely accept targetRecordId and handle instant local state switching
  const handleUpdateStatus = async (targetRecordId, targetStatus) => {
    if (!targetRecordId || targetRecordId === "undefined") {
      console.error("Error: Cannot update payment with undefined ID");
      return;
    }

    const token = localStorage.getItem("token");

    // Optimistically update frontend arrays immediately to clear the row from current tab view
    setPayments((prev) =>
      prev.map((p) => {
        const currentId = p.id || p.billing_id;
        return currentId === targetRecordId
          ? { ...p, status: targetStatus }
          : p;
      }),
    );

    try {
      const res = await fetch(`${API_URL}/payments/${targetRecordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) {
        fetchData(); // Sync up from server if DB update encounters an issue
      }
    } catch (err) {
      console.error("Update failed:", err);
      fetchData();
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setError("");

    if (billData.month < currentMonthStr) {
      setError("Cannot issue a bill for a past month.");
      return;
    }

    const targetResidentId =
      selectedResident?.resident_id || selectedResident?.id;

    const alreadyBilled = payments.find(
      (p) =>
        p.resident_id === targetResidentId &&
        (p.billingMonth === billData.month ||
          p.billing_month === billData.month),
    );

    if (alreadyBilled) {
      setError(
        `A bill for ${billData.month} already exists for this resident.`,
      );
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/payments/create-bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          residentId: targetResidentId,
          amount: Number(billData.amount),
          billingMonth: billData.month,
          status: "Pending",
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setBillData({ amount: 1500, month: "" });
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.message || "Failed to create bill.");
      }
    } catch (err) {
      console.error("Billing operation failed:", err);
      setError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const displayList = (() => {
    const term = searchTerm.toLowerCase().trim();

    if (view === "residents") {
      return residents.filter((r) =>
        (r.full_name || r.residentName || r.name || "")
          .toLowerCase()
          .includes(term),
      );
    }

    return payments.filter((p) => {
      const name = (
        p.residentName ||
        p.full_name ||
        p.name ||
        ""
      ).toLowerCase();
      const matchesName = name.includes(term);
      const normalizedStatus = (p.status || "").trim().toLowerCase();

      let matchesStatus = false;
      if (view === "pending") {
        matchesStatus = normalizedStatus === "pending";
      } else if (view === "history") {
        matchesStatus = normalizedStatus === "paid";
      }

      return matchesName && matchesStatus;
    });
  })();

  const totalCollected = payments
    .filter((p) => (p.status || "").trim().toLowerCase() === "paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const pendingCount = payments.filter(
    (p) => (p.status || "").trim().toLowerCase() === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:opacity-80 transition-all" />
        </Link>
        <h1 className="font-bold text-4xl tracking-tight">
          Payment Verification
        </h1>
      </div>
      <br />
      <br />
      <br />

      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Collections"
            value={`₱${totalCollected.toLocaleString()}`}
            color="text-green-600"
          />
          <StatCard
            title="Pending Review"
            value={pendingCount}
            color="text-yellow-600"
          />
          <StatCard
            title="Total Residents"
            value={residents.length}
            color="text-blue-600"
          />
        </div>

        <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-gray-200 p-1 rounded-xl w-full md:w-auto">
            {["pending", "history", "residents"].map((t) => (
              <TabBtn
                key={t}
                active={view === t}
                onClick={() => handleViewChange(t)}
                label={t.charAt(0).toUpperCase() + t.slice(1)}
              />
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-[#00704e] outline-none shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Resident
                </th>
                {view !== "residents" && (
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                    Year & Month
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  {view === "residents" ? "Address" : "Amount"}
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayList.map((item, index) => {
                // ✅ FIX 2: Check aliases to protect primary keys
                const recordId = item.id || item.billing_id;
                const rowKey =
                  view === "residents"
                    ? `res-${item.resident_id || item.id || index}`
                    : `pay-${recordId || index}`;

                return (
                  <tr
                    key={rowKey}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">
                        {item.residentName ||
                          item.full_name ||
                          item.name ||
                          "Unknown Resident"}
                      </p>
                    </td>
                    {view !== "residents" && (
                      <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {item.billingMonth || item.billing_month}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      {view === "residents" ? (
                        <span className="text-sm text-gray-500">
                          {item.address}
                        </span>
                      ) : (
                        <span className="font-bold text-gray-900">
                          ₱{...Number(item.amount || 0).toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={
                          view === "residents"
                            ? item.has_balance
                              ? "Dues"
                              : "Clean"
                            : item.status
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {view === "residents" ? (
                        <button
                          onClick={() => {
                            setSelectedResident(item);
                            setError("");
                            setShowModal(true);
                          }}
                          className="text-[#00704e] font-bold text-xs flex items-center gap-1 mx-auto hover:scale-105 transition-transform"
                        >
                          <CreditCard className="h-4 w-4" /> Issue Bill
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const currentStatus = (item.status || "")
                              .trim()
                              .toLowerCase();
                            const nextStatus =
                              currentStatus === "pending" ? "Paid" : "Pending";
                            // ✅ FIX 3: Pass safely evaluated parameter matching
                            handleUpdateStatus(recordId, nextStatus);
                          }}
                          className={`text-xs font-black uppercase tracking-tighter px-4 py-2 rounded-lg transition-all ${
                            (item.status || "").trim().toLowerCase() ===
                            "pending"
                              ? "bg-[#00704e] text-white hover:bg-[#005a3e]"
                              : "text-gray-400 hover:text-red-500"
                          }`}
                        >
                          {(item.status || "").trim().toLowerCase() ===
                          "pending"
                            ? "Verify Payment"
                            : "Revert"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayList.length === 0 && !loading && (
            <div className="py-20 text-center">
              <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-medium">
                No records found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-2xl text-[#00704e]">
                  <CircleDollarSign className="h-6 w-6" />
                </div>
                <h3 className="font-black text-2xl text-gray-900 tracking-tight">
                  Issue Bill
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 text-red-700 text-sm font-bold">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">
                  Resident Name
                </label>
                <p className="font-bold text-xl text-gray-800">
                  {selectedResident?.residentName ||
                    selectedResident?.full_name ||
                    selectedResident?.name ||
                    "Unknown Resident"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Billing Month
                  </label>
                  <input
                    type="month"
                    required
                    min={currentMonthStr}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#00704e] outline-none"
                    onChange={(e) =>
                      setBillData({ ...billData, month: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Amount (₱)
                  </label>
                  <input
                    type="number"
                    defaultValue="1500"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-[#00704e] outline-none"
                    onChange={(e) =>
                      setBillData({ ...billData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00704e] text-white font-black py-5 rounded-3xl hover:bg-[#005a3e] shadow-xl shadow-green-900/20 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "CONFIRM & ISSUE BILL"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className="p-8 bg-white shadow-sm rounded-4xl border border-gray-100">
    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
      {title}
    </h2>
    <span className={`text-4xl font-black tracking-tighter ${color}`}>
      {value}
    </span>
  </div>
);

const TabBtn = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active
        ? "bg-white text-[#00704e] shadow-md shadow-gray-200/50"
        : "text-gray-400 hover:text-gray-600"
    }`}
  >
    {label}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Dues: "bg-red-100 text-red-700",
    Clean: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

export default ManagePayments;
