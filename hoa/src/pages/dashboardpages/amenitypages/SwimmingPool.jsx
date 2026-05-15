import React, { useState, useEffect, useCallback } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarCustom.css";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";
const AMENITY_ID = 3;
const MAX_CAPACITY = 20;
const TIME_SLOTS = [
  { label: "08:00 AM - 12:00 PM", value: "08:00-12:00" },
  { label: "12:00 PM - 04:00 PM", value: "12:00-16:00" },
  { label: "04:00 PM - 08:00 PM", value: "16:00-20:00" },
  { label: "08:00 PM - 12:00 AM", value: "20:00-24:00" },
];

const SwimmingPool = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [reservedDates, setReservedDates] = useState([]); // Added for calendar highlighting
  const [pax, setPax] = useState(1);
  const [slots, setSlots] = useState(
    TIME_SLOTS.map((s) => ({ ...s, available: true, currentPax: 0 })),
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checkTokenExpiry = useCallback(() => {
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
  }, [navigate]);

  // Fetch reserved dates to highlight on the calendar
  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/amenities/${AMENITY_ID}/reserved-dates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setReservedDates(data || []);
      } catch (err) {
        console.error("Failed to fetch reserved dates");
      }
    };
    fetchReservedDates();
  }, []);

  const fetchAvailability = useCallback(async () => {
    if (!date) return;
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(
        `${API_URL}/amenities/${AMENITY_ID}/availability?date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      const updatedSlots = TIME_SLOTS.map((slot) => {
        const slotData = data.slotDetails?.find(
          (d) => d.time_slot === slot.value,
        ) || { total_guests: 0 };

        const currentTotal = parseInt(slotData.total_guests) || 0;

        return {
          ...slot,
          currentPax: currentTotal,
          available: currentTotal < MAX_CAPACITY,
        };
      });

      setSlots(updatedSlots);

      if (selectedSlot) {
        const current = updatedSlots.find(
          (s) => s.value === selectedSlot.value,
        );
        if (current && current.currentPax >= MAX_CAPACITY)
          setSelectedSlot(null);
      }
    } catch (err) {
      setError("Failed to load availability.");
    }
  }, [date, selectedSlot]);

  useEffect(() => {
    if (date && checkTokenExpiry()) {
      fetchAvailability();
    }
  }, [date, checkTokenExpiry, fetchAvailability]);

  const handleBooking = async () => {
    if (!date || !selectedSlot || !checkTokenExpiry()) return;

    const remaining = MAX_CAPACITY - selectedSlot.currentPax;
    if (pax > remaining) {
      alert(`Only ${remaining} spots left for this slot.`);
      return;
    }

    if (pax < 1 || pax > 20) {
      alert("Please enter a valid number of persons (Max 20).");
      return;
    }

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
          guest_count: pax,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reservation failed");

      navigate("/amenities/success", {
        state: {
          data: data,
          status: data.status || "Pending",
          amenityName: "Swimming Pool",
          displayDate: date,
          displaySlot: selectedSlot.label,
          pax: pax,
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calendar styling logic
  const tileClassName = ({ date: viewDate, view }) => {
    if (view === "month") {
      const dateStr = viewDate.toISOString().split("T")[0];
      if (reservedDates.includes(dateStr)) {
        return "reserved-date";
      }
    }
    return null;
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

      <div className="max-w-4xl mx-auto -mt-10 px-4 space-y-6 pt-10">
        <div className="bg-white shadow-xl rounded-4xl p-8 border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
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
                  <p className="font-bold text-gray-700">₱500 / Slot</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Max Capacity
                  </p>
                  <p className="font-bold text-gray-700">20 Persons</p>
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

          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-2xl flex gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              <span className="font-black">Policy:</span> If guest count exceeds
              the maximum capacity of 20 persons, an additional fee per person
              will be applied upon arrival. Proper swimwear is strictly
              required.
            </p>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-4xl p-8 border border-gray-100 space-y-8">
          <h2 className="font-black text-2xl text-gray-800">
            Make a Reservation
          </h2>

          {/* Step 1: Visual Calendar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 ml-1">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Step 1: Select Date
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-4xl border-2 border-gray-100 flex justify-center">
              <Calendar
                onChange={(val) => setDate(val.toISOString().split("T")[0])}
                value={date ? new Date(date) : new Date()}
                minDate={new Date()}
                tileClassName={tileClassName}
                className="rounded-2xl border-none shadow-none font-bold text-gray-700"
              />
            </div>
            {date && (
              <p className="text-center font-black text-[#00704e]">
                Selected:{" "}
                {new Date(date).toLocaleDateString("en-US", {
                  dateStyle: "full",
                })}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-500 ml-1">
              <UserGroupIcon className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Step 2: Number of Persons (Max 20)
              </span>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              value={pax}
              onChange={(e) => setPax(parseInt(e.target.value) || 1)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-[#00704e] outline-none transition-all font-bold text-gray-700"
              placeholder="How many guests?"
            />
          </div>

          {date && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-gray-500 ml-1">
                <ClockIcon className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">
                  Step 3: Choose your Slot
                </span>
              </div>
              <RadioGroup
                value={selectedSlot}
                onChange={setSelectedSlot}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {slots.map((slot) => {
                  const isFull = slot.currentPax >= MAX_CAPACITY;
                  const remaining = MAX_CAPACITY - slot.currentPax;
                  return (
                    <Radio
                      key={slot.value}
                      value={slot}
                      disabled={isFull}
                      className={({ checked }) => `
                        relative flex cursor-pointer rounded-2xl p-5 border-2 transition-all
                        ${isFull ? "bg-gray-100 opacity-40 cursor-not-allowed" : checked ? "bg-green-50 border-[#00704e] ring-2 ring-[#00704e]/20" : "bg-white border-gray-100"}
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
                            <p
                              className={`text-[10px] font-bold uppercase mt-1 ${isFull ? "text-red-500" : "text-gray-400"}`}
                            >
                              {isFull
                                ? "Slot Full"
                                : `Available (${remaining} left)`}
                            </p>
                          </div>
                          {checked && (
                            <CheckCircleIcon className="h-7 w-7 text-[#00704e]" />
                          )}
                        </div>
                      )}
                    </Radio>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-4 pt-4">
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
    </div>
  );
};

export default SwimmingPool;
