import React from "react";
import { X, LogOut, User, MapPin, Clock, CheckCircle } from "lucide-react";

const CheckOutModal = ({ visitor, onClose, onConfirm, loading }) => {
  if (!visitor) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Matching Theme Green */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#f8faf9]">
          <div className="flex items-center gap-3">
            <div className="bg-[#00704e]/10 p-2 rounded-xl text-[#00704e]">
              <LogOut size={20} />
            </div>
            <h2 className="font-bold text-gray-900 text-lg tracking-tight">
              Verify Departure
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-800 rounded-full transition-colors"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-7">
          <div className="flex flex-col items-center text-center mb-6 border-b border-gray-100 pb-6">
            <div className="bg-gradient-to-br from-[#00704e] to-[#005a3f] p-5 rounded-3xl mb-4 text-white shadow-lg shadow-green-900/20 relative">
              <User size={40} strokeWidth={1.5} />
              <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full border border-gray-100 text-[#00704e]">
                <CheckCircle size={18} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-950 tracking-tight">
              {visitor.visitor_name}
            </h3>
            <span className="text-xs font-mono text-[#00704e] bg-[#00704e]/5 px-3 py-1 rounded-full mt-2 uppercase tracking-widest font-bold">
              ID: {visitor.visitor_id}
            </span>
          </div>

          {/* Details - Cleaner rows */}
          <div className="space-y-3.5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 text-sm">
            <DetailRow
              icon={User}
              label="Visiting Resident"
              value={visitor.host_resident}
            />
            <DetailRow
              icon={MapPin}
              label="Destination Address"
              value={visitor.address_to_visit}
            />
            <DetailRow
              icon={Clock}
              label="Entry Registered At"
              value={visitor.expected_time}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#f8faf9] flex gap-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-colors active:scale-95 text-sm"
          >
            Stay Inside
          </button>
          <button
            onClick={() => onConfirm(visitor.visitor_id)}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl font-bold bg-[#00704e] text-white hover:bg-[#005a3f] transition-all active:scale-95 disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-900/10"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                {" "}
                <CheckCircle size={16} /> Confirm Exit{" "}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Internal Helper Component for Details
const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex flex-row gap-3 items-start">
    <Icon className="text-[#00704e] w-4 h-4 mt-1 flex-shrink-0" />
    <div className="flex flex-col flex-1">
      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider leading-none mb-1">
        {label}
      </span>
      <span className="text-gray-800 font-semibold leading-tight">
        {value || "Not Recorded"}
      </span>
    </div>
  </div>
);

export default CheckOutModal;
