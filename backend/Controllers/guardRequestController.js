import pool from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "hoa-security-reports",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 800, height: 600, crop: "limit" }],
  },
});

export const upload = multer({ storage: storage });

// RESIDENT: Create a new request
export const createGuardRequest = async (req, res) => {
  const { situation_details, location, request_type_name } = req.body;
  const accountId = req.user.id;

  // Cloudinary returns the full URL in req.file.path
  // This URL is permanent and won't disappear on refresh
  const photoUrl = req.file ? req.file.path : null;

  try {
    const [resident] = await pool.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );
    if (resident.length === 0)
      return res.status(403).json({ message: "Resident profile not found." });

    const [typeRecord] = await pool.query(
      "SELECT type_id FROM request_types WHERE type_name = ?",
      [request_type_name],
    );
    if (typeRecord.length === 0)
      return res.status(400).json({ message: "Invalid request type." });

    await pool.query(
      "INSERT INTO guard_requests (resident_id, type_id, situation_details, location, photo_url, status) VALUES (?, ?, ?, ?, ?, 'PENDING')",
      [
        resident[0].resident_id,
        typeRecord[0].type_id,
        situation_details,
        location || "Not provided",
        photoUrl,
      ],
    );

    res
      .status(201)
      .json({ message: "Security report submitted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// GUARD/ADMIN: Get all requests
export const getAllRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        gr.request_id, 
        gr.situation_details, 
        gr.location, 
        gr.photo_url, 
        gr.status, 
        gr.report,
        gr.created_at,
        rt.type_name, 
        rt.priority_level, 
        r.full_name, 
        r.contact
      FROM guard_requests gr
      JOIN request_types rt ON gr.type_id = rt.type_id
      JOIN residents r ON gr.resident_id = r.resident_id
      ORDER BY 
        CASE WHEN gr.status = 'PENDING' THEN 1 ELSE 2 END, 
        gr.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// GUARD: Get Pending Count for Dashboard
export const getPendingRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT request_id FROM guard_requests WHERE status = 'PENDING'",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GUARD: Update status (RESOLVE)
export const updateRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, report } = req.body;
  try {
    await pool.query(
      "UPDATE guard_requests SET status = ?, report = ? WHERE request_id = ?",
      [status, report || null, id],
    );
    res.json({ message: `Request marked as ${status}` });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
