import pool from "../config/db.js";

// 1. GET ALL MY NOTIFICATIONS
export const getMyNotifications = async (req, res) => {
  const accountId = req.user.id;
  try {
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

// 2. GET UNREAD COUNT
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

// 3. MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  const accountId = req.user.id;
  try {
    await pool.query(
      `UPDATE notifications n
       JOIN residents r ON n.resident_id = r.resident_id
       SET n.status = 'Read'
       WHERE r.account_id = ? AND n.status = 'Unread'`,
      [accountId],
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error updating notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. CLEAR ALL (DELETE)
export const clearAllNotifications = async (req, res) => {
  const accountId = req.user.id;
  try {
    // Using a JOIN in a DELETE statement to ensure we only delete notifications
    // belonging to the resident associated with this account_id.
    await pool.query(
      `DELETE n FROM notifications n
       JOIN residents r ON n.resident_id = r.resident_id
       WHERE r.account_id = ?`,
      [accountId],
    );
    res.status(200).json({ message: "Notifications cleared successfully" });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
