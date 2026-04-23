import db from "../config/db.js";

// GET all announcements
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

// CREATE announcement
// CREATE announcement
export const createAnnouncement = async (req, res) => {
  const { category, title, content } = req.body;

  // Get the admin ID from the authenticated user token
  const adminId = req.user.id;
  // Check if req.user exists (if middleware failed or was missed)
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

// DELETE announcement by ID
export const deleteAnnouncement = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM announcements WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete announcement" });
  }
};
