import React from "react";

const AdminComponent = ({ name, image, desc }) => {
  return (
    <div className="flex gap-4 items-start cursor-pointer hover:bg-gray-50 transition p-4 rounded-lg bg-white shadow-md">
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100">
        {image}
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-gray-800">{name}</span>
        <span className="text-sm text-gray-500">{desc}</span>
      </div>
    </div>
  );
};

export default AdminComponent;
