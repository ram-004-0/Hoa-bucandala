import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Home,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";

/**
 * VisitorPass Component
 * @param {Object} visitor - Optional: visitor data passed directly from registration
 * @param {string|number} visitorId - Optional: ID to fetch if full data isn't provided
 * @param {function} onBack - Navigation handler
 * @param {function} onDone - Close handler
 */
const VisitorPass = ({ visitor, visitorId, onBack, onDone }) => {
  const [visitorData, setVisitorData] = useState(visitor || null);
  const [loading, setLoading] = useState(!visitor);
  const [error, setError] = useState(null);

  // Correct URL for your current production backend
  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  useEffect(() => {
    // If we already have the full visitor object from props, don't fetch
    if (visitor) {
      setVisitorData(visitor);
      setLoading(false);
      return;
    }

    // Otherwise, fetch using the ID
    const fetchVisitorData = async () => {
      if (!visitorId) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) throw new Error("Session expired. Please log in again.");

        const response = await fetch(`${API_URL}/visitors/${visitorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data = await response.json();
        setVisitorData(data);
      } catch (err) {
        console.error("Pass Generation Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [visitor, visitorId]);

  // QR Structure: "ID|NAME|ADDRESS" - optimized for the Security Guard's scanner
  const qrValue =
    visitorData?.visitor_id || visitorData?.id
      ? `${visitorData.visitor_id || visitorData.id}|${visitorData.visitor_name || visitorData.visitorName}|${visitorData.address_to_visit || visitorData.address || "Camella Bucandala"}`
      : "INVALID_PASS";

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "---";

  const downloadQRCode = () => {
    const canvas = document.getElementById("visitor-qr");
    if (!canvas) return;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `Pass_${visitorData?.visitor_name || "Visitor"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="w-96 bg-white p-12 rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#00704e]" size={40} />
        <p className="font-bold text-gray-400 animate-pulse text-center uppercase tracking-widest text-xs">
          Generating Secure Pass...
        </p>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="w-96 bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-600 font-bold text-center leading-tight">
          {error}
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  // 3. Main Pass View
  return (
    <div className="w-96 bg-white p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-6 items-center animate-in zoom-in duration-300">
      <div className="relative p-6 w-full bg-white rounded-3xl border-2 border-gray-50 shadow-inner flex flex-col items-center gap-3 group">
        <QRCodeCanvas
          id="visitor-qr"
          value={qrValue}
          size={220}
          level="H"
          includeMargin={true}
        />
        <button
          onClick={downloadQRCode}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-3xl gap-2"
        >
          <Download size={32} />
          <span className="font-bold text-xs uppercase tracking-tighter">
            Save to Gallery
          </span>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
            Official Gate Pass
          </p>
          <p className="text-lg font-mono font-bold text-[#00704e]">
            #{visitorData?.visitor_id || visitorData?.id}
          </p>
        </div>
      </div>

      <div className="w-full space-y-4 bg-gray-50/80 p-5 rounded-2xl">
        <InfoRow
          icon={User}
          label="Visitor Name"
          value={visitorData?.visitor_name || visitorData?.visitorName}
        />
        <InfoRow
          icon={Home}
          label="Visiting Address"
          value={
            visitorData?.address_to_visit ||
            visitorData?.address ||
            "Camella Bucandala"
          }
        />
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200/50">
          <InfoRow
            icon={Calendar}
            label="Date"
            value={formatDate(visitorData?.expected_date || visitorData?.date)}
          />
          <InfoRow
            icon={Clock}
            label="Arrival Time"
            value={visitorData?.expected_time || visitorData?.time}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={downloadQRCode}
          className="w-full py-4 bg-[#00704e] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#005a3e] active:scale-95 transition-all"
        >
          <Download size={20} /> Download Pass
        </button>
        <div className="flex gap-3 w-full">
          <button
            onClick={onBack}
            className="flex-1 py-3 border-2 border-gray-100 text-gray-400 font-bold rounded-xl active:scale-95 transition-all hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-3 bg-gray-800 text-white font-bold rounded-xl active:scale-95 transition-all hover:bg-gray-900 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 items-start">
    <div className="mt-1 bg-white p-1.5 rounded-lg shadow-sm">
      <Icon className="text-[#00704e] w-3.5 h-3.5" />
    </div>
    <div className="flex flex-col text-left">
      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-black truncate max-w-[180px]">
        {value || "Not Specified"}
      </span>
    </div>
  </div>
);

export default VisitorPass;
