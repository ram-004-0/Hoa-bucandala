import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationCircleIcon,
  DocumentChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

const HOAdues = () => {
  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans antialiased">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">HOA Dues</h1>
          <p className="opacity-90">
            Review your balance and payment instructions
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10">
        {/* Verification Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
          <InformationCircleIcon className="h-10 w-10 text-blue-500 shrink-0" />
          <div>
            <h2 className="font-bold text-blue-800">
              Manual Verification Notice
            </h2>
            <p className="text-blue-700 text-sm">
              Our system tracks dues manually. Once you pay via the methods
              below, please
              <strong> keep your receipt</strong>. The admin office will update
              your status within 24-48 hours of payment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Breakdown Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#00704e] rounded-full"></div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">
                Current Outstanding Balance
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Association Dues (Dec)</span>
                <span className="font-bold text-gray-900">₱1,200.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Maintenance Fee</span>
                <span className="font-bold text-gray-900">₱300.00</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-end">
                <div>
                  <span className="font-bold text-gray-400 uppercase text-[10px] block">
                    Total to Pay
                  </span>
                  <p className="text-[10px] text-gray-400 italic font-medium">
                    Ref: BLK 2 LOT 4 - DEC
                  </p>
                </div>
                <span className="text-4xl font-black text-[#00704e] tracking-tighter">
                  ₱1,500.00
                </span>
              </div>
            </div>
          </div>

          {/* How to Pay - Instructional Card */}
          <div className="bg-[#00704e]/5 border border-[#00704e]/10 rounded-2xl p-8 flex flex-col gap-4">
            <h3 className="font-bold text-gray-900">Next Steps:</h3>
            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="bg-[#00704e] text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">
                  1
                </span>
                Choose an external payment method from the list below.
              </li>
              <li className="flex gap-3">
                <span className="bg-[#00704e] text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">
                  2
                </span>
                Input the amount and use your{" "}
                <strong>Block & Lot number</strong> as the reference note.
              </li>
              <li className="flex gap-3">
                <span className="bg-[#00704e] text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold">
                  3
                </span>
                Take a screenshot of the successful transaction.
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-2 h-8 bg-[#00704e] rounded-full"></div>
            <h2 className="font-black text-xl text-gray-800 tracking-tight uppercase">
              External Payment Channels
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <MethodCard
              icon={CreditCardIcon}
              name="Bank Transfer"
              desc="BDO Unibank: 0012-3456-7890"
              color="text-blue-600"
            />
            <MethodCard
              icon={BanknotesIcon}
              name="GCash"
              desc="Account: 0917-123-4567"
              color="text-blue-500"
            />
            <MethodCard
              icon={BuildingOfficeIcon}
              name="Office Payment"
              desc="Visit Admin Office (9AM - 5PM)"
              color="text-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MethodCard = ({ icon: Icon, name, desc, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
    <div
      className={`w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center ${color}`}
    >
      <Icon className="h-7 w-7" />
    </div>
    <div>
      <h4 className="font-bold text-gray-900">{name}</h4>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default HOAdues;
