import db from "../config/db.js";

/**
 * RESIDENT: Register a new visitor
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

    // Get resident_id from account_id (from auth middleware)
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (!resident.length) {
      return res.status(404).json({ message: "Resident profile not found" });
    }

    const residentId = resident[0].resident_id;
    const fullAddress = `Phase ${phase} Block ${block} Lot ${lot}`;

    // Use column names that match your MySQL schema
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
    console.error("Register Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * RESIDENT: Get their own visitor history
 */
export const getResidentVisitorHistory = async (req, res) => {
  try {
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (!resident.length) {
      return res.status(404).json({ message: "Resident not found" });
    }

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
 * ADMIN/GUARD: Get all visitors for the master list
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
 * ADMIN/GUARD: Update visitor status
 */
export const updateVisitorStatus = async (req, res) => {
  const { id } = req.params; // Supports numeric ID or "ID|Name|Address" string
  const { status } = req.body; // e.g., 'ARRIVED' or 'DEPARTED'

  try {
    // If scanned via QR, extract the ID from the pipe-delimited string
    const numericId = id.includes("|") ? id.split("|")[0] : id;

    const [result] = await db.query(
      "UPDATE visitors SET status = ? WHERE visitor_id = ?",
      [status, numericId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Visitor record not found" });
    }

    // Return updated record for the Guard's success modal
    const [updated] = await db.query(
      "SELECT * FROM visitors WHERE visitor_id = ?",
      [numericId],
    );

    res.json({
      message: `Status updated to ${status}`,
      visitor: updated[0],
    });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ error: "Server update failed" });
  }
};

export const getVisitorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT * FROM visitors WHERE visitor_id = ?",
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    // CRITICAL: You must send the response back!
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
