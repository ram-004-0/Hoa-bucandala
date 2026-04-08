import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  ArrowLeftIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckIcon, // Added for modal
} from "@heroicons/react/24/solid";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const DEFAULT_SLOTS = [
  "6:00 AM - 8:00 AM",
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
];

const SchedulePickup = ({ type }) => {
  const navigate = useNavigate(); // Hook for redirection
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // State for modal

  const label = type
    .replaceAll("-", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // ... (Keep isDayAllowed and fetchSlots exactly as they are in the previous code) ...
  const isDayAllowed = (selectedDate) => {
    if (!selectedDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = selectedDate.split("-").map(Number);
    const selectedDateObj = new Date(year, month - 1, day);
    selectedDateObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < today) {
      setError("You cannot book a pickup for a past date.");
      return false;
    }

    const dayOfWeek = selectedDateObj.getDay();
    const normalizedType = type.toLowerCase();

    // Updated Schedule Rules
    if (
      normalizedType.includes("biodegradable") &&
      ![1, 3, 5].includes(dayOfWeek)
    ) {
      setError(`${label} is only collected on Monday, Wednesday, or Friday.`);
      return false;
    }

    if (
      normalizedType.includes("non-biodegradable") &&
      ![2, 4].includes(dayOfWeek)
    ) {
      setError(`${label} is only collected on Tuesdays and Thursdays.`);
      return false;
    }

    if (
      normalizedType.includes("recyclable") &&
      ![2, 3, 4].includes(dayOfWeek)
    ) {
      setError(`${label} is only collected from Tuesday to Thursday.`);
      return false;
    }

    setError("");
    return true;
  };

  const fetchSlots = async (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    setSelected(null);
    setError("");
    if (!isDayAllowed(selectedDate)) {
      setPlans([]);
      return;
    }
    setLoadingSlots(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/waste/availability?date=${selectedDate}&type=${type}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      const now = new Date();
      const [y, m, d] = selectedDate.split("-").map(Number);
      const isToday =
        new Date(y, m - 1, d).toDateString() === now.toDateString();
      const currentHour = now.getHours();

      const processSlots = (slots) =>
        slots.map((slot) => {
          let [time, modifier] = slot.time_slot.split(" - ")[0].split(" ");
          let hour = parseInt(time.split(":")[0]);
          if (modifier === "PM" && hour !== 12) hour += 12;
          if (modifier === "AM" && hour === 12) hour = 0;
          const isExpired = isToday && currentHour >= hour;
          return { ...slot, booked: slot.booked || isExpired };
        });

      if (data.length === 0) {
        setPlans(
          processSlots(
            DEFAULT_SLOTS.map((slot) => ({
              schedule_id: null,
              time_slot: slot,
              booked: false,
            })),
          ),
        );
      } else {
        setPlans(processSlots(data));
      }
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!date || !selected) {
      alert("Please select date and time");
      return;
    }
    setBooking(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/waste/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schedule_id: selected.schedule_id,
          notes,
          date,
          type,
          time_slot: selected.time_slot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Booking failed");
        return;
      }

      // Success! Show Modal instead of Alert
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* SUCCESS MODAL OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <CheckIcon className="h-10 w-10 text-[#00704e]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Pickup Scheduled!
            </h2>
            <p className="text-gray-500 mb-8">
              Your {label} collection for {new Date(date).toLocaleDateString()}{" "}
              has been confirmed.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/wastecollection/my-history")}
                className="w-full py-4 bg-[#00704e] text-white rounded-xl font-bold hover:bg-[#005a3e] transition-colors shadow-lg"
              >
                View My History
              </button>
              <button
                onClick={() => navigate("/wastecollection")}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-800 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & MAIN CONTENT (Same as before) */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/wastecollection">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Book Waste Pickup</h1>
          <p className="opacity-80">{label} Collection</p>
        </div>
      </div>

      <div className="m-10 flex flex-col items-center">
        <div className="shadow-xl rounded-2xl p-8 flex flex-col bg-white w-full max-w-lg gap-8">
          {/* ... Date Picker, RadioGroup, and Notes Textarea go here ... */}
          {/* (Note: Ensure the Date input has min={new Date().toISOString().split("T")[0]}) */}

          <div>
            <div className="flex items-center mb-2">
              <CalendarIcon className="text-[#00704e] w-5 h-5" />
              <h1 className="text-sm font-bold ml-2">Select Date</h1>
            </div>
            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => fetchSlots(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 w-full py-3 focus:ring-2 focus:ring-[#00704e] outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center mb-3">
              <CalendarIcon className="text-[#00704e] w-5 h-5" />
              <h1 className="text-sm font-bold ml-2">Select Time Slot</h1>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-4">
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <RadioGroup
              value={selected}
              onChange={setSelected}
              className="space-y-3"
            >
              {plans.map((plan, idx) => (
                <Radio
                  key={plan.schedule_id || idx}
                  value={plan}
                  disabled={plan.booked}
                  className={`group relative flex rounded-xl px-5 py-4 shadow-sm border transition-all
                    ${
                      plan.booked
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50"
                        : "bg-white border-gray-200 cursor-pointer hover:border-[#00704e] data-checked:bg-[#00704e] data-checked:text-white data-checked:border-[#00704e]"
                    }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{plan.time_slot}</p>
                      <p className="text-xs uppercase tracking-wider opacity-70">
                        {plan.booked ? "Unavailable" : "Available"}
                      </p>
                    </div>
                    <CheckCircleIcon className="size-7 fill-white opacity-0 transition group-data-checked:opacity-100" />
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>

          <div>
            <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-tighter text-[13px]">
              Additional Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border border-gray-300 rounded-xl h-28 p-4 text-sm resize-none w-full focus:ring-2 focus:ring-[#00704e] outline-none"
              placeholder="e.g. Leave by the blue gate..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={booking || !selected || error}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95
              ${
                booking || !selected || error
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#00704e] hover:bg-[#005a3e]"
              }`}
          >
            {booking ? "Processing..." : "Confirm Pickup Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchedulePickup;
