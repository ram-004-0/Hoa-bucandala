import db from "../config/db.js";

/**
 * 🏠 RESIDENT: Check slot availability
 */
export const getPickupAvailability = async (req, res) => {
  try {
    const { date, type } = req.query;
    if (!date || !type) {
      return res.status(400).json({ message: "Date and type required" });
    }

    // Check if a schedule exists and join with pickups to see if it's already taken
    const [rows] = await db.query(
      `SELECT ws.schedule_id, ws.time_slot, 
              IF(wp.schedule_id IS NULL, 0, 1) AS booked
       FROM waste_schedule ws
       LEFT JOIN waste_pickups wp ON ws.schedule_id = wp.schedule_id
       WHERE ws.pickup_date = ? AND ws.type = ?
       ORDER BY ws.time_slot ASC`,
      [date, type],
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load slots" });
  }
};

/**
 * 🏠 RESIDENT: View history of recent pickups
 */
export const getMyPickups = async (req, res) => {
  try {
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (resident.length === 0) {
      return res.status(404).json({ message: "Resident profile not found" });
    }

    const residentId = resident[0].resident_id;

    const [rows] = await db.query(
      `SELECT 
        wp.pickup_id, 
        wp.status, 
        wp.notes, 
        ws.type, 
        ws.pickup_date, 
        ws.time_slot
      FROM waste_pickups wp
      JOIN waste_schedule ws ON wp.schedule_id = ws.schedule_id
      WHERE wp.resident_id = ?
      ORDER BY ws.pickup_date DESC`,
      [residentId],
    );

    res.json(rows);
  } catch (err) {
    console.error("Error in getMyPickups:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * 🏠 RESIDENT: Book waste pickup
 */
export const createPickup = async (req, res) => {
  try {
    const { schedule_id, notes, date, type, time_slot } = req.body;
    const accountId = req.user.id;

    const [[resident]] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );
    if (!resident) return res.status(403).json({ message: "Not a resident" });

    let finalScheduleId = schedule_id;

    // ON-DEMAND: Create schedule entry if it doesn't exist
    if (!finalScheduleId) {
      const [newSchedule] = await db.query(
        "INSERT INTO waste_schedule (type, pickup_date, time_slot) VALUES (?, ?, ?)",
        [type, date, time_slot],
      );
      finalScheduleId = newSchedule.insertId;
    }

    // Create the booking - Status must be 'PENDING' (All caps for ENUM)
    await db.query(
      "INSERT INTO waste_pickups (resident_id, schedule_id, notes, status) VALUES (?, ?, ?, 'PENDING')",
      [resident.resident_id, finalScheduleId, notes],
    );

    res.status(201).json({ message: "Pickup booked successfully" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "This slot is already booked." });
    }
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
};

/**
 * 🛡️ ADMIN: View all Booked Pickups (With Resident Info)
 */
export const getAllPickups = async (req, res) => {
  const query = `
    SELECT 
      wp.pickup_id, 
      wp.status, 
      wp.notes, 
      ws.type, 
      ws.pickup_date, 
      ws.time_slot, 
      r.full_name, 
      r.address
    FROM waste_pickups wp
    JOIN waste_schedule ws ON wp.schedule_id = ws.schedule_id
    JOIN residents r ON wp.resident_id = r.resident_id
    ORDER BY ws.pickup_date DESC, ws.time_slot ASC`;

  try {
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res
      .status(500)
      .json({ message: "Error fetching pickups", error: err.message });
  }
};
/**
 * 🛡️ ADMIN: Add Schedule Manually
 */
export const addSchedule = async (req, res) => {
  try {
    const { type, pickup_date, time_slot } = req.body;

    // Validation
    if (!type || !pickup_date || !time_slot) {
      return res
        .status(400)
        .json({ message: "Type, date, and time slot are required" });
    }

    const [result] = await db.query(
      "INSERT INTO waste_schedule (type, pickup_date, time_slot) VALUES (?, ?, ?)",
      [type, pickup_date, time_slot],
    );

    res.status(201).json({
      schedule_id: result.insertId,
      type,
      pickup_date,
      time_slot,
      message: "Schedule added successfully",
    });
  } catch (err) {
    console.error("Add Schedule Error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "This schedule slot already exists." });
    }
    res.status(500).json({ message: "Failed to add schedule" });
  }
};
/**
 * 🛡️ ADMIN: Mark a pickup as COMPLETED or PENDING
 */
export const updatePickupStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'COMPLETED' or 'PENDING'

    // Validation for ENUM safety
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const [result] = await db.query(
      "UPDATE waste_pickups SET status = ? WHERE pickup_id = ?",
      [status, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    res.json({ message: `Status updated to ${status}`, status });
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ message: "Failed to update status" });
  }
};

/**
 * 🏠 RESIDENT: Cancel Pickup
 */
export const cancelPickup = async (req, res) => {
  const { id } = req.params;

  try {
    const [resident] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [req.user.id],
    );

    if (resident.length === 0)
      return res.status(404).json({ message: "Profile not found" });

    // Delete only if it belongs to the logged-in resident
    const [result] = await db.query(
      "DELETE FROM waste_pickups WHERE pickup_id = ? AND resident_id = ?",
      [id, resident[0].resident_id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized or pickup not found" });
    }

    res.json({ message: "Pickup cancelled successfully" });
  } catch (err) {
    console.error("Cancel Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🛡️ ADMIN: Management methods
 */
export const getAdminSchedules = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM waste_schedule ORDER BY pickup_date DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const [booked] = await db.query(
      "SELECT * FROM waste_pickups WHERE schedule_id = ?",
      [id],
    );

    if (booked.length > 0) {
      return res
        .status(400)
        .json({ message: "Cannot delete: Slot has active bookings." });
    }

    await db.query("DELETE FROM waste_schedule WHERE schedule_id = ?", [id]);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
