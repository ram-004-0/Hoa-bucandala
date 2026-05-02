import pool from "../config/db.js";

// GET all payments with resident names
export const getAllPayments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.billing_id as id, r.full_name as residentName, 
             b.billing_month as billingMonth, 
             b.amount, 'Bank Transfer/GCash' as method, b.status
      FROM billing b
      JOIN residents r ON b.resident_id = r.resident_id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// NEW: POST Create a new bill (Issue Bill)
export const createBill = async (req, res) => {
  const { residentId, amount, billingMonth } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO billing (resident_id, amount, billing_month, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      [residentId, amount, billingMonth, "Pending"],
    );

    res.status(201).json({
      message: "Bill created successfully",
      billingId: result.insertId,
    });
  } catch (err) {
    console.error("SQL ERROR:", err.sqlMessage);
    res.status(500).json({ message: err.sqlMessage });
  }
};

// PATCH update payment status
export const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "UPDATE billing SET status = ? WHERE billing_id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.json({ message: "Payment status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Function in your billing controller
export const getUnpaidTotal = async (req, res) => {
  try {
    // FIX: Change 'db.query' to 'pool.query' to match your import
    const [rows] = await pool.query(
      "SELECT SUM(amount) as totalAmount FROM billing WHERE status = 'Pending'",
    );

    // If there are no pending bills, sum returns null, so we fallback to 0
    const total = rows[0].totalAmount || 0;

    res.json({ totalAmount: total });
  } catch (err) {
    console.error("Error fetching unpaid total:", err);
    res.status(500).json({ error: "Failed to calculate unpaid dues" });
  }
};

export const getMyBills = async (req, res) => {
  try {
    const residentId = req.user.id;

    const [rows] = await pool.query(
      `SELECT billing_id as id, amount, billing_month as billingMonth, status, created_at 
       FROM billing 
       WHERE resident_id = ? 
       ORDER BY created_at DESC`,
      [residentId],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
