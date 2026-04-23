import express from "express";
import { login, updateProfile, getMe } from "../Controllers/authController.js";
import { authenticate } from "../middlewares/authMiddleware.js"; // The middleware you just shared

const router = express.Router();

router.post("/login", login);

router.patch("/update-profile", authenticate, updateProfile);

router.get("/me", authenticate, getMe);

export default router;
