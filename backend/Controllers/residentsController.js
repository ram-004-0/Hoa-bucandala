// controllers/residentsController.js
import bcrypt from "bcryptjs";
import db from "../config/db.js";

/**
 * 🛡️ ADMIN: Get total resident count for Dashboard
 */
export const getResidentCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM residents");

    // Return the first row's count value
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error("Count Fetch Error:", err);
    res.status(500).json({ error: "Failed to count residents" });
  }
};

export const createResident = async (req, res) => {
  const { full_name, email, address, contact, has_balance } = req.body;

  try {
    const [existing] = await db.query(
      "SELECT id FROM accounts WHERE email = ?",
      [email],
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 1️⃣ Create account with placeholder hash (will update immediately)
    const [accountResult] = await db.query(
      "INSERT INTO accounts (email, password, role) VALUES (?, ?, 'RESIDENT')",
      [email, "PLACEHOLDER"],
    );

    const accountId = accountResult.insertId;

    // 2️⃣ Create resident
    const [residentResult] = await db.query(
      `INSERT INTO residents (account_id, full_name, address, contact, has_balance)
       VALUES (?, ?, ?, ?, ?)`,
      [accountId, full_name, address, contact, has_balance ? 1 : 0],
    );

    const residentId = residentResult.insertId;

    // 3️⃣ Generate password
    const passwordPlain = `resident${residentId}`;
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    // 4️⃣ Update password immediately
    await db.query("UPDATE accounts SET password = ? WHERE id = ?", [
      hashedPassword,
      accountId,
    ]);

    res.status(201).json({
      residentId,
      email,
      password: passwordPlain, // show once only
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
// Get all residents
// controllers/residentsController.js
export const getResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.resident_id, a.email, r.full_name, r.address, r.contact, r.has_balance
       FROM residents r
       JOIN accounts a ON r.account_id = a.id
       ORDER BY r.resident_id ASC`,
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
