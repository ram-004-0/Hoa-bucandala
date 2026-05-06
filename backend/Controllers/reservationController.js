import db from "../config/db.js";

/**
 * ============================
 * ADMIN: Get all reservations
 * ============================
 */
export const getAllReservations = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ar.reservation_id,
        ar.resident_id,     
        ar.status,          
        r.full_name, 
        a.name AS amenity_name,
        ar.reservation_date,
        ar.time_slot
      FROM amenities_reservation ar
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
    const accountId = req.user.id;

    const [[resident]] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (!resident) {
      return res.status(403).json({ message: "Not a resident account" });
    }

    // Capture the result of the INSERT
    const [result] = await db.query(
      `INSERT INTO amenities_reservation (amenity_id, resident_id, reservation_date, time_slot) VALUES (?, ?, ?, ?)`,
      [amenity_id, resident.resident_id, reservation_date, time_slot],
    );

    // RETURN THE DATA TO FRONTEND
    res.status(201).json({
      message: "Reservation created",
      reservation_id: result.insertId, // Maps to Reference ID
      status: "Pending Approval", // Maps to Status badge
      reservation_date,
      time_slot,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "This time slot is already booked" });
    }
    res.status(500).json({ message: "Reservation failed" });
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

    const [rows] = await db.query(
      "SELECT time_slot FROM amenities_reservation WHERE amenity_id = ? AND reservation_date = ?",
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
    res.status(500).json({ message: "Error loading availability" });
  }
};
/**
 * ============================
 * RESIDENT: Get own reservations
 * ============================
 */
export const getMyReservations = async (req, res) => {
  try {
    const accountId = req.user.id;
    const [[resident]] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (!resident) {
      return res.status(403).json({ message: "Resident profile not found" });
    }

    const [rows] = await db.query(
      `
      SELECT 
        ar.reservation_id,
        ar.status,         
        a.name AS amenity_name,
        ar.reservation_date,
        ar.time_slot
      FROM amenities_reservation ar
      JOIN amenities a ON ar.amenity_id = a.amenity_id
      WHERE ar.resident_id = ?
      ORDER BY ar.reservation_date DESC
    `,
      [resident.resident_id],
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your history" });
  }
};

// PATCH /api/reservations/:id/status
export const updateReservationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, resident_id, amenity_name } = req.body;

  try {
    await db.query(
      "UPDATE amenities_reservation SET status = ? WHERE reservation_id = ?",
      [status, id],
    );

    // Notify the Resident
    const title =
      status === "Approved"
        ? "Reservation Confirmed! ✅"
        : "Reservation Update";
    const message = `Your reservation for ${amenity_name} has been ${status.toLowerCase()}.`;

    await db.query(
      "INSERT INTO notifications (resident_id, type, title, message, related_id) VALUES (?, 'Amenity', ?, ?, ?)",
      [resident_id, title, message, id],
    );

    res.status(200).json({ message: "Status updated and resident notified" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/reservations/:id
export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  const { resident_id, amenity_name } = req.body; // Passed from frontend

  try {
    // Notify BEFORE deleting so the foreign key doesn't break if related_id is used
    if (resident_id) {
      await db.query(
        "INSERT INTO notifications (resident_id, type, title, message) VALUES (?, 'Amenity', ?, ?)",
        [
          resident_id,
          "Reservation Cancelled ❌",
          `Your reservation for ${amenity_name} was cancelled by administration.`,
        ],
      );
    }

    await db.query(
      "DELETE FROM amenities_reservation WHERE reservation_id = ?",
      [id],
    );
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
