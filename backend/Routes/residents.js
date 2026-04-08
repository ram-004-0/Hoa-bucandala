// routes/residents.js
import express from "express";
import {
  createResident,
  getResidents,
  getResidentCount,
} from "../Controllers/residentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// 1. Change to GET and specific path
router.get("/count", authenticate, authorizeRoles("ADMIN"), getResidentCount);

// 2. Keep the others as is
router.get("/", authenticate, authorizeRoles("ADMIN"), getResidents);
router.post("/", authenticate, authorizeRoles("ADMIN"), createResident);

export default router;
