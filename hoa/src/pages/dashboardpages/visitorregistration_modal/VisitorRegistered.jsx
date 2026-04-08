import React from "react";
import { CheckCircle } from "lucide-react";

const VisitorRegistered = ({ onClose, onViewPass, visitor }) => {
  return (
    <div className="w-96 md:w-110 bg-white p-8 rounded-2xl shadow-2xl flex flex-col gap-6 justify-center items-center text-center">
      <div className="bg-green-100 p-4 rounded-full">
        <CheckCircle className="text-green-600 w-12 h-12" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-gray-800">
          Registration Success!
        </h1>
        <p className="text-gray-600 px-4">
          <span className="font-bold text-gray-800">
            {visitor?.visitorName || "The visitor"}
          </span>{" "}
          has been registered for{" "}
          <span className="font-bold text-gray-800">{visitor?.date}</span> at{" "}
          <span className="font-bold text-gray-800">{visitor?.time}</span>.
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-100 w-full py-4 flex flex-col rounded-xl">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">
          Registration Reference
        </p>
        <span className="text-xl font-mono font-bold text-gray-700">
          #{visitor?.id || "TEMP-001"}
        </span>
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onViewPass}
          className="px-6 py-4 w-full bg-[#00704e] text-white font-bold rounded-xl hover:bg-green-800 transition-all shadow-lg active:scale-95"
        >
          View Visitor Pass
        </button>

        <button
          onClick={onClose}
          className="px-6 py-3 w-full text-gray-500 font-medium hover:text-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default VisitorRegistered;
