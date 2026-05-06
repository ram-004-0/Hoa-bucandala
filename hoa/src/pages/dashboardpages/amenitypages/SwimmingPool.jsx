import React, { useState, useEffect } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";
const AMENITY_ID = 3;
const TIME_SLOTS = [
  { label: "08:00 AM - 12:00 PM", value: "08:00-12:00" },
  { label: "12:00 PM - 04:00 PM", value: "12:00-16:00" },
  { label: "04:00 PM - 08:00 PM", value: "16:00-20:00" },
  { label: "08:00 PM - 12:00 AM", value: "20:00-24:00" },
];

const SwimmingPool = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState(
    TIME_SLOTS.map((s) => ({ ...s, available: true })),
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkTokenExpiry = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return false;
    }
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.exp < Date.now() / 1000) {
        localStorage.removeItem("token");
        navigate("/login");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!date || !checkTokenExpiry()) return;
    const token = localStorage.getItem("token");
    setSelectedSlot(null);
    setError("");

    fetch(`${API_URL}/amenities/${AMENITY_ID}/availability?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedSlots = TIME_SLOTS.map((slot) => ({
          ...slot,
          available: data.availableSlots.includes(slot.value),
        }));
        setSlots(updatedSlots);
        setSelectedSlot(updatedSlots.find((s) => s.available) || null);
      })
      .catch(() => setError("Failed to load availability."));
  }, [date, navigate]);

  const handleBooking = async () => {
    if (!date || !selectedSlot || !checkTokenExpiry()) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amenity_id: AMENITY_ID,
          reservation_date: date,
          time_slot: selectedSlot.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reservation failed");

      // FIX: Access properties from 'data' (the parsed JSON), not 'res'
      navigate("/amenities/success", {
        state: {
          data: {
            insertId: data.reservation_id || data.insertId, // Check which key your backend sends
            reservation_date: date, // You can use your local 'date' state
            time_slot: selectedSlot.label, // Using the label looks better on the success screen
          },
          amenityName: AMENITY_ID === 1 ? "Club House" : "Swimming Pool",
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-[#00704e] h-48 flex items-center px-6 md:px-12 text-white">
        <Link to="/amenities" className="hover:scale-110 transition-transform">
          <ArrowLeftIcon className="h-10 w-10 mr-6 cursor-pointer" />
        </Link>
        <div>
          <h1 className="font-black text-3xl md:text-4xl">Swimming Pool</h1>
          <p className="opacity-80 text-sm md:text-base mt-1">
            Refresh and relax at the pool
          </p>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />

      <div className="max-w-4xl mx-auto -mt-10 px-4 space-y-6">
        <div className="bg-white shadow-xl rounded-[2rem] p-8 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <h2 className="font-black text-xl text-gray-800 flex items-center gap-2">
              <InformationCircleIcon className="h-6 w-6 text-[#00704e]" />
              Pool Rules & Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Rate
                </p>
                <p className="font-bold text-gray-700">₱500 / 2 Hours</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-[10px] font-bold text-gray-400 uppercase">
                  Capacity
                </p>
                <p className="font-bold text-gray-700">50 Persons Max</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
            <p className="text-xs font-bold text-[#00704e] uppercase mb-1">
              Operating Hours
            </p>
            <p className="text-lg font-black text-[#00704e]">
              8:00 AM – 12:00 AM
            </p>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-[2rem] p-8 border border-gray-100 space-y-8">
          <h2 className="font-black text-2xl text-gray-800">
            Make a Reservation
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-500 ml-1">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Step 1: Select Date
              </span>
            </div>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#00704e] outline-none transition-all font-bold text-gray-700"
            />
          </div>

          {date && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-gray-500 ml-1">
                <ClockIcon className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Step 2: Choose your Slot
                </span>
              </div>
              <RadioGroup
                value={selectedSlot}
                onChange={setSelectedSlot}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {slots.map((slot) => (
                  <Radio
                    key={slot.value}
                    value={slot}
                    disabled={!slot.available}
                    className={({ checked }) => `
                      relative flex cursor-pointer rounded-2xl p-5 border-2 transition-all
                      ${!slot.available ? "bg-gray-100 opacity-40 cursor-not-allowed" : checked ? "bg-green-50 border-[#00704e] ring-2 ring-[#00704e]/20" : "bg-white border-gray-100"}
                    `}
                  >
                    {({ checked }) => (
                      <div className="flex w-full justify-between items-center">
                        <div className="text-sm">
                          <p
                            className={`font-black ${checked ? "text-[#00704e]" : "text-gray-700"}`}
                          >
                            {slot.label}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                            {slot.available ? "Available" : "Reserved"}
                          </p>
                        </div>
                        {checked && (
                          <CheckCircleIcon className="h-7 w-7 text-[#00704e]" />
                        )}
                      </div>
                    )}
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          )}

          <button
            onClick={handleBooking}
            disabled={loading || !selectedSlot}
            className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all flex justify-center items-center gap-3
              ${loading || !selectedSlot ? "bg-gray-300" : "bg-[#00704e] hover:bg-[#005a3e]"}
            `}
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "CONFIRM RESERVATION"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwimmingPool;
