import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon, Trash2, Megaphone, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const API_URL = "https://hoa-bucandala.onrender.com/api";

const CATEGORY_STYLES = {
  Policy: "bg-blue-100 text-blue-700",
  Maintenance: "bg-orange-100 text-orange-700",
  Events: "bg-green-100 text-green-700",
};
const CATEGORY_ICON = {
  Policy: "text-blue-600 bg-blue-100",
  Maintenance: "text-orange-600 bg-orange-100",
  Events: "text-green-600 bg-green-100",
};

const AnnouncementCard = ({ announcement, isNew }) => {
  const { title, content, category, created_at } = announcement;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="flex flex-col bg-white rounded-lg p-4 shadow-md 
             w-full max-w-4xl mx-auto gap-3
             transition-transform duration-200 relative
             md:hover:scale-[1.02]"
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Icon */}
        <Megaphone
          className={`w-12 h-12 p-2 rounded-lg shrink-0 ${
            CATEGORY_ICON[category] || "text-gray-600 bg-gray-100"
          }`}
        />

        {/* Content */}
        <div className="flex-1">
          <h1 className="font-semibold text-base sm:text-lg">{title}</h1>
          <p className="text-gray-700 text-sm wrap-break-word">{content}</p>
        </div>

        {/* Category */}
        <div className="flex sm:flex-col flex-row gap-2 sm:items-end">
          {isNew && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [1, 1.15, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="px-2 py-2 text-xs font-bold rounded-full bg-red-600 text-white absolute -top-3 -right-2 "
            ></motion.span>
          )}

          <span
            className={`px-2 py-1 text-xs rounded font-medium whitespace-nowrap ${
              CATEGORY_STYLES[category] || "bg-gray-100 text-gray-600"
            }`}
          >
            {category}
          </span>
        </div>
      </div>

      {/* Date */}
      <div className="flex gap-2 text-gray-400 text-xs sm:text-sm items-center">
        <Calendar className="w-4 h-4" />
        <span>{new Date(created_at).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
};
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.25,
    },
  },
};

const Announcement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState(new Set());

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_URL}/announcements`);
      if (!res.ok) throw new Error("Failed to fetch announcements");

      const data = await res.json();

      setAnnouncements((prev) => {
        const prevIds = new Set(prev.map((a) => a.id));
        const freshIds = data
          .filter((a) => !prevIds.has(a.id))
          .map((a) => a.id);

        if (freshIds.length) {
          setNewIds((prevSet) => new Set([...prevSet, ...freshIds]));

          // auto-remove NEW badge after 10s
          setTimeout(() => {
            setNewIds((prevSet) => {
              const next = new Set(prevSet);
              freshIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 10000);
        }

        return data;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div className="">
      {/* Header */}
      <div className="bg-[#00704e] h-40 gap-10 grid grid-cols-[10%_90%] p-10 text-white justify-center items-center">
        <Link to="/home">
          <ArrowLeftIcon className="h-10 w-10 ml-5 md:ml-10 cursor-pointer text-white" />
        </Link>
        <div>
          <h1 className="font-bold text-3xl sm:text-4xl">Announcements</h1>
          <p className="text-sm sm:text-base">HOA news & updates</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 md:px-10 py-6 flex flex-col gap-6">
        {" "}
        {loading && <p>Loading announcements...</p>}
        {!loading && announcements.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-8 text-center mt-8">
            <h3 className="text-lg font-medium">No announcements found</h3>
            <p className="text-gray-500">Check back later for updates</p>
          </div>
        )}
        {!loading && (
          <AnimatePresence>
            {announcements.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                isNew={newIds.has(a.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Announcement;
