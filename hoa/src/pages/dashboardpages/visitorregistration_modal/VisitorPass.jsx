import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  User,
  Home,
  Calendar,
  Clock,
  FolderArchive,
  Download,
} from "lucide-react";

const VisitorPass = ({ onBack, onDone, visitor }) => {
  // --- UPDATED QR VALUE LOGIC ---
  // Format: "ID:NAME" (e.g., "12:kian ladaga")
  // This ensures the Guard's scanner pulls the ID but sees the name immediately
  const qrValue = visitor?.visitor_id
    ? `${visitor.visitor_id}:${visitor.visitor_name || "Guest"}`
    : "PENDING";

  const formatDate = (dateString) => {
    if (!dateString) return "Not Specified";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not Specified";
    const [hours, minutes] = timeString.split(":");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const displayAddress = visitor?.address_to_visit
    ? visitor.address_to_visit
    : `Phase ${visitor?.phase || ""} Block ${visitor?.block || ""} Lot ${visitor?.lot || ""}`;

  const downloadQR = () => {
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

  return (
    <div className="w-96 md:w-110 bg-white p-6 rounded-2xl shadow-2xl flex flex-col gap-6 items-center animate-in fade-in zoom-in duration-300">
      <div className="relative group p-6 w-full flex flex-col gap-3 bg-white rounded-2xl justify-center items-center border border-gray-100 shadow-inner">
        <QRCodeCanvas
          id="visitor-qr"
          value={qrValue}
          size={180}
          level={"H"}
          includeMargin={true}
        />
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-[0.2em]">
            Gate Entry Pass
          </p>
          <p className="text-lg font-mono font-bold text-green-700">
            {/* Displaying just the ID for visual cleanliness, even if QR has more info */}
            #{visitor?.visitor_id || "---"}
          </p>
        </div>

        <button
          onClick={downloadQR}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-green-600 transition-colors"
          title="Download Pass"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="w-full flex flex-col gap-4 bg-gray-50/50 p-4 rounded-xl">
        <InfoRow
          icon={User}
          label="Visitor Name"
          value={visitor?.visitor_name}
        />
        <InfoRow icon={Home} label="Visiting Address" value={displayAddress} />

        <div className="grid grid-cols-2 gap-4">
          <InfoRow
            icon={Calendar}
            label="Date"
            value={formatDate(visitor?.visit_date || visitor?.date)}
          />
          <InfoRow
            icon={Clock}
            label="Time"
            value={formatTime(visitor?.visit_time || visitor?.time)}
          />
        </div>

        <InfoRow
          icon={FolderArchive}
          label="Purpose of Visit"
          value={visitor?.purpose_of_visit || visitor?.purpose}
        />
      </div>

      <div className="flex gap-3 w-full">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all active:scale-95"
        >
          Back
        </button>
        <button
          onClick={onDone}
          className="flex-1 px-6 py-3 bg-[#00704e] text-white font-bold rounded-xl hover:bg-[#005a3f] transition-all shadow-lg shadow-green-900/20 active:scale-95"
        >
          Done
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center italic">
        Please present this QR code to the security guard upon arrival.
      </p>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-row gap-3 items-center">
    <div className="bg-white p-2 rounded-lg shadow-sm">
      <Icon className="text-green-600 w-4 h-4" />
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">
        {label}
      </span>
      <span className="text-sm text-gray-800 font-semibold truncate max-w-[200px]">
        {value || "Not Specified"}
      </span>
    </div>
  </div>
);

export default VisitorPass;
