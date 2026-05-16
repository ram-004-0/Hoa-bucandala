import React, { useState, useEffect, useCallback } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarCustom.css";
import welcomeImg from "../../../assets/basketball.png";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";
const AMENITY_ID = 2;
const TIME_SLOTS = [
  { label: "08:00 AM - 12:00 PM", value: "08:00-12:00" },
  { label: "12:00 PM - 04:00 PM", value: "12:00-16:00" },
  { label: "04:00 PM - 08:00 PM", value: "16:00-20:00" },
  { label: "08:00 PM - 12:00 AM", value: "20:00-24:00" },
];

const BasketballCourt = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [reservedDates, setReservedDates] = useState([]); // Expecting array of fully booked YYYY-MM-DD strings
  const [slots, setSlots] = useState(
    TIME_SLOTS.map((s) => ({ ...s, available: true })),
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
        setReservedDates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reserved dates");
        setReservedDates([]);
      }
    };
    fetchReservedDates();
  }, []);

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
        const updatedSlots = TIME_SLOTS.map((slot) => {
          const slotData = data.slotDetails?.find(
            (d) => d.time_slot === slot.value,
          );
          let isOccupied = false;
          if (slotData) {
            if (
              slotData.status === undefined ||
              slotData.status === "Approved"
            ) {
              isOccupied = true;
            }
          }

          return {
            ...slot,
            available:
              !isOccupied &&
              (data.availableSlots?.includes(slot.value) || false),
          };
        });

        setSlots(updatedSlots);
        setSelectedSlot(updatedSlots.find((s) => s.available) || null);
      })
      .catch(() => setError("Failed to load availability."));
  }, [date, checkTokenExpiry]);

  const handleBooking = async () => {
    if (!date || !selectedSlot || !checkTokenExpiry()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amenity_id: AMENITY_ID,
          reservation_date: date,
          time_slot: selectedSlot.value,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request");

      navigate("/amenities/success", {
        state: {
          data: data,
          status: data.status || "Pending",
          amenityName: "Basketball Court",
          displayDate: date,
          displaySlot: selectedSlot.label,
        },
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper utility to reliably parse local date objects to 'YYYY-MM-DD' without timezone offsets
  const getLocalDateString = (viewDate) => {
    const yyyy = viewDate.getFullYear();
    const mm = String(viewDate.getMonth() + 1).padStart(2, "0");
    const dd = String(viewDate.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Style fully booked calendar dates
  const tileClassName = ({ date: viewDate, view }) => {
    if (view === "month") {
      const dateStr = getLocalDateString(viewDate);
      if (reservedDates?.includes?.(dateStr)) {
        return "fully-booked-date";
      }
    }
    return null;
  };

  // Disables clicking interaction completely for fully booked dates
  const tileDisabled = ({ date: viewDate, view }) => {
    if (view === "month") {
      const dateStr = getLocalDateString(viewDate);
      return reservedDates?.includes?.(dateStr);
    }
    return false;
  };

  const handleDateChange = (val) => {
    if (!val) return;
    setDate(getLocalDateString(val));
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
        /* Style rule override to block actions visually on disabled elements */
        .react-calendar__tile:disabled {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }
      `}</style>

      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${welcomeImg})` }}
      >
        <Link to="/amenities" className="hover:scale-110 transition-transform">
          <ArrowLeftIcon className="h-10 w-10 mr-6" />
        </Link>
        <div>
          <h1 className="font-black text-3xl md:text-4xl">Basketball Court</h1>
          <p className="opacity-80 mt-1">Schedule your practice or game</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-4 space-y-6 pt-10">
        {/* Regulation Card */}
        <div className="bg-white shadow-xl rounded-4xl p-8 border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <h2 className="font-black text-xl text-gray-800 flex items-center gap-2">
                <InformationCircleIcon className="h-6 w-6 text-[#00704e]" />
                Court Regulations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Fee
                  </p>
                  <p className="font-bold text-gray-700 text-sm">
                    FREE (Residents Only)
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Attire
                  </p>
                  <p className="font-bold text-gray-700 text-sm">
                    Rubber Shoes Required
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-3xl border border-green-100 text-center">
              <p className="text-xs font-bold text-[#00704e] uppercase mb-1">
                Status
              </p>
              <p className="text-lg font-black text-[#00704e]">By Approval</p>
            </div>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-2xl flex gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              <span className="font-black">Policy:</span> Reservations are
              subject to admin review. Please ensure your account is verified.
            </p>
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-white shadow-xl rounded-4xl p-8 border border-gray-100 space-y-8">
          <h2 className="font-black text-2xl text-gray-800">
            Request a Schedule
          </h2>

          {/* Step 1: Visual Calendar */}
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
                tileDisabled={tileDisabled}
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

          {/* Step 2: Slots */}
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
                "SUBMIT REQUEST"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 font-medium italic">
              *Admin approval required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketballCourt;
