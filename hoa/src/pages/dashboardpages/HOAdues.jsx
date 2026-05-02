import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

const HOAdues = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

  useEffect(() => {
    fetchMyBills();
  }, []);

  const fetchMyBills = async () => {
    try {
      const response = await fetch(`${API_URL}/payments/my-bills`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (err) {
      console.error("Failed to fetch bills:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate only Pending amounts
  const totalOutstanding = bills
    .filter((b) => b.status === "Pending")
    .reduce((sum, b) => sum + parseFloat(b.amount), 0);

  return (
    <div className="min-h-screen bg-[#fcfdfc] font-sans antialiased">
      {/* Header */}
      <div className="bg-[#00704e] h-40 flex items-center px-6 md:px-10 text-white">
        <Link to="/home" className="mr-6">
          <ArrowLeftIcon className="h-10 w-10 cursor-pointer hover:opacity-80" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">HOA Dues</h1>
          <p className="opacity-90">Review your balance and payment history</p>
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
              Our system tracks dues manually. Once you pay, please{" "}
              <strong>keep your receipt</strong>. The admin office will update
              your status within 24-48 hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Real-time Balance Card */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-[#00704e] rounded-full"></div>
              <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">
                Current Outstanding Balance
              </h3>
            </div>

            {loading ? (
              <p className="text-gray-400 animate-pulse">Loading balance...</p>
            ) : (
              <div className="space-y-4">
                {bills.filter((b) => b.status === "Pending").length > 0 ? (
                  bills
                    .filter((b) => b.status === "Pending")
                    .map((bill) => (
                      <div
                        key={bill.id}
                        className="flex justify-between text-gray-600"
                      >
                        <span>{bill.billingMonth} Assessment</span>
                        <span className="font-bold text-gray-900">
                          ₱{parseFloat(bill.amount).toLocaleString()}
                        </span>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5" /> No pending balances!
                  </p>
                )}

                <div className="border-t border-dashed border-gray-200 pt-4 mt-2 flex justify-between items-end">
                  <span className="font-bold text-gray-400 uppercase text-[10px] block">
                    Total to Pay
                  </span>
                  <span
                    className={`text-4xl font-black tracking-tighter ${totalOutstanding > 0 ? "text-[#00704e]" : "text-gray-300"}`}
                  >
                    ₱{totalOutstanding.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment History List (Bonus Feature) */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[300px]">
            <h3 className="font-bold text-gray-800 text-sm">
              Recent Billing History
            </h3>
            <div className="space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl text-xs"
                >
                  <div>
                    <p className="font-bold text-gray-800">
                      {bill.billingMonth}
                    </p>
                    <p className="text-gray-500">
                      ₱{parseFloat(bill.amount).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase ${
                      bill.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {bill.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Section (Static) */}
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
