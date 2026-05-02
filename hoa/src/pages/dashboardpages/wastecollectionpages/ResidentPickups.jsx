import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  ClipboardList,
  History,
  MapPin,
  AlertTriangle,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";

// Updated Base URL
const API_URL = "https://hoa-camellabucandalav-production.up.railway.app";

const ResidentPickups = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const fetchMyHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      // Updated to fetch from the general reports endpoint
      const res = await fetch(`${API_URL}/api/reports/my-reports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === "Uncollected Garbage") {
      return (
        <Trash2 className="bg-red-100 text-red-600 rounded p-2 w-11 h-11" />
      );
    }
    return (
      <AlertTriangle className="bg-orange-100 text-orange-600 rounded p-2 w-11 h-11" />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80 transition-opacity" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Report History</h1>
          <p className="opacity-90">
            Track your uncollected and overflow reports
          </p>
        </div>
      </div>

      <div className="m-10 flex flex-col gap-4 content-center justify-center max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <ClipboardList className="text-[#00704e]" /> Recent Submissions
        </h2>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-[#00704e]" />
            <p className="mt-4 text-gray-500">Loading your history...</p>
          </div>
        ) : reports.length > 0 ? (
          reports.map((report) => (
            <div
              key={report.id || report.report_id}
              className="shadow-md rounded-xl p-6 grid grid-cols-[12%_58%_30%] bg-white items-center border border-gray-100 hover:border-gray-200 transition-all"
            >
              {/* Icon Section */}
              <div className="flex justify-start">
                {getIcon(report.reportType)}
              </div>

              {/* Details Section */}
              <div className="pr-4">
                <h1 className="font-bold text-gray-800 leading-tight">
                  {report.reportType}
                </h1>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{report.location}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
                  {report.description}
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  Submitted on:{" "}
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Status Section */}
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider shadow-sm border ${
                    report.status === "RESOLVED"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : report.status === "IN PROGRESS"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}
                >
                  {report.status || "Pending Review"}
                </span>

                {/* Visual indicator for high severity reports if applicable */}
                {report.description.includes("Critical") && (
                  <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">
                    HIGH PRIORITY
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-dashed border-gray-300">
            <History className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No reports found.</p>
            <Link
              to="/wastecollection"
              className="text-[#00704e] text-sm font-bold underline mt-2 inline-block"
            >
              File a report now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResidentPickups;
