import pool from "../config/db.js";

// 📊 GET all payments with resident names
export const getAllPayments = async (req, res) => {
  try {
    // We select r.full_name as residentName to map directly to your frontend table
    const [rows] = await pool.query(`
      SELECT 
        b.billing_id AS id, 
        b.resident_id,
        r.full_name AS residentName, 
        b.billing_month AS billingMonth, 
        b.amount, 
        b.status
      FROM billing b
      INNER JOIN residents r ON b.resident_id = r.resident_id
      ORDER BY b.billing_id DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    // This will print the EXACT database issue in your Railway logs (e.g., Unknown column)
    console.error("❌ SQL Error inside getAllPayments:", err.message);
    res
      .status(500)
      .json({ error: "Database query failed", details: err.message });
  }
};
// POST Create a new bill (Issue Bill) + Notification
// POST Create a new bill (Issue Bill) + Notification
export const createBill = async (req, res) => {
  // Handle both camelCase and snake_case properties from req.body
  const residentId = req.body.residentId || req.body.resident_id;
  const { amount, billingMonth } = req.body;

  // 1. Guard clause: Stop execution early if payload properties are missing
  if (!residentId) {
    return res.status(400).json({
      message:
        "Validation Error: 'residentId' is missing or undefined in the request body.",
    });
  }
  if (!amount || !billingMonth) {
    return res.status(400).json({
      message:
        "Validation Error: 'amount' and 'billingMonth' are required fields.",
    });
  }

  try {
    // 2. Create the Bill
    const [result] = await pool.query(
      "INSERT INTO billing (resident_id, amount, billing_month, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      [residentId, amount, billingMonth, "Pending"],
    );

    const billingId = result.insertId;

    // 3. Create a Notification for the resident
    await pool.query(
      `INSERT INTO notifications (resident_id, type, title, message, related_id) 
       VALUES (?, 'Bill', 'New Bill Issued', ?, ?)`,
      [
        residentId,
        `A new bill for ${billingMonth} amounting to ₱${Number(amount).toLocaleString()} has been posted.`,
        billingId,
      ],
    );

    res.status(201).json({
      message: "Bill created and resident notified successfully",
      billingId: billingId,
    });
  } catch (err) {
    console.error(
      "SQL ERROR inside createBill:",
      err.sqlMessage || err.message,
    );
    res.status(500).json({ message: err.sqlMessage || err.message });
  }
};

// PATCH update payment status + Notification
export const updatePaymentStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params; // billing_id

  try {
    // 1. Get resident_id and month before updating to customize the notification
    const [billDetails] = await pool.query(
      "SELECT resident_id, billing_month FROM billing WHERE billing_id = ?",
      [id],
    );

    if (billDetails.length === 0) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    const { resident_id, billing_month } = billDetails[0];

    // 2. Update the Bill status
    await pool.query("UPDATE billing SET status = ? WHERE billing_id = ?", [
      status,
      id,
    ]);

    // 3. Notify the resident about the status change (e.g., Payment Confirmed)
    if (status === "Paid") {
      await pool.query(
        `INSERT INTO notifications (resident_id, type, title, message, related_id) 
         VALUES (?, 'Bill', 'Payment Confirmed', ?, ?)`,
        [
          resident_id,
          `Your payment for the ${billing_month} bill has been verified and marked as Paid.`,
          id,
        ],
      );
    }

    res.json({ message: `Payment status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function in your billing controller
export const getUnpaidTotal = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT SUM(amount) as totalAmount FROM billing WHERE status = 'Pending'",
    );

    const total = rows[0].totalAmount || 0;
    res.json({ totalAmount: total });
  } catch (err) {
    console.error("Error fetching unpaid total:", err);
    res.status(500).json({ error: "Failed to calculate unpaid dues" });
  }
};

export const getMyBills = async (req, res) => {
  try {
    const accountId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        b.billing_id as id, 
        b.amount, 
        b.billing_month as billingMonth, 
        b.status, 
        b.created_at 
       FROM billing b
       JOIN residents r ON b.resident_id = r.resident_id
       WHERE r.account_id = ? 
       ORDER BY b.created_at DESC`,
      [accountId],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
