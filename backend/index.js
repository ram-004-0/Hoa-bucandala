// index.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import residentsRoutes from "./Routes/residents.js";
import authRoutes from "./Routes/auth.js";
import wasteRoutes from "./Routes/waste.js";
import reservationRoutes from "./Routes/reservation.js";
import reportsRoutes from "./Routes/reports.js";
import announcementRoutes from "./Routes/announcement.js";
import visitorRoutes from "./Routes/visitorRoutes.js";
import paymentsRoutes from "./Routes/payments.js";
import guardRequestRoutes from "./Routes/guardRequestRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(
  cors({
    origin: "http://project-qbdkn.vercel.app",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/visitors", visitorRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api", authRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api", reservationRoutes);
app.use("/api", reportsRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/guard-requests", guardRequestRoutes);

const PORT = 17180;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://project-qbdkn.vercel.app:${PORT}`),
);
