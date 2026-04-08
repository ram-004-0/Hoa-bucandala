import React, { useState } from "react";
import { Search, X, CheckCircle, User, MapPin } from "lucide-react";

const VerificationActionModal = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    try {
      // We'll call your /all visitors endpoint and filter,
      // or create a specific /verify?q= search endpoint
      const res = await fetch(`http://localhost:5000/api/visitors/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      // Find visitor by ID (VIS-...) or partial Name match
      const found = data.find(
        (v) =>
          v.visitor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          searchQuery.toUpperCase().includes(v.visitor_id.toString()),
      );

      if (found) setVisitor(found);
      else setError("No visitor found with that ID or Name.");
    } catch (err) {
      setError("Search failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const markArrived = async () => {
    try {
      // Add a backend route: PATCH /api/visitors/:id/status
      const res = await fetch(
        `http://localhost:5000/api/visitors/${visitor.visitor_id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: "ARRIVED" }),
        },
      );

      if (res.ok) {
        alert("Visitor marked as ARRIVED");
        onClose();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-xl">Verify Visitor</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter Visitor ID or Name..."
                className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Result Area */}
          {visitor ? (
            <div className="border rounded-2xl p-4 bg-blue-50/50 space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {visitor.visitor_name}
                  </h3>
                  <p className="text-xs text-blue-600 font-mono">
                    ID: {visitor.visitor_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> {visitor.address_to_visit}
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  Status:{" "}
                  <span className="text-orange-600">{visitor.status}</span>
                </div>
              </div>

              <button
                onClick={markArrived}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
              >
                <CheckCircle size={20} /> Confirm Entry
              </button>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-400">
              <p>Enter details above to find the visitor's record.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationActionModal;
