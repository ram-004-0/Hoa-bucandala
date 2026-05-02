import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Home,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const VisitorPass = ({ visitorId, onBack, onDone }) => {
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/visitors/${visitorId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch visitor data");

        const data = await response.json();
        setVisitor(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (visitorId) fetchVisitorData();
  }, [visitorId]);

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

  if (loading)
    return (
      <div className="w-96 bg-white p-12 rounded-2xl shadow-2xl flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-[#00704e]" size={40} />
        <p className="font-bold text-gray-400 animate-pulse">
          GENERATING PASS...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="w-96 bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-600 font-bold text-center">{error}</p>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-100 rounded-xl font-bold"
        >
          Try Again
        </button>
      </div>
    );

  return (
    <div className="w-96 bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-6 items-center animate-in zoom-in duration-300">
      {/* QR Section */}
      <div className="p-6 w-full bg-white rounded-2xl border border-gray-100 shadow-inner flex flex-col items-center gap-3">
        <QRCodeCanvas
          id="visitor-qr"
          value={qrValue}
          size={180}
          level="H"
          includeMargin={true}
        />
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            Gate Pass
          </p>
          <p className="text-lg font-mono font-bold text-green-700">
            #{visitor?.visitor_id}
          </p>
        </div>
      </div>

      {/* Info Details */}
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

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl active:scale-95"
        >
          Back
        </button>
        <button
          onClick={onDone}
          className="flex-1 py-3 bg-[#00704e] text-white font-bold rounded-xl shadow-lg active:scale-95"
        >
          Done
        </button>
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
