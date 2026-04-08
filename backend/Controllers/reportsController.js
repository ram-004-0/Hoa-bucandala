import db from "../config/db.js";

export const getReports = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reports ORDER BY date DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};
