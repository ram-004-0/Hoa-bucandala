import express from "express"; // Changed from require
const router = express.Router();

// Update these paths to match your actual folder structure (e.g., .js extension is required)
import {
  getMyNotifications,
  getUnreadCount,
  markAllAsRead,
  clearAllNotifications,
} from "../Controllers/notificationController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

// Both routes require the user to be logged in
router.get("/my-alerts", authenticate, getMyNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.put("/mark-read", authenticate, markAllAsRead); // For the "Read All" button
router.delete("/clear-all", authenticate, clearAllNotifications);
export default router;
