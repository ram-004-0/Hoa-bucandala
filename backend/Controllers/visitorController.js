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

    // 1. Get resident_id from the logged-in user's account_id
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (!resident.length) {
      return res.status(404).json({ message: "Resident profile not found" });
    }

    const residentId = resident[0].resident_id;
    const fullAddress = `Phase ${phase} Block ${block} Lot ${lot}`;

    // 2. Insert into visitors table
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

    // 3. Generate a unique ID for the QR Code
    const visitorId = `VIS-${result.insertId}-${Math.floor(1000 + Math.random() * 9000)}`;

    res.status(201).json({
      message: "Visitor registered successfully",
      visitorId: visitorId,
    });
  } catch (err) {
    console.error("Visitor registration error:", err);
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

    if (!resident.length)
      return res.status(404).json({ message: "Resident not found" });

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

export const updateVisitorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'ARRIVED' or 'DEPARTED' or 'CANCELLED'

  try {
    const [result] = await db.query(
      "UPDATE visitors SET status = ? WHERE visitor_id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Visitor record not found" });
    }

    res.json({
      message: `Visitor status updated to ${status}`,
      updatedStatus: status,
    });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
};
