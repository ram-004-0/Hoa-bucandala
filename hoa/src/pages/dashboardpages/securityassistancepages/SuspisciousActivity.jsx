import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Camera, Loader2, X, AlertCircle, Zap } from "lucide-react";
import axios from "axios";

const API_URL = "https://hoa-bucandala.onrender.com/api";

const SuspiciousActivity = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quickTemplates = [
    "Unfamiliar Vehicle",
    "Person Loitering",
    "Open/Broken Gate",
    "Solicitor without ID",
    "Unattended Baggage",
  ];

  const handleBoxClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else if (selectedFile) {
      alert("File is too large. Max 10MB.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) return alert("Please describe what you observed.");

    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("request_type_name", "Suspicious Activity"); // Matches seeded DB name
    formData.append("situation_details", details);
    formData.append("location", location);
    if (file) formData.append("photo", file);

    try {
      await axios.post(`${API_URL}/guard-requests`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Suspicious activity report submitted.");
      navigate("/securityassistance");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans">
      <div className="bg-[#00704e] min-h-[140px] md:h-40 gap-4 md:gap-10 grid grid-cols-[15%_85%] md:grid-cols-[10%_90%] p-6 md:p-10 text-white items-center relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <Zap size={150} />
        </div>
        <Link to="/securityassistance">
          <ArrowLeftIcon className="h-8 w-8 md:h-10 md:w-10 cursor-pointer text-white hover:scale-110 transition-transform" />
        </Link>
        <div className="z-10">
          <h1 className="font-bold text-2xl md:text-4xl uppercase tracking-tight">
            Security Assistance
          </h1>
          <p className="text-sm md:text-base opacity-80">
            Suspicious Activity Report
          </p>
        </div>
      </div>

      <div className="px-4 md:px-0 mt-6 md:mt-10 flex flex-col items-center gap-6">
        <div className="shadow-xl rounded-2xl p-6 bg-white w-full max-w-[450px] flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Quick Observation
            </h2>
            <div className="flex flex-wrap gap-2">
              {quickTemplates.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDetails(item)}
                  className="text-xs border border-gray-200 rounded-full px-3 py-1.5 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all active:scale-90"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[1px] bg-gray-100 w-full"></div>

          <div className="flex flex-col gap-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <h1 className="font-bold text-gray-700">
                  Observation Details <span className="text-red-500">*</span>
                </h1>
                <span
                  className={`text-[10px] font-bold ${details.length > 250 ? "text-red-500" : "text-gray-400"}`}
                >
                  {details.length} / 300
                </span>
              </div>
              <textarea
                value={details}
                maxLength={300}
                onChange={(e) => setDetails(e.target.value)}
                className="border-2 border-gray-100 rounded-xl w-full h-32 md:h-40 p-4 focus:outline-none focus:border-green-500 resize-none transition-all shadow-inner"
                placeholder="Describe the person, vehicle, or activity..."
              ></textarea>
            </div>

            <div>
              <h1 className="font-bold text-gray-700 mb-2">
                Observation Location
              </h1>
              <textarea
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-2 border-gray-100 rounded-xl w-full p-4 focus:outline-none focus:border-green-500 resize-none transition-all shadow-inner"
                placeholder="Where did you see this activity?"
              ></textarea>
            </div>

            <div>
              <h1 className="font-bold text-gray-700 mb-2">Photo Evidence</h1>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={handleBoxClick}
                className={`group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${preview ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-gray-50"}`}
              >
                {preview ? (
                  <div className="relative w-full flex justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-40 w-full object-cover rounded-lg shadow-md"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setFile(null);
                      }}
                      className="absolute top-2 right-2 bg-white text-red-500 rounded-full p-1.5 shadow-xl"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-100 p-4 rounded-full group-hover:bg-green-100">
                      <Camera className="text-gray-400 group-hover:text-green-600 w-8 h-8" />
                    </div>
                    <p className="text-gray-400 font-medium text-sm mt-3 text-center">
                      Capture photo from a safe distance
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-4 bg-[#00704e] text-white rounded-xl shadow-lg hover:bg-green-800 w-full font-black text-lg flex justify-center items-center gap-3 transition-all active:scale-95 disabled:bg-gray-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : "SEND REPORT"}
            </button>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 w-full max-w-[450px]">
          <div className="flex gap-3">
            <AlertCircle className="text-amber-700 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-bold block text-sm mb-1">
                Safety First:
              </span>
              Do not approach suspicious individuals yourself. Stay in a safe
              location until guards arrive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuspiciousActivity;
