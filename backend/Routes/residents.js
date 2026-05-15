// routes/residents.js
import express from "express";
import {
  createResident,
  getResidents,
  getResidentCount,
  updateResident,
  deleteResident,
  getAllCommunityMembers, // This is the one we want
} from "../Controllers/residentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// Get total count for dashboard cards
router.get("/count", authenticate, authorizeRoles("ADMIN"), getResidentCount);

// Update this line: Change getResidents to getAllCommunityMembers
// This ensures that when the frontend calls /api/residents, it gets everyone
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllCommunityMembers);

router.post("/", authenticate, authorizeRoles("ADMIN"), createResident);

// ID-based routes for Update and Delete
router.put("/edit/:id", authenticate, authorizeRoles("ADMIN"), updateResident);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteResident);

// You can keep this as an extra alias if you want, but the one above is primary
router.get(
  "/community-members",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllCommunityMembers,
);

export default router;
