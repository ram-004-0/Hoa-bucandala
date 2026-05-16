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
import SwimmingPoolImg from "../../../assets/swimmingpool.png";

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
  const [fullyReservedDates, setFullyReservedDates] = useState([]);
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

  // Fetch only dates where ALL 4 slots are full
  useEffect(() => {
    const fetchFullyReservedDates = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/amenities/${AMENITY_ID}/reserved-dates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        // FIXED: Ensure we always fall back safely to an empty array if data isn't an array type
        setFullyReservedDates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reserved dates");
        setFullyReservedDates([]);
      }
    };
    fetchFullyReservedDates();
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
        if (current && current.currentPax >= MAX_CAPACITY) {
          setSelectedSlot(null);
        }
      }
    } catch (err) {
      setError("Failed to load availability.");
    }
  }, [date, selectedSlot?.value]);

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

  const tileClassName = ({ date: viewDate, view }) => {
    if (view === "month") {
      const yyyy = viewDate.getFullYear();
      const mm = String(viewDate.getMonth() + 1).padStart(2, "0");
      const dd = String(viewDate.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      // FIXED: Added optional chaining validation fallback defense
      if (fullyReservedDates?.includes?.(dateStr)) {
        return "reserved-date";
      }
    }
    return null;
  };

  const handleDateChange = (val) => {
    if (!val) return;
    const yyyy = val.getFullYear();
    const mm = String(val.getMonth() + 1).padStart(2, "0");
    const dd = String(val.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <style>{`
        .react-calendar__tile {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
        }
        .react-calendar__month-view__days {
          display: grid !important;
          grid-template-columns: repeat(7, 1fr) !important;
        }
      `}</style>

      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${SwimmingPoolImg})` }}
      >
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
            <div className="space-y-4 flex-1">
              <h2 className="font-black text-xl text-gray-800 flex items-center gap-2">
                <InformationCircleIcon className="h-6 w-6 text-[#00704e]" />
                Pool Rates & Shifts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                    Day Shift (8AM - 2PM)
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-gray-600">
                      Adult (13+): <span className="text-gray-900">₱80.00</span>
                    </p>
                    <p className="text-xs font-bold text-gray-600">
                      Child (4-12):{" "}
                      <span className="text-gray-900">₱50.00</span>
                    </p>
                  </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    Night Shift (3PM - 9PM)
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-bold text-gray-600">
                      Adult (13+):{" "}
                      <span className="text-gray-900">₱100.00</span>
                    </p>
                    <p className="text-xs font-bold text-gray-600">
                      Child (4-12):{" "}
                      <span className="text-gray-900">₱80.00</span>
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase ml-1">
                Toddlers (3 yrs & below):{" "}
                <span className="text-green-600">FREE</span>
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center shrink-0">
              <p className="text-xs font-bold text-[#00704e] uppercase mb-1">
                Operating Hours
              </p>
              <p className="text-lg font-black text-[#00704e]">
                8:00 AM – 12:00 AM
              </p>
              <p className="text-[10px] font-bold text-[#00704e]/60 mt-1 uppercase">
                ₱500 Reservation Base Fee
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

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-500 ml-1">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm font-bold uppercase tracking-wider">
                Step 1: Select Date
              </span>
            </div>

            <div className="p-4 bg-gray-50 rounded-4xl border-2 border-gray-100 flex justify-center overflow-hidden">
              <Calendar
                onChange={handleDateChange}
                value={date ? new Date(date + "T00:00:00") : new Date()}
                minDate={new Date()}
                tileClassName={tileClassName}
                className="rounded-2xl border-none shadow-none font-bold text-gray-700 w-full"
              />
            </div>
            {date && (
              <p className="text-center font-black text-[#00704e]">
                Selected:{" "}
                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
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
