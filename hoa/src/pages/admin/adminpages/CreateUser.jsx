import React, { useState, useEffect } from "react";
import { User, X, ShieldCheck, Loader2 } from "lucide-react";

const CreateUser = ({ onClose, onCreate, editData, isGuardRole }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    contact: "",
    withBalance: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        email: editData.email,
        address: editData.address,
        contact: editData.contact,
        withBalance: editData.withBalance,
      });
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    // Choose URL based on role and edit status
    let url = `https://hoa-camellabucandalav-production.up.railway.app/api/residents`;
    if (editData) {
      url = `https://hoa-camellabucandalav-production.up.railway.app/api/residents/${editData.id}`;
    } else if (isGuardRole) {
      url = `https://hoa-camellabucandalav-production.up.railway.app/api/guards`;
    }

    const method = editData ? "PUT" : "POST";

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
          has_balance: formData.withBalance,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Show generated password for new accounts (Residents or Guards)
        const msg = editData
          ? "Updated!"
          : `Success!\nGenerated Password: ${data.password}`;
        alert(msg);
        onCreate(data);
        onClose();
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
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
            ? "Edit User"
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
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
                  placeholder="John Doe"
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
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
                  placeholder="john@example.com"
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
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
                placeholder="Block & Lot Number"
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
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
                placeholder="0912 345 6789"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />
            </div>

            {!isGuardRole && (
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-[#00704e]"
                  checked={formData.withBalance}
                  onChange={(e) =>
                    setFormData({ ...formData, withBalance: e.target.checked })
                  }
                />
                <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">
                  Mark as having outstanding balance
                </span>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-[1.25rem] font-black text-white shadow-lg transition-all flex justify-center items-center gap-2 ${
              isGuardRole
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-[#00704e] hover:bg-[#005a3e] shadow-green-200"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : editData ? (
              "SAVE UPDATES"
            ) : (
              "CREATE ACCOUNT"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
