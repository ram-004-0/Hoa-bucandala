// Controllers/User.js
import db from "../config/db.js";

export const getUser = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, email FROM users");

    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  try {
    await db.query("UPDATE users SET username = ?, email = ? WHERE id = ?", [
      username,
      email,
      id,
    ]);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const createGuard = async (req, res) => {
  const { full_name, email, contact, address } = req.body;

  try {
    // 1. Get the current number of guards to determine the next ID (e.g., guard1, guard2)
    const [countResult] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'GUARD'",
    );

    const nextNumber = countResult[0].count + 1;
    const plainPassword = `guard${nextNumber}`;

    // 2. Hash the generated password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Insert the new guard into the users table
    // Adjust column names (e.g., username, full_name) to match your SQL schema
    const [result] = await db.query(
      "INSERT INTO users (username, email, password, role, contact, address) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, "GUARD", contact, address],
    );

    res.status(201).json({
      message: "Guard account created successfully",
      id: result.insertId,
      password: plainPassword, // Return this so the admin can give it to the guard
    });
  } catch (error) {
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Database error during guard creation" });
  }
};
