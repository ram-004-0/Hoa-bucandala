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

/**
 * Updates a resident's profile and their linked account email.
 * Uses a transaction to ensure data integrity across tables.
 */
export const updateResident = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, address, contact, has_balance } = req.body;

  // Basic validation
  if (!email || !full_name) {
    return res
      .status(400)
      .json({ error: "Name and Email are required fields." });
  }

  const connection = await db.getConnection(); // Get a connection for the transaction

  try {
    await connection.beginTransaction();

    // 1. Find the account_id linked to this resident
    const [residentRows] = await connection.query(
      "SELECT account_id FROM residents WHERE resident_id = ?",
      [id],
    );

    if (residentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Resident not found in database" });
    }

    const accountId = residentRows[0].account_id;

    // 2. Update Email in the Accounts Table
    // We update this first because it usually has a UNIQUE constraint on email
    await connection.query("UPDATE accounts SET email = ? WHERE id = ?", [
      email,
      accountId,
    ]);

    // 3. Update the Resident's details
    await connection.query(
      "UPDATE residents SET full_name = ?, address = ?, contact = ?, has_balance = ? WHERE resident_id = ?",
      [
        full_name,
        address,
        contact,
        has_balance ? 1 : 0, // Ensure boolean maps to MySQL TINYINT
        id,
      ],
    );

    // 4. Commit the changes
    await connection.commit();

    // Return the updated data structure so the frontend can sync its state
    res.json({
      message: "Update successful",
      id: parseInt(id), // consistent with frontend expectation
      full_name,
      email,
      address,
      contact,
      has_balance: !!has_balance,
    });
  } catch (err) {
    // If any error occurs, undo all changes in this transaction
    await connection.rollback();

    console.error("Update Transaction Error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "This email is already registered to another user." });
    }

    res
      .status(500)
      .json({
        error: "Failed to update resident profile. Internal server error.",
      });
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
};

// 🗑️ Delete Resident
export const deleteResident = async (req, res) => {
  const { id } = req.params; // This should be the account_id
  try {
    // We delete from accounts so the ON DELETE CASCADE removes the profile
    const [result] = await db.query("DELETE FROM accounts WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Resident account not found" });
    }

    res
      .status(200)
      .json({ message: "Resident and profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};
