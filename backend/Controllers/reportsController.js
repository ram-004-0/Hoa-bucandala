import db from "../config/db.js";

// @desc    Get all reports for Admin view
// @route   GET /api/reports/all
export const getAllReports = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, res.full_name 
      FROM reports r 
      JOIN residents res ON r.resident_id = res.resident_id 
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch all reports" });
  }
};

// @desc    Create a new waste report (Uncollected or Overflow)
// @route   POST /api/reports/waste-report
export const createWasteReport = async (req, res) => {
  const { reportType, description, location } = req.body;
  const accountId = req.user.id;

  try {
    // 1. Find resident_id linked to account
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (resident.length === 0) {
      return res.status(404).json({ message: "Resident profile not found" });
    }

    const residentId = resident[0].resident_id;

    // 2. Insert into the reports table
    const [result] = await db.query(
      `INSERT INTO reports (resident_id, report_type, description, location, status) 
       VALUES (?, ?, ?, ?, 'Pending')`,
      [residentId, reportType, description, location],
    );

    // 3. Create a notification alert for the resident
    await db.query(
      `INSERT INTO notifications (resident_id, type, title, message, related_id) 
       VALUES (?, 'Report', ?, ?, ?)`,
      [
        residentId,
        "Report Submitted",
        `Your ${reportType} report at ${location} has been received.`,
        result.insertId,
      ],
    );

    res
      .status(201)
      .json({ message: "Report filed successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// @desc    Get report history for the logged-in resident
// @route   GET /api/reports/my-history
export const getMyReportHistory = async (req, res) => {
  const accountId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT r.* FROM reports r
       JOIN residents res ON r.resident_id = res.resident_id
       WHERE res.account_id = ?
       ORDER BY r.created_at DESC`,
      [accountId],
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching your history" });
  }
};

// @desc    Update report status (Admin Action)
// @route   PATCH /api/reports/:id/status
export const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await db.query("UPDATE reports SET status = ? WHERE report_id = ?", [
      status,
      id,
    ]);
    res.json({ message: "Report status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update status" });
  }
};
