import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
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

  // Ref to track the scanner instance
  const scannerRef = useRef(null);

  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  // --- Initialize/Cleanup Scanner ---
  useEffect(() => {
    if (activeMode === "scan") {
      // Small timeout to ensure the DOM element #reader is rendered
      const timeoutId = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        });

        scannerRef.current.render(
          (decodedText) => {
            // On Success
            handleSearch(decodedText);
            if (scannerRef.current) {
              scannerRef.current
                .clear()
                .catch((err) => console.error("Failed to clear scanner", err));
            }
          },
          (errorMessage) => {
            // Errors happen every frame if no QR is found, so we don't set state here
          },
        );
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scannerRef.current) {
          scannerRef.current
            .clear()
            .catch((err) => console.error("Cleanup error", err));
        }
      };
    }
  }, [activeMode]);

  // --- Search Logic ---
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

      const found = data.find(
        (v) =>
          v.visitor_id.toString() === query ||
          v.visitor_name.toLowerCase().includes(query.toLowerCase()),
      );

      if (found) {
        setVisitor(found);
        setActiveMode("manual"); // Switch to result view
      } else {
        setError("No visitor found with that ID or Name.");
      }
    } catch (err) {
      setError("Search failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  // --- Mark Arrived ---
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
        alert(`${visitor.visitor_name} marked as ARRIVED`);
        onClose();
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="font-bold text-xl text-gray-800">Verify Visitor</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Security Guard Portal
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Mode Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveMode("manual")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === "manual"
                  ? "bg-white shadow text-[#00704e]"
                  : "text-gray-500"
              }`}
            >
              <Search size={16} /> Manual
            </button>
            <button
              onClick={() => setActiveMode("scan")}
              className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === "scan"
                  ? "bg-white shadow text-[#00704e]"
                  : "text-gray-500"
              }`}
            >
              <Camera size={16} /> Scan QR
            </button>
          </div>

          {activeMode === "manual" ? (
            /* MANUAL UI */
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ID or Name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00704e]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-[#00704e] text-white px-5 rounded-xl font-bold hover:bg-[#005a3e] disabled:opacity-50 transition-colors shadow-md"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  "Find"
                )}
              </button>
            </div>
          ) : (
            /* SCANNER UI */
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square border-4 border-white shadow-xl">
              <div id="reader" className="w-full h-full"></div>
              {/* Optional UI Overlay */}
              <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center font-bold border border-red-100">
              {error}
            </div>
          )}

          {/* Result View */}
          {visitor ? (
            <div className="border-2 border-green-100 rounded-2xl p-4 bg-green-50/30 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-start gap-4">
                <div className="bg-[#00704e] p-3 rounded-xl text-white shadow-lg">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                      {visitor.visitor_name}
                    </h3>
                    <span className="text-[10px] bg-[#00704e]/10 text-[#00704e] px-2 py-0.5 rounded-md font-mono font-bold">
                      #{visitor.visitor_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1">
                    <MapPin size={14} />
                    <span className="text-xs">{visitor.address_to_visit}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-green-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  Status
                </span>
                <span
                  className={`text-[10px] font-black px-3 py-1 rounded-full ${
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
                  className="w-full bg-[#00704e] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#005a3e] transition-all active:scale-95 shadow-lg"
                >
                  <CheckCircle size={20} /> Mark as Arrived
                </button>
              )}
            </div>
          ) : (
            !loading &&
            activeMode === "manual" && (
              <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 text-xs font-medium">
                  No record selected
                </p>
              </div>
            )
          )}
        </div>

        <div className="p-4 bg-gray-50 text-center border-t">
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            Camella Bucandala V Safety System
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationActionModal;
