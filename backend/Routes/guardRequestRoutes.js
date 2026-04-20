import express from "express";
import multer from "multer";
import path from "path";
import {
  createGuardRequest,
  getAllRequests,
  getPendingRequests,
  updateRequestStatus,
} from "../Controllers/guardRequestController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `security-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Resident Route
router.post("/", authenticate, upload.single("photo"), createGuardRequest);

// Guard Routes
router.get("/", authenticate, getAllRequests);
router.get("/pending", authenticate, getPendingRequests);
router.patch("/:id/status", authenticate, updateRequestStatus);

export default router;
