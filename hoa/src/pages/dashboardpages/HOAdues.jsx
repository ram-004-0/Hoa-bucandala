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
} from "@heroicons/react/24/solid";

const HOAdues = () => {
  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans antialiased">
      {/* YOUR ORIGINAL HEADER - UNCHANGED */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">HOA dues</h1>
          <p>Manage your payment</p>
        </div>
      </div>

      {/* REST UPDATED TO MATCH ADMIN THEME */}
      <div className="max-w-6xl mx-auto p-6 md:p-10 flex flex-col gap-10">
        {/* Important Status Alert */}
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 shadow-sm animate-in fade-in duration-500">
          <ExclamationCircleIcon className="h-10 w-10 text-red-500 shrink-0" />
          <div>
            <h2 className="font-bold text-red-800">Payment Due Soon</h2>
            <p className="text-red-700 text-sm">
              Your December dues are due in <strong>6 days</strong>. Please
              settle your payment to avoid late fees and maintain your good
              standing.
            </p>
          </div>
        </div>

        {/* Stats Grid - Matching Admin Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monthly Breakdown Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 flex flex-col gap-6 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#00704e] rounded-full"></div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">
                Monthly Breakdown
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Association Dues</span>
                <span className="font-bold text-gray-900">₱1,200.00</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Maintenance Fee</span>
                <span className="font-bold text-gray-900">₱300.00</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-end">
                <span className="font-bold text-gray-400 uppercase text-[10px]">
                  Total Amount
                </span>
                <span className="text-4xl font-black text-[#00704e] tracking-tighter">
                  ₱1,500.00
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Action Card */}
          <Link to="/payment-history" className="group h-full">
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 h-full flex items-center justify-between group-hover:border-green-200 group-hover:shadow-md transition-all">
              <div className="flex items-center gap-6">
                <div className="bg-green-50 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                  <DocumentChartBarIcon className="h-10 w-10 text-[#00704e]" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">
                    Payment History
                  </h3>
                  <p className="text-sm text-gray-500">
                    View and download your past receipts
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-6 w-6 text-gray-300 group-hover:text-[#00704e] group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        {/* Payment Methods Section - Matching Management Portal Grid */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="w-2 h-8 bg-[#00704e] rounded-full"></div>
            <h2 className="font-black text-xl text-gray-800 tracking-tight uppercase">
              Accepted Payment Methods
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

// Helper component for the payment method grid
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
