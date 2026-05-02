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
  const [activeMode, setActiveMode] = useState("manual");
  const [searchQuery, setSearchQuery] = useState("");
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Corrected URL (removed the extra 'v')
  const API_URL = "https://hoa-camellabucandala-production.up.railway.app/api";

  useEffect(() => {
    let scanner = null;
    if (activeMode === "scan") {
      scanner = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      });

      scanner.render(
        (text) => {
          console.log("QR Scanned:", text);
          if (text.includes("|")) {
            // Logic for the ID|NAME|ADDRESS format
            const [id, name, addr] = text.split("|");
            setVisitor({
              visitor_id: id,
              visitor_name: name,
              address_to_visit: addr,
              status: "PENDING",
            });
            setActiveMode("manual"); // Switch back to show the result
          } else {
            // Fallback for raw ID scans
            handleSearch(text);
          }
          scanner.clear();
        },
        (err) => {
          // Silent catch for scanning frame errors
        },
      );
    }
    return () => {
      if (scanner) {
        scanner
          .clear()
          .catch((error) => console.error("Scanner cleanup failed", error));
      }
    };
  }, [activeMode]);

  const handleSearch = async (queryOverride) => {
    const query = queryOverride || searchQuery;
    if (!query) return;

    setLoading(true);
    setError("");
    setVisitor(null);

    try {
      const token = localStorage.getItem("token");

      // OPTIMIZATION: If the query is a number, fetch by ID directly
      if (!isNaN(query)) {
        const res = await fetch(`${API_URL}/visitors/${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setVisitor(data);
        } else {
          setError("Visitor ID not found");
        }
      } else {
        // Fallback: Search by name by fetching all (or use a search endpoint if you have one)
        const res = await fetch(`${API_URL}/visitors/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const found = data.find((v) =>
          v.visitor_name.toLowerCase().includes(query.toLowerCase()),
        );
        found ? setVisitor(found) : setError("No visitor found with that name");
      }
    } catch (err) {
      setError("Connection error. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  const markArrived = async () => {
    // Use || to handle different naming conventions from your API/Scanner
    const id = visitor?.visitor_id || visitor?.id;

    if (!id) {
      alert("Error: No Visitor ID found to authorize.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/visitors/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "ARRIVED" }),
      });

      if (res.ok) {
        alert(`Access Granted: ${visitor.visitor_name} has arrived.`);
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Failed: ${errorData.message || "Check permissions."}`);
      }
    } catch (err) {
      alert("Connection error while updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-black text-2xl text-gray-800">Security Check</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeMode === "manual"
                  ? "bg-white text-[#00704e] shadow-sm"
                  : "text-gray-500"
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
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                activeMode === "scan"
                  ? "bg-white text-[#00704e] shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Camera size={18} /> Scan QR
            </button>
          </div>

          {/* Input/Scanner Area */}
          {activeMode === "manual" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter ID or Visitor Name..."
                  className="flex-1 p-3.5 border-2 border-gray-100 rounded-2xl focus:border-[#00704e] outline-none transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={() => handleSearch()}
                  disabled={loading}
                  className="bg-[#00704e] text-white px-6 rounded-2xl font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    "Verify"
                  )}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 p-3 rounded-xl">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </div>
          ) : (
            <div
              id="reader"
              className="rounded-3xl overflow-hidden border-4 border-gray-100 shadow-inner bg-black aspect-square"
            ></div>
          )}

          {/* Result Card */}
          {visitor && (
            <div className="border-2 border-green-100 rounded-[2rem] p-6 bg-green-50/40 space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#00704e] p-3 rounded-xl text-white shadow-lg">
                  <User size={28} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg text-gray-800">
                      {visitor.visitor_name}
                    </h3>
                    <span className="text-[10px] bg-[#00704e]/10 text-[#00704e] px-2 py-0.5 rounded-full font-bold">
                      ID: {visitor.visitor_id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {visitor.address_to_visit}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={markArrived}
                  disabled={loading}
                  className="w-full bg-[#00704e] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-[#005a3e] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <CheckCircle />
                  )}
                  AUTHORIZE ENTRY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationActionModal;
