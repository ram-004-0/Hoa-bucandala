import express from "express";
import {
  getAllReports,
  createWasteReport,
  getMyReportHistory,
  updateReportStatus,
} from "../Controllers/reportsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Route: Get every report in the system
router.get("/all", authenticate, getAllReports);

// Report Route: Post a new report
router.post("/waste-reports", authenticate, createWasteReport);

// Report Route: Get their own report history
router.get("/my-history", authenticate, getMyReportHistory);

// Report Route: Change status of a report (Pending -> In Progress -> Resolved)
router.patch("/:id/status", authenticate, updateReportStatus);

export default router;
