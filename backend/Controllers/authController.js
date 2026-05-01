import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Unified Query
    // Changes: 'guards' changed to 'guard' to match your schema
    const [accounts] = await db.query(
      `SELECT a.*, 
              r.full_name AS resident_name, 
              r.resident_id,
              g.username AS guard_name,
              ad.username AS admin_name
       FROM accounts a 
       LEFT JOIN residents r ON r.account_id = a.id 
       LEFT JOIN guard g ON g.account_id = a.id
       LEFT JOIN admin ad ON ad.account_id = a.id
       WHERE a.email = ?`,
      [email],
    );

    const account = accounts[0];

    // 2. Check if account exists
    if (!account) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate Token
    // IMPORTANT: Ensure JWT_SECRET is set in Railway Variables
    const token = jwt.sign(
      {
        id: account.id,
        role: account.role,
        residentId: account.resident_id || null,
      },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" },
    );

    // 5. Select Name
    let displayName = "User";
    if (account.role === "RESIDENT") displayName = account.resident_name;
    else if (account.role === "GUARD") displayName = account.guard_name;
    else if (account.role === "ADMIN") displayName = account.admin_name;

    // 6. Final Response
    res.json({
      token,
      role: account.role,
      expiresIn: 3600,
      user: {
        name: displayName || "User",
        email: account.email,
      },
    });
  } catch (err) {
    // If it still fails, this will tell you EXACTLY why in the response
    console.error("Login Error:", err);
    res.status(500).json({
      message: "Internal server error",
      error: err.sqlMessage || err.message,
    });
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
    // req.user is populated by your authenticate middleware
    const accountId = req.user.id;

    // Fetch the detailed info based on the role
    const [rows] = await db.query(
      `SELECT a.email, a.role, r.full_name, g.username AS guard_name, ad.username AS admin_name
       FROM accounts a
       LEFT JOIN residents r ON r.account_id = a.id
       LEFT JOIN guard g ON g.account_id = a.id
       LEFT JOIN admin ad ON ad.account_id = a.id
       WHERE a.id = ?`,
      [accountId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];

    // Flatten the response so the frontend finds "name" easily
    res.json({
      id: accountId,
      email: user.email,
      role: user.role,
      name: user.full_name || user.guard_name || user.admin_name || "User",
    });
  } catch (err) {
    console.error("getMe error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};
