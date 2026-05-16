import express from "express";
import {
  getAllPayments,
  updatePaymentStatus,
  createBill,
  getUnpaidTotal,
  getMyBills,
} from "../Controllers/paymentsController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roles.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles("ADMIN"), getAllPayments);

router.get(
  "/unpaid-total",
  authenticate,
  authorizeRoles("ADMIN"),
  getUnpaidTotal,
);

// ADMIN
router.post("/create-bill", authenticate, authorizeRoles("ADMIN"), createBill);

// ADMIN
router.patch(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  updatePaymentStatus,
);

router.get("/my-bills", authenticate, getMyBills);

export default router;
