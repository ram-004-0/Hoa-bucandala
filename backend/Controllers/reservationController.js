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
        ar.guest_count,
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
    const { amenity_id, reservation_date, time_slot, guest_count } = req.body;
    const accountId = req.user.id;
    const MAX_POOL_CAPACITY = 20;

    const [[resident]] = await db.query(
      "SELECT resident_id FROM residents WHERE account_id = ?",
      [accountId],
    );

    if (!resident) {
      return res.status(403).json({ message: "Not a resident account" });
    }

    // SERVER-SIDE CAPACITY CHECK (Especially for Swimming Pool - Amenity ID 3)
    if (amenity_id === 3 || amenity_id === "3") {
      const [[capacityCheck]] = await db.query(
        `SELECT SUM(guest_count) as total FROM amenities_reservation 
         WHERE amenity_id = ? AND reservation_date = ? AND time_slot = ? AND status = 'Approved'`,
        [amenity_id, reservation_date, time_slot],
      );

      const currentTotal = parseInt(capacityCheck.total) || 0;
      if (currentTotal + parseInt(guest_count) > MAX_POOL_CAPACITY) {
        return res.status(400).json({
          message: `Booking failed. Only ${MAX_POOL_CAPACITY - currentTotal} spots remaining.`,
        });
      }
    }

    const [result] = await db.query(
      `INSERT INTO amenities_reservation (amenity_id, resident_id, reservation_date, time_slot, guest_count) VALUES (?, ?, ?, ?, ?)`,
      [
        amenity_id,
        resident.resident_id,
        reservation_date,
        time_slot,
        guest_count || 1,
      ],
    );

    const [[newReservation]] = await db.query(
      "SELECT status, guest_count FROM amenities_reservation WHERE reservation_id = ?",
      [result.insertId],
    );

    res.status(201).json({
      message: "Reservation created",
      reservation_id: result.insertId,
      status: newReservation?.status || "Pending",
      guest_count: newReservation?.guest_count || 1,
      reservation_date,
      time_slot,
    });
  } catch (err) {
    console.error("Create reservation error:", err);
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

    // 1. Get detailed counts for the Swimming Pool (or all amenities)
    // This SUMs up guest_counts ONLY for Approved reservations
    const [slotDetails] = await db.query(
      `SELECT time_slot, SUM(guest_count) as total_guests 
       FROM amenities_reservation 
       WHERE amenity_id = ? AND reservation_date = ? AND status = 'Approved'
       GROUP BY time_slot`,
      [id, date],
    );

    // 2. legacy check for "fully blocked" slots (for amenities like Basketball that are 1 group only)
    const [rows] = await db.query(
      "SELECT time_slot FROM amenities_reservation WHERE amenity_id = ? AND reservation_date = ? AND status != 'Rejected'",
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
      slotDetails: slotDetails, // Frontend uses this to calculate "X left"
    });
  } catch (err) {
    console.error("Availability error:", err);
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
        ar.guest_count,
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

/**
 * ============================
 * ADMIN: Update Status
 * ============================
 */
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

/**
 * ============================
 * RESIDENT/ADMIN: Delete/Cancel
 * ============================
 */
export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  const { resident_id, amenity_name, is_resident_action } = req.body;

  try {
    if (resident_id && !is_resident_action) {
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
