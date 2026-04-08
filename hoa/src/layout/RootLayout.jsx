import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#fbfbfb]  bg-cover bg-fit bg-repeat pb-10">
      <ScrollRestoration />
      <Outlet />
    </div>
  );
};

export default RootLayout;
