import React, { useState } from "react";
import QrScanner from "react-qr-scanner"; // Import the scanner engine
import {
  Search,
  X,
  CheckCircle,
  User,
  MapPin,
  Camera,
  RefreshCw,
} from "lucide-react";

const VerificationActionModal = ({ onClose }) => {
  const [activeMode, setActiveMode] = useState("manual"); // 'manual' or 'scan'
  const [searchQuery, setSearchQuery] = useState("");
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  // --- Logic to Fetch and Find Visitor ---
  const handleSearch = async (queryOverride) => {
    const query = queryOverride || searchQuery;
    if (!query) return;

    setLoading(true);
    setError("");
    setVisitor(null);

    try {
      const res = await fetch(`${API_URL}/visitors/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      // Look for ID match first, then Name match
      const found = data.find(
        (v) =>
          v.visitor_id.toString() === query ||
          v.visitor_name.toLowerCase().includes(query.toLowerCase()),
      );

      if (found) {
        setVisitor(found);
        setActiveMode("manual"); // Switch to manual view to show the result card
      } else {
        setError("No visitor found with that ID or Name.");
      }
    } catch (err) {
      setError("Search failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- QR Scan Handlers ---
  const handleScan = (data) => {
    if (data && data.text) {
      console.log("QR Content:", data.text);
      handleSearch(data.text); // Use the scanned text (Visitor ID) to search
    }
  };

  const handleScanError = (err) => {
    console.error(err);
    setError("Camera error: Please ensure permissions are granted.");
  };

  // --- Update Status Logic ---
  const markArrived = async () => {
    try {
      const res = await fetch(
        `${API_URL}/visitors/${visitor.visitor_id}/status`,
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
        alert(`${visitor.visitor_name} has been marked as ARRIVED`);
        onClose();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-xl">Verify Visitor</h2>
            <p className="text-xs text-gray-500">Security Guard Portal</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode("manual")}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeMode === "manual" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
            >
              <Search size={16} /> Manual Search
            </button>
            <button
              onClick={() => setActiveMode("scan")}
              className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${activeMode === "scan" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
            >
              <Camera size={16} /> Scan QR Code
            </button>
          </div>

          {activeMode === "manual" ? (
            /* MANUAL SEARCH UI */
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Visitor ID or Name..."
                  className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 text-white px-4 rounded-xl font-bold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  "Search"
                )}
              </button>
            </div>
          ) : (
            /* QR SCANNER UI */
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-4 border-gray-100 shadow-inner">
              <QrScanner
                delay={300}
                onError={handleScanError}
                onScan={handleScan}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/30 m-12 rounded-2xl pointer-events-none"></div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/50 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-bold">
                  Align QR in Center
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Result Card */}
          {visitor ? (
            <div className="border-2 border-green-100 rounded-2xl p-4 bg-green-50/30 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl text-gray-800 leading-tight">
                      {visitor.visitor_name}
                    </h3>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-mono font-bold">
                      #{visitor.visitor_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span className="text-sm">{visitor.address_to_visit}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-green-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Current Status
                </span>
                <span
                  className={`text-sm font-black px-3 py-1 rounded-full ${
                    visitor.status === "ARRIVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {visitor.status}
                </span>
              </div>

              {visitor.status !== "ARRIVED" && (
                <button
                  onClick={markArrived}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-200"
                >
                  <CheckCircle size={22} /> Confirm & Mark Arrived
                </button>
              )}
            </div>
          ) : (
            !loading &&
            activeMode === "manual" && (
              <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 text-sm">
                  Ready to verify visitor records.
                </p>
              </div>
            )
          )}
        </div>

        <div className="p-4 bg-gray-50 text-center border-t">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Camella Bucandala V Safety System
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationActionModal;
