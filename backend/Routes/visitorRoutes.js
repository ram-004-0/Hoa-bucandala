import express from "express";
import {
  registerVisitor,
  getAllVisitors,
  getResidentVisitorHistory,
  updateVisitorStatus,
  getVisitorById,
} from "../Controllers/visitorController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

/**
 * @route   POST /api/visitors/register
 * @desc    Resident registers a new visitor
 * @access  Private (Resident)
 */
router.post(
  "/register",
  authenticate,
  authorizeRoles("RESIDENT"),
  registerVisitor,
);

/**
 * @route   GET /api/visitors/my-history
 * @desc    Resident views their own registration history
 * @access  Private (Resident)
 */
router.get(
  "/my-history",
  authenticate,
  authorizeRoles("RESIDENT"),
  getResidentVisitorHistory,
);

/**
 * @route   GET /api/visitors/all
 * @desc    Admin/Guard views all scheduled visitors
 * @access  Private (Admin, Guard)
 */
router.get(
  "/all",
  authenticate,
  authorizeRoles("ADMIN", "GUARD"),
  getAllVisitors,
);

/**
 * @route   PATCH /api/visitors/:id/status
 * @desc    Update visitor status via Scan (ID|Name format) or Manual ID
 * @access  Private (Admin, Guard)
 */
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("GUARD", "ADMIN"),
  updateVisitorStatus,
);

router.get(
  "/:id",
  authenticate,
  getVisitorById, // You need to create this controller function
);

export default router;
