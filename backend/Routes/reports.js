import express from "express";
import { getReports } from "../Controllers/reportsController.js";

const router = express.Router();

router.get("/reports", getReports);

export default router;
