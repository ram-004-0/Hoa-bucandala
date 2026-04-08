// Routes/waste.js - Cleaned up paths
import express from "express";
import {
  getPickupAvailability,
  createPickup,
  getMyPickups,
  getAllPickups,
  getAdminSchedules,
  addSchedule,
  deleteSchedule,
  updatePickupStatus,
  cancelPickup,
} from "../Controllers/wasteController.js";
import { authorizeRoles } from "../middlewares/roles.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- 🏠 RESIDENT ROUTES ---
// URL: /api/waste/availability
router.get("/availability", authenticate, getPickupAvailability);

// URL: /api/waste/book
router.post("/book", authenticate, createPickup);

// URL: /api/waste/my-pickups
router.get("/my-pickups", authenticate, getMyPickups);

// URL: /api/waste/cancel/:id
router.delete("/cancel/:id", authenticate, cancelPickup);

// --- 🛡️ ADMIN ROUTES ---
// URL: /api/waste/all-pickups
router.get(
  "/all-pickups",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllPickups,
);

// URL: /api/waste/pickup/:id
router.patch(
  "/pickup/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updatePickupStatus,
);

// Master schedule management (URL: /api/waste/)
router.get("/", authenticate, authorizeRoles("ADMIN"), getAdminSchedules);
router.post("/", authenticate, authorizeRoles("ADMIN"), addSchedule);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteSchedule);

export default router;
