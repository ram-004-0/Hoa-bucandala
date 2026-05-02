import React, { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Home,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  Download,
  ArrowLeft,
} from "lucide-react";

const VisitorPass = ({ visitorId, onBack, onDone }) => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ensure this URL is 100% correct. Check for the "v" at the end of "bucandala"
  const API_URL = "https://hoa-camellabucandala-production.up.railway.app/api";

  useEffect(() => {
    // 1. If ID is missing, don't throw an error immediately.
    // It might be arriving from a state update in the parent.
    if (!visitorId) {
      console.warn("VisitorPass: Waiting for visitorId...");
      return;
    }

    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token)
          throw new Error(
            "Authentication session expired. Please log in again.",
          );

        const response = await fetch(`${API_URL}/visitors/${visitorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Server error: ${response.status}`,
          );
        }

        const data = await response.json();
        setVisitor(data);
      } catch (err) {
        console.error("Pass Generation Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [visitorId]); // Runs whenever visitorId changes

  // QR Structure: "ID|NAME|ADDRESS"
  const qrValue = visitor?.visitor_id
    ? `${visitor.visitor_id}|${visitor.visitor_name}|${visitor.address_to_visit}`
    : "PENDING";

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
    downloadLink.download = `Pass_${visitor?.visitor_name || "Visitor"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // If no ID and no error yet, show a soft loading state instead of a hard error
  if (!visitorId && !error) {
    return (
      <div className="w-96 bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#00704e]" size={40} />
        <p className="font-bold text-gray-400">PREPARING PASS...</p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="w-96 bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#00704e]" size={40} />
        <p className="font-bold text-gray-400 animate-pulse text-center">
          FETCHING VISITOR DATA...
          <br />
          <span className="text-[10px] font-normal uppercase tracking-widest">
            ID: {visitorId}
          </span>
        </p>
      </div>
    );

  if (error)
    return (
      <div className="w-96 bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-600 font-bold text-center leading-tight">
          {error}
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="w-96 bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-6 items-center animate-in zoom-in duration-300">
      <div className="relative p-6 w-full bg-white rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center gap-3 group">
        <QRCodeCanvas
          id="visitor-qr"
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
        <button
          onClick={downloadQRCode}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-2xl gap-2"
        >
          <Download size={32} />
          <span className="font-bold text-xs uppercase">Save to Gallery</span>
        </button>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            Gate Pass
          </p>
          <p className="text-lg font-mono font-bold text-green-700">
            #{visitor?.visitor_id}
          </p>
        </div>
      </div>

      <div className="w-full space-y-4 bg-gray-50/50 p-4 rounded-xl">
        <InfoRow icon={User} label="Visitor" value={visitor?.visitor_name} />
        <InfoRow
          icon={Home}
          label="Address"
          value={visitor?.address_to_visit}
        />
        <div className="grid grid-cols-2 gap-4">
          <InfoRow
            icon={Calendar}
            label="Date"
            value={formatDate(visitor?.expected_date)}
          />
          <InfoRow icon={Clock} label="Time" value={visitor?.expected_time} />
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={downloadQRCode}
          className="w-full py-4 bg-[#00704e] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-[#005a3e] active:scale-95 transition-all"
        >
          <Download size={20} /> Download Pass
        </button>
        <div className="flex gap-3 w-full">
          <button
            onClick={onBack}
            className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl active:scale-95 transition-all"
          >
            Back
          </button>
          <button
            onClick={onDone}
            className="flex-1 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 items-center">
    <Icon className="text-green-600 w-4 h-4" />
    <div className="flex flex-col text-left">
      <span className="text-[9px] text-gray-400 font-bold uppercase">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-bold truncate max-w-[180px]">
        {value || "Not Specified"}
      </span>
    </div>
  </div>
);

export default VisitorPass;
