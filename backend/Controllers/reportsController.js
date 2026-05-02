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

export const createReport = async (req, res) => {
  try {
    const { title, type, content } = req.body;
    const accountId = req.user.id; // From JWT

    // Find the resident_id linked to this account
    const [resident] = await pool.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (resident.length === 0)
      return res.status(404).json({ message: "Resident not found" });

    const residentId = resident[0].resident_id;

    // Insert into the reports table as a system notification/report
    await pool.query(
      `INSERT INTO reports (resident_id, title, type, content, date, status) 
       VALUES (?, ?, ?, ?, CURDATE(), 'Pending')`,
      [residentId, title, type, content],
    );

    res
      .status(201)
      .json({ message: "Notification sent to system successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const accountId = req.user.id;
    const [rows] = await pool.query(
      `SELECT r.report_id as id, r.title, r.type, r.status, r.created_at as date 
       FROM reports r
       JOIN residents res ON r.resident_id = res.resident_id
       WHERE res.account_id = ?
       ORDER BY r.created_at DESC`,
      [accountId],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
