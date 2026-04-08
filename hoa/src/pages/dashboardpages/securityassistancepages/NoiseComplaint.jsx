import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Camera } from "lucide-react";
const NoiseComplaint = () => {
  return (
    <div className="">
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/securityassistance">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-4xl">Security Assistance</h1>
          <p>Noise complaint</p>
        </div>
      </div>
      <div className="m-10 justify-center content-center flex flex-col gap-10 flex-wrap">
        <div className=" shadow-md rounded-lg p-6 h-auto content-center  flex flex-col bg-white gap-2 w-110">
          <h1>Request type</h1>
          <p className="bg-green-100 text-green-600 text-[14px] rounded-xl p-4  text-center w-40">
            Noise complaint
          </p>
        </div>
        <div className=" shadow-md rounded-lg p-6 h-auto content-center  flex flex-col bg-white w-110 gap-10">
          <h1>Request details</h1>
          <div>
            <div className="flex flex-row">
              <h1>describe the situation</h1>{" "}
              <span className="text-red-500">*</span>
            </div>
            <textarea
              name="details"
              id="detailsId"
              className="border rounded-lg hover:border-green-400 w-full h-40 p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Provide as much detail as possible about the noise complaint, including the type of noise, time of occurrence, frequency, and any other relevant information."
            ></textarea>
            <h1>Location</h1>
            <textarea
              name="location"
              id="locationId"
              className="border rounded-lg hover:border-green-400 w-full  p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            ></textarea>
            <h1>Attach Photo (Optional)</h1>
            <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg border-[#bfbdbd] cursor-pointer mt-2">
              <Camera className="text-[#bfbdbd] w-12 h-12" />
              <p className="text-[#bfbdbd]">
                Click to upload photo PNG, JPG up to 10MB
              </p>
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-[#00704e] text-white rounded-lg mt-6 hover:bg-green-800 w-full"
            >
              Submit
            </button>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-amber-100 border  border-amber-200  w-110  gap-2">
          <span className="font-semibold">Response time:</span>
          <span className="flex-wrap flex">
            {" "}
            Security personnel will be notified immidiately. Expected response
            time is 5-10 minutes for emergencies.
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoiseComplaint;
