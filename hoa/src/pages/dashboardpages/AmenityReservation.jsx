import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import AmenityCard from "../../props/AmenityCard";
import { Building, Waves, DumbbellIcon, CalendarClock } from "lucide-react";
import AmenityBg from "../../assets/amenitiesbg.png";

const AmenityReservation = () => {
  return (
    <div className="">
      <div
        className="text-white px-6 pt-12 pb-24 md:px-16 shadow-2xl relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${AmenityBg})` }}
      >
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Amenity Reservation</h1>
          <p>Book Community Amenities</p>
        </div>
      </div>

      <div className="m-10 justify-center content-center flex flex-col gap-10 flex-wrap">
        {/* NEW: Reservation History Card */}
        <AmenityCard
          image={
            <CalendarClock className="w-12 h-12 text-blue-600 bg-blue-100 rounded-lg p-2"></CalendarClock>
          }
          name="My Reservations"
          description="View and check the status of your current and past bookings."
          route="/amenities/my-history"
        />

        <hr className="border-gray-200" />

        <h2 className="text-xl font-bold text-gray-700">Available Amenities</h2>

        <AmenityCard
          image={
            <Building className="w-12 h-12 text-green-600 bg-green-100 rounded-lg p-2"></Building>
          }
          name="Club House"
          description="Perfect for gatherings, meetings, and parties."
          route="/amenities/clubhouse"
        />

        <AmenityCard
          image={
            <Waves className="w-12 h-12 text-green-600 bg-green-100 rounded-lg p-2"></Waves>
          }
          name="Swimming Pool"
          description="Enjoy a refreshing swim in our well-maintained pool."
          route="/amenities/swimmingpool"
        />

        <AmenityCard
          image={
            <DumbbellIcon className="w-12 h-12 text-green-600 bg-green-100 rounded-lg p-2"></DumbbellIcon>
          }
          name="Basketball Court"
          description="Shoot some hoops and stay active."
          route="/amenities/basketballcourt"
        />
      </div>
    </div>
  );
};

export default AmenityReservation;
