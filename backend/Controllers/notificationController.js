import pool from "../config/db.js";

export const getMyNotifications = async (req, res) => {
  const accountId = req.user.id; // Or resident_id depending on your auth logic

  try {
    // Note: Adjust the query to join with residents if you are filtering by account_id
    const [rows] = await pool.query(
      `SELECT n.* FROM notifications n
       JOIN residents r ON n.resident_id = r.resident_id
       WHERE r.account_id = ? 
       ORDER BY n.created_at DESC`,
      [accountId],
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnreadCount = async (req, res) => {
  const accountId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM notifications n
       JOIN residents r ON n.resident_id = r.resident_id
       WHERE r.account_id = ? AND n.status = 'Unread'`,
      [accountId],
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
