import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";
import {
  ShieldAlert,
  Volume2Icon,
  UserCheck,
  TriangleAlert,
  Phone,
  Building2,
} from "lucide-react";

const SecurityAssistance = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
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
        {/* Emergency Assistance Button */}
        <div className="bg-red-600 rounded-lg p-4 mb-6 text-white shadow-md pl-10 cursor-pointer hover:bg-red-700 transition-colors">
          <div className="flex flex-row">
            <ShieldAlert className="text-white pr-3 w-11 h-11" />
            <h1 className="text-2xl font-semibold">Emergency Assistance</h1>
          </div>
          <p>Tap for immediate security response</p>
        </div>

        {/* Action Links */}
        <Link
          to="/securityassistance/noisecomplaint"
          className="cursor-pointer"
        >
          <div className="pl-10 shadow-md rounded-lg border border-orange-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <Volume2Icon
              color="orange"
              className="bg-orange-100 rounded p-1 w-11 h-11"
            />
            <div>
              <h1 className="font-semibold">Noise Complaint</h1>
              <p>Report excessive noise disturbance</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer" />
          </div>
        </Link>

        <Link
          to="/securityassistance/suspisciousactivity"
          className="cursor-pointer"
        >
          <div className="pl-10 shadow-md rounded-lg border border-red-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <TriangleAlert
              color="red"
              className="bg-red-100 rounded p-1 w-11 h-11"
            />
            <div>
              <h1 className="font-semibold">Suspicious Activity</h1>
              <p>Report unusual or suspicious behaviour</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer" />
          </div>
        </Link>

        <Link to="/securityassistance/guardrequest" className="cursor-pointer">
          <div className="pl-10 shadow-md rounded-lg border border-blue-200 p-6 h-auto content-center w-auto grid grid-cols-[15%_70%_15%] bg-white hover:bg-[#f3f3f3]">
            <UserCheck
              color="blue"
              className="bg-blue-100 rounded p-1 w-11 h-11"
            />
            <div>
              <h1 className="font-semibold">Guard Request</h1>
              <p>Request security guard assistance</p>
            </div>
            <ArrowRightIcon className="h-6 w-6 ml-auto text-gray-400 cursor-pointer" />
          </div>
        </Link>

        {/* IMUS CITY EMERGENCY SERVICES SECTION */}
        <div className="p-6 shadow-md rounded-lg bg-white border-t-4 border-blue-600">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="font-bold text-xl uppercase tracking-tight">
              Imus City Emergency Services
            </h1>
          </div>
          <p className="text-sm text-gray-500 mb-6 italic">
            If the emergency requires outside intervention:
          </p>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-blue-800">
                    Agency
                  </th>
                  <th className="px-4 py-3 text-xs font-black uppercase tracking-wider text-blue-800 text-right">
                    Contact Number
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    Imus City Police Station
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-gray-900 text-right">
                    (046) 471-3993
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    Imus Bureau of Fire Protection
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-gray-900 text-right">
                    (046) 970-5161
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    Imus CDRRMO (Disaster/Ambulance)
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-gray-900 text-right">
                    (046) 472-2618
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                    City Information Office
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-gray-900 text-right">
                    (046) 471-2491
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityAssistance;
