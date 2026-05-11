import React, { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeftIcon, Loader2, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const ManageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch reports from backend with Authorization
  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/guard-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Unauthorized or Server Error");

        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/admin">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer hover:text-gray-200" />
        </Link>
        <h1 className="font-bold text-4xl">Manage Reports</h1>
      </div>

      <div className="m-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-10 w-10 text-[#00704e]" />
          </div>
        ) : reports.length > 0 ? (
          <div className="bg-white shadow-md rounded-2xl overflow-hidden border border-gray-100">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Resident",
                    "Type",
                    "Location",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((r) => (
                  <tr
                    key={r.request_id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-gray-700">
                      <div>{r.full_name}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-tighter">
                        {r.contact}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                        {r.type_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {r.location}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-black uppercase ${
                          r.status === "PENDING"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="flex items-center gap-1 text-[#00704e] font-bold hover:underline">
                        <Eye size={16} /> VIEW
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-2xl p-12 text-center mt-8 border-2 border-dashed border-gray-100">
            <ShieldCheck className="h-16 w-16 mx-auto text-gray-200 mb-4" />
            <h3 className="text-xl font-black text-gray-400">
              No security reports found
            </h3>
            <p className="text-gray-400 text-sm">
              Community security logs will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReports;
