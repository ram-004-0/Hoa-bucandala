import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Route Imports
import residentsRoutes from "./Routes/residents.js";
import authRoutes from "./Routes/auth.js";
import reservationRoutes from "./Routes/reservation.js";
import reportsRoutes from "./Routes/reports.js";
import announcementRoutes from "./Routes/announcement.js";
import visitorRoutes from "./Routes/visitorRoutes.js";
import paymentsRoutes from "./Routes/payments.js";
import guardRequestRoutes from "./Routes/guardRequestRoutes.js";
import guardRoutes from "./Routes/guardRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- 1. FIXED CORS CONFIGURATION ---
// Define allowedOrigins BEFORE calling app.use(cors)
const allowedOrigins = [
  "https://hoa-camella-bucandala.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Logs which origin was blocked for easier debugging in Railway logs
        console.log("Blocked by CORS:", origin);
        callback(new Error("CORS policy block"), false);
      }
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    // explicitly allow these headers to satisfy preflight checks
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// 2. STATIC FILES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 3. ROUTES
app.use("/api/announcements", announcementRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/guard-requests", guardRequestRoutes);
app.use("/api/guards", guardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api", authRoutes);
app.use("/api", reservationRoutes);

// Health Check
app.get("/", (req, res) => {
  res.send("HOA Backend is UP and RUNNING!");
});

// 4. SERVER INITIALIZATION
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HOA Backend live on port ${PORT}`);
});
