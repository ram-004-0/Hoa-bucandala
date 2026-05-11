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
  // This 'id' now refers to the account_id (12) being sent from the frontend
  const id = parseInt(req.params.id, 10);
  const { full_name, email, address, contact, has_balance } = req.body;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Check if the account exists
    const [accountRows] = await connection.query(
      "SELECT id FROM accounts WHERE id = ?",
      [id],
    );

    if (accountRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Account not found" });
    }

    // 2. Update the Email in the Accounts table
    await connection.query("UPDATE accounts SET email = ? WHERE id = ?", [
      email,
      id,
    ]);

    // 3. Update the Residents table using account_id as the key
    const [residentUpdate] = await connection.query(
      "UPDATE residents SET full_name = ?, address = ?, contact = ?, has_balance = ? WHERE account_id = ?",
      [
        full_name,
        address,
        contact,
        has_balance ? 1 : 0,
        id, // Using account_id here matches your 12
      ],
    );

    if (residentUpdate.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ error: "Resident profile not found for this account" });
    }

    await connection.commit();

    res.json({
      message: "Update successful",
      account_id: id,
      full_name,
      email,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Update Error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "This email is already taken" });
    }
    res.status(500).json({ error: "Internal server error" });
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
