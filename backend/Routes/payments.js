import express from "express";
import {
  getAllPayments,
  updatePaymentStatus,
  createBill,
  getUnpaidTotal, // 1. Import the new function
} from "../Controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

// ADMIN ONLY - Fetch all transactions
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllPayments);

// 2. NEW ROUTE: This fixes the 404 for /api/payments/unpaid-total
// (Note: If your server.js uses app.use('/api/billing', ...), adjust the frontend URL accordingly)
router.get(
  "/unpaid-total",
  authenticate,
  authorizeRoles("ADMIN"),
  getUnpaidTotal,
);

// ADMIN ONLY - Create/Issue a new bill
router.post("/", authenticate, authorizeRoles("ADMIN"), createBill);

// ADMIN ONLY - Update status (Keep this at the bottom)
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updatePaymentStatus,
);

export default router;
