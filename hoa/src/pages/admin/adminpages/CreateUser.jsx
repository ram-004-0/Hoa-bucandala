import React, { useState, useEffect, useRef } from "react";
import {
  User,
  X,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Copy,
  Key,
} from "lucide-react";

// --- SuccessModal Component ---
const SuccessModal = ({ data, onClose, isGuardRole }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(data.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
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
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 mb-8 relative">
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
  const isMounted = useRef(true);

  const [formData, setFormData] = useState({
    name: editData?.full_name || editData?.name || "",
    email: editData?.email || "",
    address: editData?.address || "",
    contact: editData?.contact || "",
    withBalance: !!(editData?.has_balance || editData?.withBalance),
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    isMounted.current = true;
    if (editData) {
      setFormData({
        name: editData.full_name || editData.name || "",
        email: editData.email || "",
        address: editData.address || "",
        contact: editData.contact || "",
        withBalance: !!(editData.has_balance || editData.withBalance),
      });
    }
    return () => {
      isMounted.current = false;
    };
  }, [editData]);

  // Handle Input Changes with real-time numeric validation for contact
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const onlyNums = value.replace(/[^0-9]/g, "");
      if (onlyNums.length <= 11) {
        setFormData({ ...formData, [name]: onlyNums });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    // --- Email Validation ---
    const validateEmail = (email) => {
      return String(email)
        .toLowerCase()
        .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    };
    if (!validateEmail(formData.email)) {
      alert("Please enter a valid email address (e.g., name@example.com).");
      return;
    }
    // --- Philippine Contact Number Validation ---
    const phPhoneRegex = /^09\d{9}$/;
    if (!phPhoneRegex.test(formData.contact)) {
      alert("Invalid contact number. Use 09XXXXXXXXX format (11 digits).");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const BASE_URL = "https://hoa-bucandala.onrender.com/api";

    const isEditing = !!editData;
    const method = isEditing ? "PUT" : "POST";

    const targetId =
      editData?.account_id || editData?.resident_id || editData?.id;
    const typePath = isGuardRole ? "guards" : "residents";
    const url = isEditing
      ? `${BASE_URL}/${typePath}/edit/${targetId}`
      : `${BASE_URL}/${typePath}`;

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
          has_balance: formData.withBalance ? 1 : 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (isEditing) {
          onCreate({ ...editData, ...formData, ...data });
          onClose();
        } else {
          setSuccessData(data);
        }
      } else {
        alert(
          `Error: ${data.error || data.message || "Failed to process request"}`,
        );
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Connection failed. Please check your internet.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  return (
    <>
      {successData && (
        <SuccessModal
          data={successData}
          isGuardRole={isGuardRole}
          onClose={() => {
            onCreate(successData);
            onClose();
          }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                  Email Address
                </label>
                <input
                  name="email"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                Physical Address
              </label>
              <textarea
                name="address"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                rows="2"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                Contact Number
              </label>
              <input
                name="contact"
                placeholder="09XXXXXXXXX"
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#00704e]"
                value={formData.contact}
                onChange={handleInputChange}
                required
              />
              <p className="text-[9px] text-gray-400 ml-1 font-bold">
                11 DIGITS STARTING WITH 09
              </p>
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
