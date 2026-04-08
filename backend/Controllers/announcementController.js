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
export const createAnnouncement = async (req, res) => {
  const { category, title, content } = req.body;

  if (!category || !title || !content) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO announcements (category, title, content) VALUES (?, ?, ?)",
      [category, title, content],
    );

    res.status(201).json({
      id: result.insertId,
      category,
      title,
      content,
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
