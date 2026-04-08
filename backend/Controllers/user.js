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
