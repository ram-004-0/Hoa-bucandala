import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import {
  BanknotesIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  Inbox,
} from "@heroicons/react/24/outline";

const API_URL = "https://hoa-camellabucandalav-production.up.railway.app/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_URL}/notifications/my-alerts`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    const style = "h-6 w-6";
    switch (type) {
      case "Bill":
        return <BanknotesIcon className={`${style} text-red-500`} />;
      case "Waste":
        return <TruckIcon className={`${style} text-green-500`} />;
      case "Visitor":
        return <UserGroupIcon className={`${style} text-blue-500`} />;
      case "Amenity":
        return <CalendarDaysIcon className={`${style} text-purple-500`} />;
      case "Report":
        return <ExclamationCircleIcon className={`${style} text-orange-500`} />;
      default:
        return <Inbox className={`${style} text-gray-500`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      <div className="bg-[#00704e] h-40 flex items-center px-6 md:px-16 text-white shadow-lg">
        <Link to="/home">
          <ArrowLeftIcon className="h-8 w-8 mr-6 hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Community Inbox
          </h1>
          <p className="text-xs font-bold opacity-70 tracking-[0.2em]">
            All System Notifications
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-4">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
              Syncing Alerts...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  className={`p-8 flex items-start gap-6 hover:bg-gray-50 transition-colors ${notif.status === "Unread" ? "bg-green-50/20" : ""}`}
                >
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-tight">
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-black text-gray-300 uppercase bg-gray-50 px-2 py-1 rounded">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-gray-100 text-gray-500 uppercase tracking-widest">
                        Category: {notif.type}
                      </span>
                      {notif.status === "Unread" && (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                            New Alert
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-24 text-center">
              <Inbox className="h-16 w-16 mx-auto mb-4 text-gray-200" />
              <p className="font-black text-gray-400 uppercase tracking-widest text-sm">
                Inbox is empty
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
