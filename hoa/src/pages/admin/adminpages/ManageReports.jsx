import React, { useEffect, useState } from "react";
import { ShieldCheck, ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ManageReports = () => {
  const [reports, setReports] = useState([]);

  // Fetch reports from backend
  useEffect(() => {
    fetch(`${API_URL}/reports`)
      .then((res) => res.json())
      .then(setReports)
      .catch(console.error);
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
        {/* Table */}
        {reports.length > 0 ? (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Title", "Type", "Date", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{r.title}</td>
                    <td className="px-6 py-4 text-gray-600">{r.type}</td>
                    <td className="px-6 py-4 text-gray-600">{r.date}</td>
                    <td className="px-6 py-4 text-gray-600">{r.status}</td>
                    <td className="px-6 py-4">
                      {/* Actions placeholder */}
                      <span className="text-blue-600 cursor-pointer">View</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-8 text-center mt-8">
            <ShieldCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium">No reports found</h3>
            <p className="text-gray-500">Reports will appear here once added</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageReports;
