import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  Camera,
  Loader2,
  X,
  AlertCircle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const API_URL = "https://hoa-bucandala.onrender.com/api";

const NoiseComplaint = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickTemplates = [
    "Loud Party/Music",
    "Construction Noise",
    "Barking Dog",
    "Shouting/Argument",
    "Vehicle Revving",
  ];

  const handleBoxClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    // Max 10MB limit check
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile) {
      alert("File is too large. Max 10MB.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) return alert("Please describe the noise issue.");

    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    // These keys match your backend: createGuardRequest
    formData.append("request_type_name", "Noise Complaint");
    formData.append("situation_details", details);
    formData.append("location", location || "Not provided");

    // Key must be "photo" to match your backend upload.single("photo")
    if (file) formData.append("photo", file);

    try {
      await axios.post(`${API_URL}/guard-requests/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitted(true);
      // Wait 2 seconds so they see the success state before navigating
      setTimeout(() => {
        navigate("/securityassistance");
      }, 2000);
    } catch (err) {
      console.error("Submission error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to submit complaint. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-green-100 p-6 rounded-full mb-6 animate-bounce">
          <CheckCircle2 className="w-16 h-16 text-[#00704e]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">REPORT FILED</h1>
        <p className="text-gray-500 max-w-xs">
          Security has been notified and a guard is being dispatched to verify
          the noise level.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans antialiased">
      {/* Header Section */}
      <div className="bg-[#00704e] min-h-35 md:h-40 gap-4 md:gap-10 grid grid-cols-[15%_85%] md:grid-cols-[10%_90%] p-6 md:p-10 text-white items-center relative overflow-hidden shadow-lg">
        <div className="absolute -right-5 -top-5 opacity-10">
          <Zap size={150} />
        </div>
        <Link to="/securityassistance">
          <ArrowLeftIcon className="h-8 w-8 md:h-10 md:w-10 cursor-pointer text-white hover:scale-110 transition-transform" />
        </Link>
        <div className="z-10">
          <h1 className="font-bold text-2xl md:text-4xl uppercase tracking-tight">
            Security Assistance
          </h1>
          <p className="text-sm md:text-base opacity-80 font-medium">
            Noise Complaint Report
          </p>
        </div>
      </div>

      <div className="px-4 md:px-0 mt-6 md:mt-10 flex flex-col items-center gap-6">
        <div className="shadow-2xl rounded-3xl p-6 bg-white w-full max-w-112.5 flex flex-col gap-6 border border-gray-100">
          {/* Quick Select Buttons */}
          <div>
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Quick Templates
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDetails(item)}
                  className={`text-xs font-bold border rounded-full px-4 py-2 transition-all active:scale-90 ${
                    details === item
                      ? "bg-[#00704e] border-[#00704e] text-white shadow-md"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          <div className="flex flex-col gap-6">
            {/* Complaint Details */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <h1 className="font-black text-gray-800 text-sm uppercase tracking-wide">
                  What is happening? <span className="text-red-500">*</span>
                </h1>
                <span
                  className={`text-[10px] font-black ${details.length > 280 ? "text-red-500" : "text-gray-400"}`}
                >
                  {details.length} / 300
                </span>
              </div>
              <textarea
                value={details}
                maxLength={300}
                onChange={(e) => setDetails(e.target.value)}
                className="border-2 border-gray-100 rounded-2xl w-full h-32 md:h-40 p-4 focus:outline-none focus:border-[#00704e] focus:ring-4 focus:ring-green-50 resize-none transition-all text-gray-700 font-medium"
                placeholder="Ex: Loud music coming from the neighbor's backyard for the last 2 hours..."
              ></textarea>
            </div>

            {/* Location Input */}
            <div>
              <h1 className="font-black text-gray-800 text-sm uppercase tracking-wide mb-2">
                Where is the noise?
              </h1>
              <textarea
                value={location}
                rows={2}
                onChange={(e) => setLocation(e.target.value)}
                className="border-2 border-gray-100 rounded-2xl w-full p-4 focus:outline-none focus:border-[#00704e] focus:ring-4 focus:ring-green-50 resize-none transition-all text-gray-700 font-medium"
                placeholder="House Number, Street Name, or Block/Lot"
              ></textarea>
            </div>

            {/* File Upload Section */}
            <div>
              <h1 className="font-black text-gray-800 text-sm uppercase tracking-wide mb-2">
                Evidence (Optional)
              </h1>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={handleBoxClick}
                className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                  preview
                    ? "border-[#00704e] bg-green-50/30"
                    : "border-gray-200 hover:border-[#00704e] hover:bg-gray-50"
                }`}
              >
                {preview ? (
                  <div className="relative w-full flex justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-2xl shadow-lg border-2 border-white"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-xl hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-100 p-5 rounded-2xl group-hover:bg-green-100 transition-colors">
                      <Camera className="text-gray-400 group-hover:text-[#00704e] w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-bold text-xs mt-4 text-center uppercase tracking-widest">
                      Upload Incident Photo
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !details.trim()}
              className="px-6 py-5 bg-[#00704e] text-white rounded-2xl shadow-xl hover:bg-green-800 w-full font-black text-lg flex justify-center items-center gap-3 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                "REPORT NOISE"
              )}
            </button>
          </div>
        </div>

        {/* Warning/Notice Box */}
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-100 w-full max-w-112.5 shadow-sm">
          <div className="flex gap-4">
            <div className="bg-amber-100 p-2 rounded-xl h-fit">
              <AlertCircle className="text-amber-700 shrink-0" size={20} />
            </div>
            <div>
              <p className="font-black text-amber-900 text-sm uppercase tracking-tight mb-1">
                HOA Enforcement Notice
              </p>
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                Our guards will conduct a noise decibel check upon arrival.
                First-time offenders receive a verbal warning; repeat violations
                may result in penalties according to Camella Bucandala V bylaws.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoiseComplaint;
