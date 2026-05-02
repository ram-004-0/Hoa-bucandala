const db = require("../config/db"); // Adjust based on your DB connection path

const getMyNotifications = async (req, res) => {
  const residentId = req.user.id; // Assuming your auth middleware sets req.user

  try {
    const [rows] = await db.execute(
      "SELECT * FROM notifications WHERE resident_id = ? ORDER BY created_at DESC",
      [residentId],
    );

    // Automatically mark unread notifications as read when the user views the inbox
    if (rows.length > 0) {
      await db.execute(
        "UPDATE notifications SET status = 'Read' WHERE resident_id = ? AND status = 'Unread'",
        [residentId],
      );
    }

    res.json(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUnreadCount = async (req, res) => {
  const residentId = req.user.id;

  try {
    const [rows] = await db.execute(
      "SELECT COUNT(*) as count FROM notifications WHERE resident_id = ? AND status = 'Unread'",
      [residentId],
    );
    res.json({ count: rows[0].count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
};
