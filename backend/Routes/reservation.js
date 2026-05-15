import express from "express";
import {
  getAllReservations,
  createReservation,
  deleteReservation,
  getAvailability,
  getMyReservations,
  updateReservationStatus,
  getFullyReservedDates, // <-- Added Import
} from "../Controllers/reservationController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

/**
 * AVAILABILITY
 * - Resident & Admin
 */
router.get(
  "/amenities/:id/availability",
  authenticate,
  authorizeRoles("RESIDENT", "ADMIN"),
  getAvailability,
);

// New Endpoint used by the visual calendar to block out fully booked days
router.get(
  "/amenities/:id/reserved-dates",
  authenticate,
  authorizeRoles("RESIDENT", "ADMIN"),
  getFullyReservedDates,
);

/**
 * RESIDENT
 * - Create reservation
 */
router.post(
  "/reservations",
  authenticate,
  authorizeRoles("RESIDENT"),
  createReservation,
);

router.get(
  "/my-history",
  authenticate,
  authorizeRoles("RESIDENT"),
  getMyReservations,
);

/**
 * ADMIN
 * - Get all reservations
 */
router.get(
  "/reservations",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllReservations,
);

/**
 * ADMIN / RESIDENT
 * - Delete reservation
 */
router.delete(
  "/reservations/:id",
  authenticate,
  authorizeRoles("ADMIN", "RESIDENT"),
  deleteReservation,
);

router.patch(
  "/reservations/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateReservationStatus,
);

export default router;
