// routes/residents.js
import express from "express";
import {
  createResident,
  getResidents,
  getResidentCount,
  updateResident, // Import new controller
  deleteResident, // Import new controller
} from "../Controllers/residentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// Get total count for dashboard cards
router.get("/count", authenticate, authorizeRoles("ADMIN"), getResidentCount);

// Main Resident CRUD
router.get("/", authenticate, authorizeRoles("ADMIN"), getResidents);
router.post("/", authenticate, authorizeRoles("ADMIN"), createResident);

// ID-based routes for Update and Delete
router.put("edit/:id", authenticate, authorizeRoles("ADMIN"), updateResident);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteResident);

export default router;
