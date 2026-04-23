import React, { useState, useEffect } from "react";
import { Save, User, X } from "lucide-react";

const CreateUser = ({ onClose, onCreate, editData }) => {
  const [formData, setFormData] = useState({
    name: "", // Map to full_name for backend
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
    const method = editData ? "PUT" : "POST";
    const url = editData
      ? `https://hoa-camellabucandalav-production.up.railway.app/api/residents/${editData.id}`
      : `https://hoa-camellabucandalav-production.up.railway.app/api/residents`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: formData.name, // Important: backend uses full_name
          email: formData.email,
          address: formData.address,
          contact: formData.contact,
          has_balance: formData.withBalance,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(editData ? "Updated!" : `Created! Password: ${data.password}`);
        onCreate(data); // Pass the updated/new record back to parent
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <User className="text-[#00704e]" />{" "}
          {editData ? "Edit Resident" : "Add Resident"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          <textarea
            className="w-full p-3 border rounded-xl"
            placeholder="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            required
          />
          <input
            className="w-full p-3 border rounded-xl"
            placeholder="Contact"
            value={formData.contact}
            onChange={(e) =>
              setFormData({ ...formData, contact: e.target.value })
            }
            required
          />
          <label className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={formData.withBalance}
              onChange={(e) =>
                setFormData({ ...formData, withBalance: e.target.checked })
              }
            />
            Has outstanding balance
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00704e] text-white py-4 rounded-xl font-bold hover:bg-[#005a3e]"
          >
            {loading
              ? "Processing..."
              : editData
                ? "Save Changes"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
