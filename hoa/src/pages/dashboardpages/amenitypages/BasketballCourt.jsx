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
const AMENITY_ID = 2; // CHANGE THIS: 1 for Club House, 3 for Swimming Pool
const TIME_SLOTS = [
  { label: "08:00 AM - 12:00 PM", value: "08:00-12:00" },
  { label: "12:00 PM - 04:00 PM", value: "12:00-16:00" },
  { label: "04:00 PM - 08:00 PM", value: "16:00-20:00" },
  { label: "08:00 PM - 12:00 AM", value: "20:00-24:00" },
];

const BasketballCourt = () => {
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
    if (!date) return;
    if (!checkTokenExpiry()) return;

    const token = localStorage.getItem("token");
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
  }, [date]);

  const handleBooking = async () => {
    if (!date || !selectedSlot) return;
    if (!checkTokenExpiry()) return;

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

      if (!res.ok) throw new Error(data.message || "Failed");

      // SUCCESS: Pass the 'data' from backend which now contains ID and Status
      navigate("/amenities/success", {
        state: {
          data: data,
          amenityName: "Basketball Court", // CHANGE THIS for other components
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
        <Link to="/amenities">
          <ArrowLeftIcon className="h-10 w-10 mr-6" />
        </Link>
        <div>
          <h1 className="font-black text-3xl md:text-4xl">Basketball Court</h1>
          <p className="opacity-80">Book your slot below</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-4 space-y-6">
        <div className="bg-white shadow-xl rounded-[2rem] p-8 border border-gray-100">
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-2 text-gray-500">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-sm font-bold uppercase">
                Step 1: Select Date
              </span>
            </div>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none font-bold"
            />
          </div>

          {date && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-500">
                <ClockIcon className="h-5 w-5" />
                <span className="text-sm font-bold uppercase">
                  Step 2: Choose Slot
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
                      ${!slot.available ? "bg-gray-100 opacity-40 cursor-not-allowed" : checked ? "bg-green-50 border-[#00704e]" : "bg-white border-gray-100"}
                    `}
                  >
                    {({ checked }) => (
                      <div className="flex w-full justify-between items-center">
                        <div>
                          <p
                            className={`font-black ${checked ? "text-[#00704e]" : "text-gray-700"}`}
                          >
                            {slot.label}
                          </p>
                          <p className="text-[10px] uppercase font-bold">
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
            className="w-full mt-8 py-5 rounded-2xl font-black text-white bg-[#00704e] disabled:bg-gray-300 transition-all shadow-lg"
          >
            {loading ? "PROCESSING..." : "CONFIRM RESERVATION"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasketballCourt;
