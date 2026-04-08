import React from "react";
import { Megaphone, Calendar } from "lucide-react";
const AnnouncementCard = () => {
  return (
    <div className="flex flex-col bg-white rounded-lg p-4 shadow-md md:w-160 gap-2">
      <div className="grid grid-cols-[10%_70%_10%] gap-3 justify-around items-center w-full">
        <Megaphone className="text-green-600 bg-green-100 w-12 h-12 px-3 py-1 rounded-lg "></Megaphone>
        <div>
          <h1 className="font-semibold">Announcement Title</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque
            beatae incidunt perferendis commodi, culpa, reprehenderit,
            recusandae modi pariatur temporibus enim voluptatem hic iste. Harum
            eos aperiam pariatur ullam nostrum optio!
          </p>
        </div>
        <span className="p-1">type</span>
      </div>
      <div className="ml-3 flex flex-row gap-3 text-[#9b9b9b]">
        <Calendar></Calendar>
        <span> date</span>
      </div>
    </div>
  );
};

export default AnnouncementCard;
