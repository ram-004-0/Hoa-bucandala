import bcrypt from "bcryptjs";
import db from "../config/db.js";

// Fetch ALL accounts with their associated names from profile tables
export const getUser = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.id, 
        a.email, 
        a.role, 
        COALESCE(r.full_name, g.username, ad.username) AS name,
        r.has_balance,
        r.address,
        r.contact
      FROM accounts a
      LEFT JOIN residents r ON a.id = r.account_id
      LEFT JOIN guard g ON a.id = g.account_id
      LEFT JOIN admin ad ON a.id = ad.account_id
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  try {
    await db.query("UPDATE accounts SET email = ? WHERE id = ?", [email, id]);
    res.status(200).json({ message: "Account updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

// Your new fetchGuard function
export const fetchGuard = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT a.id, a.email, g.username FROM accounts a JOIN guard g ON a.id = g.account_id WHERE a.id = ?",
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Guard not found" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const createGuard = async (req, res) => {
  const { full_name, email, contact, address } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [countResult] = await connection.query(
      "SELECT COUNT(*) as count FROM accounts WHERE role = 'GUARD'",
    );
    const nextNumber = countResult[0].count + 1;
    const plainPassword = `guard${nextNumber}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const [accountResult] = await connection.query(
      "INSERT INTO accounts (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "GUARD"],
    );
    const accountId = accountResult.insertId;

    await connection.query(
      "INSERT INTO guard (account_id, username) VALUES (?, ?)",
      [accountId, full_name],
    );

    await connection.commit();
    res.status(201).json({
      message: "Guard account created successfully",
      password: plainPassword,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Database error", error: error.message });
  } finally {
    connection.release();
  }
};
