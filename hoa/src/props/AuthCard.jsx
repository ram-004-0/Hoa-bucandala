import React, { useState } from "react";
import ResidentCard from "./ResidentCard";
import GuardCard from "./GuardCard";
import AdminCard from "./AdminCard";

const AuthCard = () => {
  const [role, setRole] = useState("resident");

  const renderCard = () => {
    switch (role) {
      case "guard":
        return <GuardCard />;
      case "admin":
        return <AdminCard />;
      default:
        return <ResidentCard />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 w-105 shadow-md">
      <div className="bg-[#eaeaea] flex rounded-lg h-12 mb-6 p-1">
        {["resident", "guard", "admin"].map((item) => (
          <button
            key={item}
            onClick={() => setRole(item)}
            className={`flex-1 rounded-md transition-all duration-300 ${
              role === item
                ? "bg-[#00704e] text-white"
                : "text-[#333333] hover:bg-gray-300"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      <div className="relative">{renderCard()}</div>
    </div>
  );
};

export default AuthCard;
