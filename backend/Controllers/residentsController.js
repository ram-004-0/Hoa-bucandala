import bcrypt from "bcryptjs";
import db from "../config/db.js";

// 📊 Get total resident count
export const getResidentCount = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) as count FROM residents");
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: "Failed to count residents" });
  }
};

// ➕ Create Resident (Improved with Transactions)
export const createResident = async (req, res) => {
  const { full_name, email, address, contact, has_balance } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if email exists
    const [existing] = await connection.query(
      "SELECT id FROM accounts WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ error: "Email already exists" });
    }

    // 1. Create Account
    const [accountResult] = await connection.query(
      "INSERT INTO accounts (email, password, role) VALUES (?, 'TEMP_PASS', 'RESIDENT')",
      [email],
    );
    const accountId = accountResult.insertId;

    // 2. Create Resident Profile
    const [residentResult] = await connection.query(
      "INSERT INTO residents (account_id, full_name, address, contact, has_balance) VALUES (?, ?, ?, ?, ?)",
      [accountId, full_name, address, contact, has_balance ? 1 : 0],
    );
    const residentId = residentResult.insertId;

    // 3. Update with real hashed password
    const passwordPlain = `resident${residentId}`;
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    await connection.query("UPDATE accounts SET password = ? WHERE id = ?", [
      hashedPassword,
      accountId,
    ]);

    await connection.commit();
    res
      .status(201)
      .json({ resident_id: residentId, email, password: passwordPlain });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// 📄 Get All Residents
export const getResidents = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.resident_id, a.id as account_id, a.email, r.full_name, r.address, r.contact, r.has_balance 
       FROM residents r 
       JOIN accounts a ON r.account_id = a.id 
       ORDER BY r.resident_id ASC`,
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 Update Resident
export const updateResident = async (req, res) => {
  const { id } = req.params; // This is resident_id
  const { full_name, email, address, contact, has_balance } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [residentRows] = await connection.query(
      "SELECT account_id FROM residents WHERE resident_id = ?",
      [id],
    );

    if (residentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Resident not found" });
    }

    const accountId = residentRows[0].account_id;

    await connection.query("UPDATE accounts SET email = ? WHERE id = ?", [
      email,
      accountId,
    ]);
    await connection.query(
      "UPDATE residents SET full_name = ?, address = ?, contact = ?, has_balance = ? WHERE resident_id = ?",
      [full_name, address, contact, has_balance ? 1 : 0, id],
    );

    await connection.commit();
    res.json({ message: "Update successful", resident_id: id });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

// 🗑️ Delete Resident (Fixed to use resident_id)
export const deleteResident = async (req, res) => {
  const { id } = req.params; // We will treat this as resident_id
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Find the account first
    const [rows] = await connection.query(
      "SELECT account_id FROM residents WHERE resident_id = ?",
      [id],
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Resident not found" });
    }

    const accountId = rows[0].account_id;

    // Delete the account (Cascades to resident profile)
    await connection.query("DELETE FROM accounts WHERE id = ?", [accountId]);

    await connection.commit();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Database error" });
  } finally {
    connection.release();
  }
};
