import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftIcon,
  BanknotesIcon,
  TruckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "https://hoa-camellabucandalav-production.up.railway.app/api/notifications/my-alerts",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
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
    switch (type) {
      case "Bill":
        return <BanknotesIcon className="h-6 w-6 text-red-500" />;
      case "Waste":
        return <TruckIcon className="h-6 w-6 text-green-500" />;
      case "Visitor":
        return <UserGroupIcon className="h-6 w-6 text-blue-500" />;
      case "Amenity":
        return <CalendarDaysIcon className="h-6 w-6 text-purple-500" />;
      case "Report":
        return <ExclamationCircleIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <CheckCircleIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-10">
      {/* Header */}
      <div className="bg-[#00704e] h-32 flex items-center px-10 text-white shadow-lg">
        <Link to="/home">
          <ArrowLeftIcon className="h-8 w-8 mr-4 hover:scale-110 transition-transform" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Notification Center</h1>
          <p className="text-xs opacity-80 uppercase tracking-widest font-semibold">
            Stay Updated
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center text-gray-400 animate-pulse">
              Syncing your alerts...
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${notif.status === "Unread" ? "bg-blue-50/30" : ""}`}
                >
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900">{notif.title}</h3>
                      <span className="text-[10px] font-black text-gray-400 uppercase">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notif.message}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 uppercase">
                        {notif.type}
                      </span>
                      {notif.status === "Unread" && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center text-gray-400">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">
                All caught up! No new notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
