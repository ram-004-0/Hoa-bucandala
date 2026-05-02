import express from "express";
import {
  createGuard,
  fetchGuard,
  getUser,
  updateUser,
} from "../Controllers/user.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

/**
 * UNIFIED MANAGEMENT ROUTES
 * These handle fetching the combined list of accounts (Residents + Guards)
 * for the Community Management dashboard.
 */

// GET /api/guards/
// This matches your frontend fetch(`${API_URL}/users`) if you point it here
router.get("/", authenticate, authorizeRoles("ADMIN"), getUser);

// PUT /api/guards/:id
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateUser);

/**
 * GUARD SPECIFIC ROUTES
 */

// GET /api/guards/:id
router.get("/:id", authenticate, authorizeRoles("ADMIN"), fetchGuard);

// POST /api/guards/
router.post("/", authenticate, authorizeRoles("ADMIN"), createGuard);

export default router;
