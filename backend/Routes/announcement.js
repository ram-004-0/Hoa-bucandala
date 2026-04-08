import express from "express";
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../Controllers/announcementController.js";

const router = express.Router();

// GET /api/announcements
router.get("/", getAllAnnouncements);

// POST /api/announcements
router.post("/", createAnnouncement);

// DELETE /api/announcements/:id
router.delete("/:id", deleteAnnouncement);

export default router;
