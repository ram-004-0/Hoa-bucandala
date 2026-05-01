import db from "../config/db.js";

export const getAllAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM announcements ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
};

export const createAnnouncement = async (req, res) => {
  const { category, title, content } = req.body;
  const accountId = req.user.id; // From JWT

  if (!category || !title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // We need the admin_id from the 'admin' table, not the account_id
    const [[admin]] = await db.query(
      "SELECT admin_id FROM admin WHERE account_id = ?",
      [accountId],
    );

    if (!admin) {
      return res
        .status(403)
        .json({ message: "Only admins can post announcements" });
    }

    const [result] = await db.query(
      "INSERT INTO announcements (category, title, content, admin_id) VALUES (?, ?, ?, ?)",
      [category, title, content, admin.admin_id],
    );

    res.status(201).json({
      id: result.insertId,
      category,
      title,
      content,
      adminId: admin.admin_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};

export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    // SCHEMA FIX: Primary key is 'announcement_id'
    const [result] = await db.query(
      "DELETE FROM announcements WHERE announcement_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};

export const createAnnouncement = async (req, res) => {
  const { category, title, content } = req.body;

  const adminId = req.user.id;
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: No user found" });
  }
  if (!category || !title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // UPDATED QUERY: Added admin_id
    const [result] = await db.query(
      "INSERT INTO announcements (category, title, content, admin_id) VALUES (?, ?, ?, ?)",
      [category, title, content, adminId],
    );

    res.status(201).json({
      id: result.insertId,
      category,
      title,
      content,
      adminId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create announcement" });
  }
};
