import express from "express";
import {
  registerVisitor,
  getAllVisitors,
  getResidentVisitorHistory,
  updateVisitorStatus,
} from "../Controllers/visitorController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// Resident: Register a visitor
router.post(
  "/register",
  authenticate,
  authorizeRoles("RESIDENT"),
  registerVisitor,
);

// Resident: View their own history
router.get(
  "/my-history",
  authenticate,
  authorizeRoles("RESIDENT"),
  getResidentVisitorHistory,
);

// Admin/Guard: View all visitors (for the security gate list)
router.get(
  "/all",
  authenticate,
  authorizeRoles("ADMIN", "GUARD"),
  getAllVisitors,
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("GUARD", "ADMIN"),
  updateVisitorStatus,
);

export default router;
