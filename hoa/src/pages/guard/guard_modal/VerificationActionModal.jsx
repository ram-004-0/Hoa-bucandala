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
  const scannerRef = useRef(null);

  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  useEffect(() => {
    if (activeMode === "scan") {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(
        (text) => {
          if (text.includes("|")) {
            const [id, name, addr] = text.split("|");
            setVisitor({
              visitor_id: id,
              visitor_name: name,
              address_to_visit: addr,
              status: "PENDING",
            });
            setActiveMode("manual");
          } else {
            handleSearch(text);
          }
          scanner.clear();
        },
        (err) => {},
      );
      return () => scanner.clear().catch(() => {});
    }
  }, [activeMode]);

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
      found ? setVisitor(found) : setError("Visitor not found");
    } catch (err) {
      setError("Server error");
    }
    setLoading(false);
  };

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
        alert("Access Granted");
        onClose();
      }
    } catch (err) {
      alert("Error updating status");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="font-black text-2xl text-gray-800">Security Check</h2>
          <button onClick={onClose} className="p-2 text-gray-400">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => {
                setActiveMode("manual");
                setVisitor(null);
              }}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${activeMode === "manual" ? "bg-white text-[#00704e]" : "text-gray-500"}`}
            >
              <Search size={18} /> Manual
            </button>
            <button
              onClick={() => {
                setActiveMode("scan");
                setVisitor(null);
              }}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${activeMode === "scan" ? "bg-white text-[#00704e]" : "text-gray-500"}`}
            >
              <Camera size={18} /> Scan QR
            </button>
          </div>

          {activeMode === "manual" ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ID or Name..."
                className="flex-1 p-3.5 border-2 border-gray-100 rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                onClick={() => handleSearch()}
                className="bg-[#00704e] text-white px-6 rounded-2xl font-bold"
              >
                {loading ? <RefreshCw className="animate-spin" /> : "Verify"}
              </button>
            </div>
          ) : (
            <div
              id="reader"
              className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-black aspect-square"
            ></div>
          )}

          {visitor && (
            <div className="border-2 border-green-100 rounded-[2rem] p-6 bg-green-50/40 space-y-4 animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4">
                <div className="bg-[#00704e] p-3 rounded-xl text-white">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg">{visitor.visitor_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {visitor.address_to_visit}
                  </p>
                </div>
              </div>
              <button
                onClick={markArrived}
                disabled={loading}
                className="w-full bg-[#00704e] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2"
              >
                <CheckCircle /> AUTHORIZE ENTRY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationActionModal;
