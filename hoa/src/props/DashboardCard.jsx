import React from "react";

function DashboardCard({ image, name, description }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex gap-4 items-center hover:bg-gray-50 transition cursor-pointer h-full">
      <div className="w-12 h-12 flex items-center justify-center">
        {typeof image === "string" ? (
          <img src={image} alt={name} className="w-12 h-12 object-contain" />
        ) : (
          image
        )}
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{name}</span>
        <span className="text-sm text-gray-500">{description}</span>
      </div>
    </div>
  );
}

export default DashboardCard;
