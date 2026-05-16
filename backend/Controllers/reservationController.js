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
        ar.cancel_reason,
        r.full_name, 
        a.name AS amenity_name,
        DATE_FORMAT(ar.reservation_date, '%Y-%m-%d') AS reservation_date,
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

    /**
     * 1. CAPACITY CHECK (Amenity ID 3 - Swimming Pool)
     * Changed: Only count guests from already APPROVED reservations
     */
    if (parseInt(amenity_id) === 3) {
      const [[capacityCheck]] = await db.query(
        `SELECT SUM(guest_count) as total FROM amenities_reservation 
         WHERE amenity_id = ? AND reservation_date = ? AND time_slot = ? 
         AND status = 'Approved'`,
        [amenity_id, reservation_date, time_slot],
      );

      const currentTotal = parseInt(capacityCheck.total) || 0;
      if (currentTotal + parseInt(guest_count) > MAX_POOL_CAPACITY) {
        return res.status(400).json({
          message: `Booking failed. Only ${MAX_POOL_CAPACITY - currentTotal} spots remaining.`,
        });
      }
    } else {
      /**
       * 2. DUPLICATE CHECK (For single-booking amenities like Basketball Court)
       * Changed: A slot is only considered un-bookable if there is an APPROVED booking
       */
      const [[existingBooking]] = await db.query(
        `SELECT reservation_id FROM amenities_reservation 
         WHERE amenity_id = ? AND reservation_date = ? AND time_slot = ? 
         AND status = 'Approved'`,
        [amenity_id, reservation_date, time_slot],
      );

      if (existingBooking) {
        return res
          .status(409)
          .json({ message: "This time slot is already booked and approved" });
      }
    }

    // 3. INSERT THE NEW RESERVATION
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
    const { id } = req.params;
    const { date } = req.query;
    const MAX_POOL_CAPACITY = 20;

    // 1. Get capacity totals grouping by slots
    // Changed: Only look up counts for 'Approved' reservations
    const [slotDetails] = await db.query(
      `SELECT time_slot, SUM(guest_count) as total_guests 
       FROM amenities_reservation 
       WHERE amenity_id = ? AND reservation_date = ? AND status = 'Approved'
       GROUP BY time_slot`,
      [id, date],
    );

    const allSlots = [
      "08:00-12:00",
      "12:00-16:00",
      "16:00-20:00",
      "20:00-24:00",
    ];

    let availableSlots = [];

    if (parseInt(id) === 3) {
      // Dynamic availability rule for shared pool space
      availableSlots = allSlots.filter((slot) => {
        const matchingDetail = slotDetails.find((d) => d.time_slot === slot);
        const filledGuests = matchingDetail
          ? parseInt(matchingDetail.total_guests)
          : 0;
        return filledGuests < MAX_POOL_CAPACITY;
      });
    } else {
      const bookedSlots = slotDetails.map((s) => s.time_slot);
      availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    }

    res.json({
      availableSlots: availableSlots,
      slotDetails: slotDetails,
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
        ar.cancel_reason,
        a.name AS amenity_name,
        DATE_FORMAT(ar.reservation_date, '%Y-%m-%d') AS reservation_date,
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
 * CANCEL RESERVATION (Admin/Res)
 * ============================
 */
export const deleteReservation = async (req, res) => {
  const { id } = req.params;
  const { resident_id, amenity_name, is_resident_action, cancel_reason } =
    req.body;

  try {
    if (resident_id && !is_resident_action) {
      const adminMessage = cancel_reason
        ? `Your reservation for ${amenity_name} was cancelled by administration. Reason: ${cancel_reason}`
        : `Your reservation for ${amenity_name} was cancelled by administration.`;

      await db.query(
        "INSERT INTO notifications (resident_id, type, title, message) VALUES (?, 'Amenity', ?, ?)",
        [resident_id, "Reservation Cancelled ❌", adminMessage],
      );
    }

    if (is_resident_action) {
      const [[resData]] = await db.query(
        "SELECT full_name FROM residents WHERE resident_id = (SELECT resident_id FROM amenities_reservation WHERE reservation_id = ?)",
        [id],
      );

      const residentName = resData?.full_name || "A resident";

      await db.query(
        "INSERT INTO notifications (resident_id, type, title, message, related_id) VALUES (NULL, 'Admin', ?, ?, ?)",
        [
          "New Cancellation ⚠️",
          `${residentName} cancelled ${amenity_name || "their booking"}. Reason: ${cancel_reason || "No reason provided"}`,
          id,
        ],
      );
    }

    await db.query(
      "UPDATE amenities_reservation SET status = 'Cancelled', cancel_reason = ? WHERE reservation_id = ?",
      [cancel_reason || "No reason provided", id],
    );

    res
      .status(200)
      .json({ message: "Reservation marked as cancelled and slot freed." });
  } catch (error) {
    console.error("Cancellation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ============================================
 * FULLY RESERVED DATES (For Calendar Highlights)
 * ============================================
 */
export const getFullyReservedDates = async (req, res) => {
  try {
    const { id } = req.params;
    const MAX_POOL_CAPACITY = 20;

    if (parseInt(id) === 3) {
      // Changed: Calendar only blacks out dates where all slots hit maximum capacity with APPROVED bookings
      const [rows] = await db.query(
        `SELECT DATE_FORMAT(reservation_date, '%Y-%m-%d') AS full_date
         FROM (
           SELECT reservation_date, time_slot, SUM(guest_count) AS total_guests
           FROM amenities_reservation
           WHERE amenity_id = ? AND status = 'Approved'
           GROUP BY reservation_date, time_slot
           HAVING total_guests >= ?
         ) AS full_slots
         GROUP BY reservation_date
         HAVING COUNT(time_slot) >= 4`,
        [id, MAX_POOL_CAPACITY],
      );
      return res.json(rows.map((r) => r.full_date));
    } else {
      // Changed: Calendar only highlights dates where all 4 slots are explicitly status = 'Approved'
      const [rows] = await db.query(
        `SELECT DATE_FORMAT(reservation_date, '%Y-%m-%d') AS full_date
         FROM amenities_reservation
         WHERE amenity_id = ? AND status = 'Approved'
         GROUP BY reservation_date
         HAVING COUNT(DISTINCT time_slot) >= 4`,
        [id],
      );
      return res.json(rows.map((r) => r.full_date));
    }
  } catch (err) {
    console.error("Error fetching fully reserved dates:", err);
    res.status(500).json({ message: "Failed to fetch fully reserved dates" });
  }
};
