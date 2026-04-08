import React from "react";
import { ArrowRight } from "lucide-react";
const GuardModal = ({ image, title, desc }) => {
  return (
    <div className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-100 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          {typeof image === "string" ? (
            <img src={image} alt={title} className="object-contain" />
          ) : (
            image
          )}
        </div>

        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-500">{desc}</div>
        </div>

        <ArrowRight className="shrink-0" />
      </div>
    </div>
  );
};

export default GuardModal;
