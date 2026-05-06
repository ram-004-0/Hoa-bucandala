import express from "express";
import {
  getAllReservations,
  createReservation,
  deleteReservation,
  getAvailability,
  getMyReservations,
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
router.get(authenticate, authorizeRoles("RESIDENT"), getMyReservations);
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
 * ADMIN
 * - Delete reservation
 */
router.delete(
  "/reservations/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  deleteReservation,
);

export default router;
