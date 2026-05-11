import React, { useState, useEffect } from "react";
import {
  User,
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Copy,
  Key,
} from "lucide-react";

// --- SuccessModal Component (No changes needed here) ---
const SuccessModal = ({ data, onClose, isGuardRole }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(data.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-gray-800 mb-2">
          Account Created!
        </h3>
        <p className="text-gray-500 text-sm mb-8">
          The {isGuardRole ? "guard" : "resident"} account is ready.
        </p>
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8 relative group">
          <label className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Temporary Password
          </label>
          <div className="flex items-center justify-center gap-3">
            <Key size={18} className="text-gray-400" />
            <span className="text-2xl font-mono font-black text-[#00704e] tracking-wider">
              {data.password}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="mt-4 flex items-center gap-2 mx-auto text-xs font-bold text-gray-400 hover:text-[#00704e]"
          >
            {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
            {copied ? "COPIED" : "CLICK TO COPY"}
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black"
        >
          DONE
        </button>
      </div>
    </div>
  );
};

const CreateUser = ({ onClose, onCreate, editData, isGuardRole }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    withBalance: false,
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.full_name || editData.name || "",
        email: editData.email || "",
        address: editData.address || "",
        contact: editData.contact || "",
        withBalance:
          editData.has_balance === 1 ||
          editData.has_balance === true ||
          editData.withBalance === true,
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    const BASE_URL =
      "https://hoa-camellabucandalav-production.up.railway.app/api";

    // 1. Determine Method and URL early
    const isEditing = !!editData;
    const method = isEditing ? "PUT" : "POST";

    let url = "";

    if (isEditing) {
      // Use resident_id specifically from your DB schema
      const id = editData.resident_id || editData.id;
      url = `${BASE_URL}/residents/edit/${id}`;
    } else {
      url = isGuardRole ? `${BASE_URL}/guards` : `${BASE_URL}/residents`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          address: formData.address,
          contact: formData.contact,
          has_balance: formData.withBalance ? 1 : 0, // Ensure numeric for SQL
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          // If the update was successful in DB, notify parent and close
          onCreate(data);
          onClose();
        } else {
          // Show the temporary password for new accounts
          setSuccessData(data);
        }
      } else {
        // This will now catch 404, 400, or 500 errors from your backend
        alert(
          `Error: ${data.error || data.message || "Failed to update database"}`,
        );
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert(
        "Connection to server failed. Check your internet or Railway status.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = () => {
    onCreate(successData);
    onClose();
  };

  return (
    <>
      {successData && (
        <SuccessModal
          data={successData}
          isGuardRole={isGuardRole}
          onClose={handleFinalize}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-xl rounded-3xl p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:rotate-90 transition-transform"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-800">
            <div
              className={`p-2 rounded-lg ${isGuardRole ? "bg-blue-100 text-blue-600" : "bg-green-100 text-[#00704e]"}`}
            >
              {isGuardRole ? <ShieldCheck /> : <User />}
            </div>
            {editData
              ? "Edit User Profile"
              : isGuardRole
                ? "Register Guard"
                : "Register Resident"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                    Email Address
                  </label>
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Physical Address
                </label>
                <textarea
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                  rows="2"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Contact Number
                </label>
                <input
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  required
                />
              </div>

              {!isGuardRole && (
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[#00704e]"
                    checked={formData.withBalance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        withBalance: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm font-bold text-gray-600 uppercase">
                    Outstanding Balance
                  </span>
                </label>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.25rem] font-black text-white shadow-lg flex justify-center items-center gap-2 ${
                isGuardRole
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-[#00704e] hover:bg-[#005a3e]"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : editData ? (
                "CONFIRM UPDATES"
              ) : (
                "CREATE ACCOUNT"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateUser;
