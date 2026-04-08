import express from "express";
import {
  getAllWasteSchedules,
  createWasteSchedule,
  deleteWasteSchedule,
} from "../Controllers/wasteController.js";

const router = express.Router();

// GET all schedules
router.get("/waste", getAllWasteSchedules);

// CREATE schedule
router.post("/waste", createWasteSchedule);

// DELETE schedule
router.delete("/waste/:id", deleteWasteSchedule);

export default router;
