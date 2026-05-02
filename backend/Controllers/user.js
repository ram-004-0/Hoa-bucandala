// Controllers/User.js
import db from "../config/db.js";

export const getUser = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, email, role FROM accounts");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body; // Adjusted to match your accounts table columns

  try {
    await db.query("UPDATE accounts SET email = ? WHERE id = ?", [email, id]);
    res.status(200).json({ message: "Account updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database error" });
  }
};

export const createGuard = async (req, res) => {
  const { full_name, email, contact, address } = req.body;

  // Use a connection from the pool to handle transactions
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Determine the next guard number for the password
    const [countResult] = await connection.query(
      "SELECT COUNT(*) as count FROM accounts WHERE role = 'GUARD'",
    );
    const nextNumber = countResult[0].count + 1;
    const plainPassword = `guard${nextNumber}`;

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // 3. Insert into ACCOUNTS table
    const [accountResult] = await connection.query(
      "INSERT INTO accounts (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, "GUARD"],
    );
    const newAccountId = accountResult.insertId;

    // 4. Insert into GUARD table (using full_name as username)
    await connection.query(
      "INSERT INTO guard (account_id, username) VALUES (?, ?)",
      [newAccountId, full_name],
    );

    await connection.commit();

    res.status(201).json({
      message: "Guard account created successfully",
      id: newAccountId,
      password: plainPassword,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ message: "Email or Username already exists" });
    }
    res.status(500).json({ message: "Database error during guard creation" });
  } finally {
    connection.release();
  }
};
