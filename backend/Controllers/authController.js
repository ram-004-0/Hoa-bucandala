import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // FIXED: Join residents table on r.account_id = a.id
    // because your schema uses 'id' for the accounts table primary key.
    const [accounts] = await db.query(
      `SELECT a.*, r.resident_id, r.full_name 
       FROM accounts a 
       LEFT JOIN residents r ON r.account_id = a.id 
       WHERE a.email = ? AND a.role = ?`,
      [email, role],
    );

    const account = accounts[0];

    if (!account) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate Token
    // Note: Use account.id (to match your schema) and resident_id from the join
    const token = jwt.sign(
      {
        id: account.id,
        role: account.role,
        residentId: account.resident_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    // 4. Send Response
    res.json({
      token,
      role: account.role,
      user: {
        name: account.full_name || "User",
        email: account.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update Profile Logic
 */
export const updateProfile = async (req, res) => {
  const { currentPassword, newPassword, contactNumber } = req.body;
  const accountId = req.user.id;

  try {
    // 1. Get current account
    const [[account]] = await db.query(
      "SELECT password FROM accounts WHERE id = ?",
      [accountId],
    );

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // 2. Handle Password Change
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, account.password);

      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "The current password you entered is incorrect." });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE accounts SET password = ? WHERE id = ?", [
        hashedNewPassword,
        accountId,
      ]);
    }

    // 3. Handle Contact Number update
    // Note: Your schema column is 'contact', not 'contact_number'
    if (contactNumber) {
      await db.query("UPDATE residents SET contact = ? WHERE account_id = ?", [
        contactNumber,
        accountId,
      ]);
    }

    return res.status(200).json({ message: "Profile updated successfully!" });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res
      .status(500)
      .json({ message: "An error occurred while updating your profile." });
  }
};

/**
 * Get Current User Profile
 */
export const getMe = async (req, res) => {
  try {
    const accountId = req.user.id;

    // Join with residents to get the full name
    const [rows] = await db.query(
      `SELECT a.email, a.role, r.full_name, r.contact 
       FROM accounts a 
       LEFT JOIN residents r ON r.account_id = a.id 
       WHERE a.id = ?`,
      [accountId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Get Me Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
