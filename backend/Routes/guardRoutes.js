import express from "express";
import { createGuard } from "../Controllers/user.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// Only ADMINs can create guards.
// Note: Ensure 'ADMIN' matches the string stored in your DB role column
router.post("/", authenticate, authorizeRoles("ADMIN"), createGuard);

export default router;
