// authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../config/db.js";

export const login = async (req, res) => {
  const { email, password, role } = req.body;

  console.log("LOGIN ATTEMPT:", { email, role });

  const [[account]] = await db.query(
    "SELECT * FROM accounts WHERE email = ? AND role = ?",
    [email, role],
  );

  if (!account) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, account.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: account.id, role: account.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
  );

  res.json({ token, role: account.role, expiresIn: 900 });
};
