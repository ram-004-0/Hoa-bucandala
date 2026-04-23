// Routes/announcement.js
import express from "express";
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../Controllers/announcementController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; // Import your middleware

const router = express.Router();

// Public: Anyone can see announcements
router.get("/", getAllAnnouncements);

// Protected: Only logged-in admins can create or delete
router.post("/", authenticate, createAnnouncement);
router.delete("/:id", authenticate, deleteAnnouncement);

export default router;
