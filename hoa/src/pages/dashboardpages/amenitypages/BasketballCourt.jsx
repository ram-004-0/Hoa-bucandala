import React, { useState, useEffect } from "react";
import { Radio, RadioGroup } from "@headlessui/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";
const AMENITY_ID = 2; // Swimming Pool ID in DB
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
  const [message, setMessage] = useState("");

  // Check JWT token expiry
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
        alert("Session expired. Please log in again.");
        return false;
      }
      return true;
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
      return false;
    }
  };

  // Fetch availability whenever date changes
  useEffect(() => {
    if (!date) return;
    if (!checkTokenExpiry()) return;

    const token = localStorage.getItem("token");
    setSelectedSlot(null);

    fetch(`${API_URL}/amenities/${AMENITY_ID}/availability?date=${date}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json().then((data) => ({ status: res.status, data })))
      .then(({ status, data }) => {
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          throw new Error("Unauthorized");
        }

        // Map availability
        const updatedSlots = TIME_SLOTS.map((slot) => ({
          ...slot,
          available: data.availableSlots.includes(slot.value),
        }));
        setSlots(updatedSlots);

        // Preselect first available slot
        const firstAvailable = updatedSlots.find((s) => s.available) || null;
        setSelectedSlot(firstAvailable);
      })
      .catch(() => setMessage("Failed to load availability."));
  }, [date, navigate]);

  // Handle reservation booking
  const handleBooking = async () => {
    if (!date || !selectedSlot) {
      alert("Select date & slot");
      return;
    }
    if (!checkTokenExpiry()) return;

    const token = localStorage.getItem("token");

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

    if (!res.ok) {
      alert(data.message || "Reservation failed");
      return;
    }

    setMessage("Reservation booked successfully!");
    setDate("");
    setSlots(TIME_SLOTS.map((s) => ({ ...s, available: true })));
    setSelectedSlot(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#00704e] h-40 grid grid-cols-[10%_90%] p-10 text-white items-center">
        <Link to="/amenities">
          <ArrowLeftIcon className="h-10 w-10 ml-5 cursor-pointer" />
        </Link>
        <h1 className="font-bold text-4xl">Basketball Court Reservation</h1>
      </div>

      <div className="m-10 flex flex-col gap-10">
        {/* Amenity Info */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-2">
          <h2 className="font-semibold">Amenity Information</h2>
          <p>Rate: ₱500 / 2 hours</p>
          <p>Capacity: 50 persons</p>
          <p>Operating Hours: 8:00 AM – 12:00 AM</p>
        </div>

        {/* Reservation Form */}
        <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
          <h2 className="font-semibold">Make a Reservation</h2>

          {/* Date Picker */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span>Select Date</span>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 border rounded-2xl w-full"
            />
          </div>

          {/* Time Slots */}
          {slots.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ClockIcon className="h-5 w-5 text-gray-500" />
                <span>Select Time Slot</span>
              </div>

              <RadioGroup
                value={selectedSlot}
                onChange={setSelectedSlot}
                className="space-y-3"
              >
                {slots.map((slot) => (
                  <Radio
                    key={slot.value}
                    value={slot}
                    disabled={!slot.available}
                    className={`group relative flex cursor-pointer rounded-lg px-5 py-4 shadow-md transition
                      ${
                        slot.available
                          ? "bg-gray-200 data-checked:bg-[#00704e] data-checked:text-white"
                          : "bg-gray-100 opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex w-full justify-between items-center">
                      <p className="font-semibold">{slot.label}</p>
                      {slot.available && (
                        <CheckCircleIcon className="h-6 w-6 opacity-0 group-data-checked:opacity-100" />
                      )}
                    </div>
                  </Radio>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Book Button */}
          <div className="flex justify-center">
            <button
              onClick={handleBooking}
              className="bg-[#00704e] text-white px-10 py-2 rounded-2xl hover:opacity-90"
            >
              Book Now
            </button>
          </div>

          {message && (
            <p className="text-center text-green-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasketballCourt;
