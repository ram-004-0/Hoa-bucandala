import db from "../config/db.js";

/**
 * RESIDENT: Register a new visitor
 * POST /api/visitors/register
 */
export const registerVisitor = async (req, res) => {
  try {
    const {
      visitorName,
      contactNumber,
      purpose,
      date,
      time,
      phase,
      block,
      lot,
    } = req.body;

    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (!resident.length)
      return res.status(404).json({ message: "Resident profile not found" });

    const residentId = resident[0].resident_id;
    const fullAddress = `Phase ${phase} Block ${block} Lot ${lot}`;

    const [result] = await db.query(
      `INSERT INTO visitors 
        (resident_id, visitor_name, contact_number, purpose_of_visit, expected_date, expected_time, address_to_visit) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        residentId,
        visitorName,
        contactNumber,
        purpose,
        date,
        time,
        fullAddress,
      ],
    );

    res.status(201).json({
      message: "Visitor registered successfully",
      visitor_id: result.insertId,
      visitor_name: visitorName,
      address_to_visit: fullAddress,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * RESIDENT: Get their own visitor history
 * GET /api/visitors/my-history
 */
export const getResidentVisitorHistory = async (req, res) => {
  try {
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );
    const [rows] = await db.query(
      "SELECT * FROM visitors WHERE resident_id = ? ORDER BY created_at DESC",
      [resident[0].resident_id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADMIN/GUARD: Get all visitors in the system
 * GET /api/visitors/all
 */
export const getAllVisitors = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, r.full_name as host_resident 
      FROM visitors v
      JOIN residents r ON v.resident_id = r.resident_id
      ORDER BY v.expected_date DESC, v.expected_time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch visitors" });
  }
};

/**
 * ADMIN/GUARD: Update visitor status (Approve Entry/Exit)
 * PATCH /api/visitors/:id/status
 */
export const updateVisitorStatus = async (req, res) => {
  const { id } = req.params; // Handles "12" or "12|Name..."
  const { status } = req.body;

  try {
    const numericId = id.includes("|") ? id.split("|")[0] : id;

    const [result] = await db.query(
      "UPDATE visitors SET status = ? WHERE visitor_id = ?",
      [status, numericId],
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Record not found" });

    const [updated] = await db.query(
      "SELECT * FROM visitors WHERE visitor_id = ?",
      [numericId],
    );
    res.json({ message: `Status updated to ${status}`, visitor: updated[0] });
  } catch (err) {
    res.status(500).json({ error: "Server update failed" });
  }
};
