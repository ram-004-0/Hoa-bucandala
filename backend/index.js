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

// 1. Define allowed origins
const allowedOrigins = [
  "https://project-qbdkn.vercel.app", // Your Vercel frontend
  "http://localhost:5173", // For local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
