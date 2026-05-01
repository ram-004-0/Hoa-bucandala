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
  AlertCircle,
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
      const timeoutId = setTimeout(() => {
        scannerRef.current = new Html5QrcodeScanner("reader", {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        });

        scannerRef.current.render(
          (decodedText) => {
            // Logic: Convert "VIS-1-8271" -> "8271"
            const cleanId = decodedText.includes("-")
              ? decodedText.split("-").pop()
              : decodedText;

            handleSearch(cleanId);

            if (scannerRef.current) {
              scannerRef.current.clear().catch((err) => console.error(err));
            }
          },
          (errorMessage) => {
            // Scanning in progress...
          },
        );
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (scannerRef.current) {
          scannerRef.current.clear().catch((err) => console.error(err));
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
      // We fetch all and find client-side to handle both ID and Name searches
      const res = await fetch(`${API_URL}/visitors/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error("Failed to fetch visitors");

      const found = data.find(
        (v) =>
          v.visitor_id.toString() === query.toString() ||
          v.visitor_name.toLowerCase().includes(query.toLowerCase()),
      );

      if (found) {
        setVisitor(found);
        setActiveMode("manual"); // Switch to result view
      } else {
        setError(`No visitor found for "${query}"`);
      }
    } catch (err) {
      setError("Server connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Mark Arrived ---
  const markArrived = async () => {
    setLoading(true);
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
        alert(`Access Granted: ${visitor.visitor_name} has arrived.`);
        onClose();
      } else {
        alert("Update failed. Visitor might already be marked arrived.");
      }
    } catch (err) {
      alert("Network error updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-black text-2xl text-gray-800 tracking-tight">
              Security Check
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                Live Authorization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveMode("manual");
                setVisitor(null);
                setError("");
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === "manual"
                  ? "bg-white shadow-sm text-[#00704e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Search size={18} /> Manual
            </button>
            <button
              onClick={() => {
                setActiveMode("scan");
                setVisitor(null);
                setError("");
              }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                activeMode === "scan"
                  ? "bg-white shadow-sm text-[#00704e]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Camera size={18} /> Scan QR
            </button>
          </div>

          {activeMode === "manual" ? (
            /* Manual Entry Field */
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter ID or Name..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#00704e] bg-gray-50/50 transition-all font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={loading || !searchQuery}
                className="bg-[#00704e] text-white px-6 rounded-2xl font-bold hover:bg-[#005a3e] disabled:opacity-30 transition-all shadow-lg active:scale-95"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  "Verify"
                )}
              </button>
            </div>
          ) : (
            /* Scanning Interface */
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-square border-4 border-white shadow-2xl group">
              <div id="reader" className="w-full h-full"></div>

              {/* Scan Overlay UI */}
              <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
                <div className="w-full h-full border-2 border-green-400/50 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-green-400 shadow-[0_0_15px_rgba(74,222,128,1)] animate-scan"></div>
                </div>
              </div>

              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest bg-black/40 backdrop-blur-md inline-block px-4 py-2 rounded-full">
                  Align QR Code within frame
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm flex items-center gap-3 border border-red-100 animate-shake">
              <AlertCircle size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Visitor Result Card */}
          {visitor && (
            <div className="border-2 border-green-100 rounded-[2rem] p-6 bg-green-50/40 space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-center gap-5">
                <div className="bg-[#00704e] p-4 rounded-2xl text-white shadow-xl shadow-green-900/20">
                  <User size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-xl text-gray-800 leading-tight">
                      {visitor.visitor_name}
                    </h3>
                    <span className="text-[10px] bg-white border border-green-200 text-[#00704e] px-3 py-1 rounded-full font-mono font-black">
                      #{visitor.visitor_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 mt-1 font-medium">
                    <MapPin size={16} className="text-red-400" />
                    <span className="text-sm">{visitor.address_to_visit}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-green-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                    Current Status
                  </p>
                  <span
                    className={`text-xs font-black ${visitor.status === "ARRIVED" ? "text-blue-600" : "text-orange-500"}`}
                  >
                    {visitor.status}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-green-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                    Purpose
                  </p>
                  <span className="text-xs font-black text-gray-700 truncate block">
                    {visitor.purpose_of_visit || "Visiting"}
                  </span>
                </div>
              </div>

              {visitor.status !== "ARRIVED" ? (
                <button
                  onClick={markArrived}
                  disabled={loading}
                  className="w-full bg-[#00704e] text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#005a3e] transition-all active:scale-95 shadow-xl shadow-green-900/20"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <>
                      <CheckCircle size={24} /> AUTHORIZE ENTRY
                    </>
                  )}
                </button>
              ) : (
                <div className="w-full bg-blue-50 text-blue-700 py-4 rounded-2xl font-bold text-center border border-blue-100">
                  Visitor is already inside
                </div>
              )}
            </div>
          )}

          {!visitor && !loading && activeMode === "manual" && (
            <div className="py-12 flex flex-col items-center justify-center opacity-20">
              <div className="w-20 h-20 border-4 border-dashed border-gray-400 rounded-full flex items-center justify-center mb-4">
                <Search size={32} />
              </div>
              <p className="font-bold text-sm uppercase tracking-widest">
                Waiting for input
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 bg-gray-50/80 text-center border-t backdrop-blur-sm">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            CAMELLA BUCANDALA V • SECURE PASS
          </p>
        </div>
      </div>

      {/* Add this CSS to your global stylesheet or a style tag */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          position: absolute;
          animation: scan 2s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `,
        }}
      />
    </div>
  );
};

export default VerificationActionModal;
