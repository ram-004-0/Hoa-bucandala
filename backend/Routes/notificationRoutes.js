const express = require("express");
const router = express.Router();
const {
  getMyNotifications,
  getUnreadCount,
} = require("../controllers/notificationController");
const { authenticate } = require("../middlewares/authMiddleware");

// Both routes require the user to be logged in
router.get("/my-alerts", authenticate, getMyNotifications);
router.get("/unread-count", authenticate, getUnreadCount);

module.exports = router;
