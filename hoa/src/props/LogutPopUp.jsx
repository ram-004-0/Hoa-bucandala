import React from "react";
import { Link } from "react-router-dom";
const LogutPopUp = ({ logout }) => {
  return (
    <div className="p-2 px-5 w-30 bg-white shadow-md rounded-lg cursor-pointer hover:bg-gray-300 text-gray-800">
      <Link to="/login" onClick={logout}>
        <button onClick={logout}>Log out</button>
      </Link>
    </div>
  );
};

export default LogutPopUp;
