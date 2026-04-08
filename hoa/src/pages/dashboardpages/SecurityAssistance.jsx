import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import {
  ShieldAlert,
  Volume2Icon,
  UserCheck,
  TriangleAlert,
} from "lucide-react";
const SecurityAssistance = () => {
  return (
    <div className="">
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Security Assistance</h1>
          <p>We're here to help</p>
        </div>
      </div>
      <div className="m-10 flex flex-col gap-6 max-w-3xl mx-auto">
        <div className="bg-red-600 rounded-lg p-4 mb-6 text-white shadow-md pl-10">
          <div className="flex flex-row">
            <ShieldAlert className="text-white pr-3 w-11 h-11"></ShieldAlert>
            <h1 className="text-2xl font-semibold">Emergency Assistance</h1>
          </div>
          <p>Tap for immediate security response</p>
        </div>
        <Link
          to="/securityassistance/noisecomplaint"
          className="cursor-pointer "
        >
          <div className="pl-10 shadow-md rounded-lg border border-orange-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <Volume2Icon
              color="orange"
              className="bg-orange-100 rounded p-1 w-11 h-11"
            ></Volume2Icon>
            <div>
              <h1 className="font-semibold">Noise Complaint </h1>
              <p>Report excessive noise disturbance</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer"></ArrowRightIcon>
          </div>
        </Link>
        <Link
          to="/securityassistance/suspisciousactivity"
          className="cursor-pointer "
        >
          <div className="pl-10 shadow-md rounded-lg border border-red-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <TriangleAlert
              color="red"
              className="bg-red-100 rounded p-1 w-11 h-11"
            ></TriangleAlert>
            <div>
              <h1 className="font-semibold">Suspicious Activity </h1>
              <p>Report unusual or suspicious behaviour</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer"></ArrowRightIcon>
          </div>
        </Link>
        <Link to="/securityassistance/guardrequest" className="cursor-pointer ">
          <div className="pl-10 shadow-md rounded-lg border border-blue-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <UserCheck
              color="blue"
              className="bg-blue-100 rounded p-1 w-11 h-11"
            ></UserCheck>
            <div>
              <h1 className="font-semibold">Guard Request </h1>
              <p>Request security guard assistance </p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer"></ArrowRightIcon>
          </div>
        </Link>
        <div className="p-6 shadow-md rounded-lg bg-white flex flex-col">
          <h1>Emergency contact</h1>
          <div className="grid grid-cols-2">
            <h1>Security hotline:</h1>
            <p className="font-semibold text-end">+1 234 567 890</p>
            <h1>Local Authorities:</h1>
            <p className="font-semibold text-end">911</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAssistance;
