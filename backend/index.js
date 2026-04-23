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
app.use(cors());

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
