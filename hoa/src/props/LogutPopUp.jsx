import React from "react";
import { Link } from "react-router-dom";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

const UserMenuPopUp = ({ logout }) => {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-2xl border border-gray-100 py-2 z-999 animate-in fade-in zoom-in duration-150">
      <Link
        to="/profile"
        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
      >
        <UserCircleIcon className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-bold">My Profile</span>
      </Link>

      <div className="border-t border-gray-50 my-1"></div>

      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 text-red-600 transition-colors text-left"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5 text-red-400" />
        <span className="text-sm font-bold">Log out</span>
      </button>
    </div>
  );
};

export default UserMenuPopUp;
