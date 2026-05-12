import express from "express";
import {
  createGuardRequest,
  getAllRequests,
  getPendingRequests,
  updateRequestStatus,
  upload, // <--- ADD THIS IMPORT from your controller
} from "../Controllers/guardRequestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Resident Route
router.post(
  "/create",
  authenticate,
  upload.single("photo"),
  createGuardRequest,
);

// Guard Routes
router.get("/", authenticate, getAllRequests);
router.get("/pending", authenticate, getPendingRequests);
router.patch("/:id/status", authenticate, updateRequestStatus);

export default router;
