// index.js
import express from "express";
import cors from "cors";
import residentsRoutes from "./Routes/residents.js";
import authRoutes from "./Routes/auth.js";
import wasteRoutes from "./Routes/waste.js";
import reservationRoutes from "./Routes/reservation.js";
import reportsRoutes from "./Routes/reports.js";
import announcementRoutes from "./Routes/announcement.js";
import visitorRoutes from "./Routes/visitorRoutes.js";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
app.use("/api/visitors", visitorRoutes);
app.use("/api/residents", residentsRoutes);
app.use("/api", authRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api", reservationRoutes);
app.use("/api", reportsRoutes);
app.use("/api/announcements", announcementRoutes);

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
