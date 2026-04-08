import db from "../config/db.js";

/**
 * ============================
 * ADMIN: Get all reservations
 * ============================
 */
export const getAllReservations = async (req, res) => {
  try {
    // Change resident_name to full_name to match the React component
    const [rows] = await db.query(`
  SELECT 
    ar.reservation_id,
    r.full_name, 
    a.name AS amenity_name,
    ar.reservation_date,
    ar.time_slot
  FROM amenity_reservations ar
  JOIN residents r ON ar.resident_id = r.resident_id
  JOIN amenities a ON ar.amenity_id = a.amenity_id
  ORDER BY ar.reservation_date DESC
`);

    res.json(rows);
  } catch (err) {
    console.error("Get reservations error:", err);
    res.status(500).json({ message: "Failed to fetch reservations" });
  }
};

/**
 * ============================
 * RESIDENT: Create reservation
 * ============================
 */
export const createReservation = async (req, res) => {
  try {
    const { amenity_id, reservation_date, time_slot } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!amenity_id || !reservation_date || !time_slot) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const accountId = req.user.id;

    // Get resident linked to this account
    const [[resident]] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (!resident) {
      return res.status(403).json({ message: "Not a resident account" });
    }

    // Insert reservation
    await db.query(
      `
      INSERT INTO amenity_reservations
        (amenity_id, resident_id, reservation_date, time_slot)
      VALUES (?, ?, ?, ?)
      `,
      [amenity_id, resident.resident_id, reservation_date, time_slot],
    );

    res.status(201).json({ message: "Reservation created" });
  } catch (err) {
    console.error("Create reservation error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    res.status(500).json({ message: "Reservation failed" });
  }
};

/**
 * ============================
 * ADMIN: Delete reservation
 * ============================
 */
export const deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM amenity_reservations WHERE reservation_id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.json({ message: "Reservation deleted" });
  } catch (err) {
    console.error("Delete reservation error:", err);
    res.status(500).json({ message: "Failed to delete reservation" });
  }
};

/**
 * ============================
 * AVAILABILITY (Resident/Admin)
 * ============================
 */
export const getAvailability = async (req, res) => {
  try {
    const { id } = req.params; // amenity_id
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const [rows] = await db.query(
      `
      SELECT time_slot
      FROM amenity_reservations
      WHERE amenity_id = ? AND reservation_date = ?
      `,
      [id, date],
    );

    const bookedSlots = rows.map((r) => r.time_slot);

    const allSlots = [
      "08:00-12:00",
      "12:00-16:00",
      "16:00-20:00",
      "20:00-24:00",
    ];

    res.json({
      availableSlots: allSlots.filter((slot) => !bookedSlots.includes(slot)),
    });
  } catch (err) {
    console.error("Availability error:", err);
    res.status(500).json({ message: "Failed to load availability" });
  }
};
