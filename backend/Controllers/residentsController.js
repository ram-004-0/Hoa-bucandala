import bcrypt from "bcryptjs";
import db from "../config/db.js";

// 🛡️ Get total resident count
export const getResidentCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM residents");
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: "Failed to count residents" });
  }
};

// ➕ Create Resident
export const createResident = async (req, res) => {
  const { full_name, email, address, contact, has_balance } = req.body;
  try {
    const [existing] = await db.query(
      "SELECT id FROM accounts WHERE email = ?",
      [email],
    );
    if (existing.length > 0)
      return res.status(400).json({ error: "Email exists" });

    const [accountResult] = await db.query(
      "INSERT INTO accounts (email, password, role) VALUES (?, 'PLACEHOLDER', 'RESIDENT')",
      [email],
    );
    const accountId = accountResult.insertId;

    const [residentResult] = await db.query(
      "INSERT INTO residents (account_id, full_name, address, contact, has_balance) VALUES (?, ?, ?, ?, ?)",
      [accountId, full_name, address, contact, has_balance ? 1 : 0],
    );
    const residentId = residentResult.insertId;

    const passwordPlain = `resident${residentId}`;
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    await db.query("UPDATE accounts SET password = ? WHERE id = ?", [
      hashedPassword,
      accountId,
    ]);

    res.status(201).json({ residentId, email, password: passwordPlain });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📄 Get All Residents (JOIN for Email)
export const getResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.resident_id, a.email, r.full_name, r.address, r.contact, r.has_balance 
       FROM residents r JOIN accounts a ON r.account_id = a.id ORDER BY r.resident_id ASC`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🛠️ Update Resident (The critical part for the Edit button)
export const updateResident = async (req, res) => {
  const { id } = req.params; // resident_id from URL
  const { full_name, email, address, contact, has_balance } = req.body;

  try {
    const [resident] = await db.query(
      "SELECT account_id FROM residents WHERE resident_id = ?",
      [id],
    );
    if (resident.length === 0)
      return res.status(404).json({ error: "Not found" });

    const accountId = resident[0].account_id;

    // Update Email in Accounts
    await db.query("UPDATE accounts SET email = ? WHERE id = ?", [
      email,
      accountId,
    ]);

    // Update Profile in Residents
    await db.query(
      "UPDATE residents SET full_name = ?, address = ?, contact = ?, has_balance = ? WHERE resident_id = ?",
      [full_name, address, contact, has_balance ? 1 : 0, id],
    );

    res.json({
      message: "Updated",
      resident_id: id,
      full_name,
      email,
      address,
      contact,
      has_balance,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(400).json({ error: "Email already in use" });
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ Delete Resident
export const deleteResident = async (req, res) => {
  const { id } = req.params;
  try {
    const [resident] = await db.query(
      "SELECT account_id FROM residents WHERE resident_id = ?",
      [id],
    );
    if (resident.length === 0)
      return res.status(404).json({ error: "Not found" });
    await db.query("DELETE FROM accounts WHERE id = ?", [
      resident[0].account_id,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
