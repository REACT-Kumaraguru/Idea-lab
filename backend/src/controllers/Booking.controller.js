import EquipmentBooking from "../models/EquipmentBooking.model.js";
import Equipment from "../models/EquipmentModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import { sequelize } from "../lib/db.js";
import { sendBookingStatusEmail, sendBookingBatchStatusEmail } from "../lib/email.js";

/**
 * Checks whether an email belongs to the KCT institution.
 * Handles @kct.ac.in and institutional subdomains.
 */
export const isKctEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  return clean.endsWith("@kct.ac.in") || clean.endsWith(".kct.ac.in");
};

/**
 * Converts a "HH:MM" string to minutes from midnight.
 */
export const timeToMinutes = (t) => {
  const s = String(t || "");
  const [h, m] = s.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Robust slot capacity checker for equipment with quantity >= 1.
 * An interval [targetStart, targetEnd) is available iff at every critical time point
 * t in [targetStart, targetEnd), concurrent active bookings < equipment.quantity.
 */
export const checkSlotCapacity = async ({
  equipmentId,
  bookingDate,
  startTime,
  durationHours,
  excludeBookingId = null,
  statuses = ["pending", "approved"],
  transaction = null,
}) => {
  const equipment = await Equipment.findByPk(equipmentId, { transaction });
  if (!equipment) {
    return { available: false, message: "Equipment not found" };
  }

  if (!equipment.isAvailable) {
    return {
      available: false,
      message: "This equipment is currently unbookable. Only 3D printers and PCB Milling Machine are currently available for booking.",
    };
  }

  const maxQuantity = Math.max(1, parseInt(equipment.quantity, 10) || 1);
  const targetStartMin = timeToMinutes(startTime);
  const targetEndMin = targetStartMin + Math.round(parseFloat(durationHours) * 60);

  const whereClause = {
    equipmentId,
    bookingDate,
    status: { [Op.in]: statuses },
  };

  if (excludeBookingId) {
    whereClause.id = { [Op.ne]: excludeBookingId };
  }

  const existingBookings = await EquipmentBooking.findAll({
    where: whereClause,
    attributes: ["id", "bookingTime", "duration", "status"],
    transaction,
  });

  const activeIntervals = [];
  const timePoints = new Set([targetStartMin]);

  for (const b of existingBookings) {
    const bStart = timeToMinutes(b.bookingTime);
    const bDuration = parseFloat(b.duration) || 1;
    const bEnd = bStart + Math.round(bDuration * 60);

    if (targetStartMin < bEnd && targetEndMin > bStart) {
      activeIntervals.push({ id: b.id, start: bStart, end: bEnd });
      if (bStart >= targetStartMin && bStart < targetEndMin) {
        timePoints.add(bStart);
      }
    }
  }

  for (const t of timePoints) {
    let concurrentCount = 0;
    for (const interval of activeIntervals) {
      if (interval.start <= t && interval.end > t) {
        concurrentCount++;
      }
    }

    if (concurrentCount >= maxQuantity) {
      const conflictHour = Math.floor(t / 60).toString().padStart(2, "0");
      const conflictMin = (t % 60).toString().padStart(2, "0");
      return {
        available: false,
        maxQuantity,
        concurrentCount,
        conflictTime: `${conflictHour}:${conflictMin}`,
        message: `All ${maxQuantity} unit(s) of this equipment are already booked for time window around ${conflictHour}:${conflictMin}. Max capacity reached.`,
      };
    }
  }

  return {
    available: true,
    maxQuantity,
    equipment,
  };
};


// @desc    Get all bookings (Admin) - excludes draft (cart-only) bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, equipmentId } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    } else {
      whereClause.status = { [Op.in]: ["pending", "approved", "rejected", "completed", "cancelled"] };
    }
    if (equipmentId) {
      whereClause.equipmentId = equipmentId;
    }

    const bookings = await EquipmentBooking.findAll({
      where: whereClause,
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour", "kctPricePerHour"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
      // FIX: Use the actual database column name 'created_at' instead of 'createdAt'
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Create a new equipment booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const {
      equipmentId,
      bookingDate,
      bookingTime,
      duration,
      purposeOfUsage,
      benefitsForKCT,
      benefitsReason,
      notes,
      consumablesRequested,
      consumablesPurpose,
    } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!equipmentId || !bookingDate || !bookingTime || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate new fields
    if (!purposeOfUsage || purposeOfUsage.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide purpose of usage",
      });
    }

    if (!benefitsForKCT || !["yes", "no"].includes(benefitsForKCT)) {
      return res.status(400).json({
        success: false,
        message: "Please specify if this benefits KCT",
      });
    }

    if (!benefitsReason || benefitsReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please provide reason for benefits selection",
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: "Equipment not found",
      });
    }

    // Check if equipment is available
    if (!equipment.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Equipment is not available",
      });
    }

    // Parse duration (hours, decimal allowed)
    const durationHours = parseFloat(duration);
    if (isNaN(durationHours) || durationHours < 0.5 || durationHours > 12) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 0.5 and 12 hours",
      });
    }

    // Check if the date is not in the past
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book for past dates",
      });
    }

    // If booking is for today, ensure start time is not in the past
    const isToday = selectedDate.getTime() === today.getTime();
    if (isToday) {
      const [h, m] = String(bookingTime).split(":").map(Number);
      const startMinutes = (h || 0) * 60 + (m || 0);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (startMinutes < currentMinutes) {
        return res.status(400).json({
          success: false,
          message: "Cannot book a start time in the past",
        });
      }
    }

    let createdBooking;
    await sequelize.transaction(async (t) => {
      // 1. Verify equipment existence & bookability
      const equipment = await Equipment.findByPk(equipmentId, { transaction: t });
      if (!equipment) {
        throw new Error("Equipment not found");
      }
      if (!equipment.isAvailable) {
        throw new Error("This equipment is currently unbookable. Only 3D printers and PCB Milling Machine are currently available for booking.");
      }

      // 2. Strict concurrency & multi-unit capacity check against equipment.quantity
      const capacityCheck = await checkSlotCapacity({
        equipmentId,
        bookingDate,
        startTime: bookingTime,
        durationHours,
        transaction: t,
      });

      if (!capacityCheck.available) {
        throw new Error(capacityCheck.message);
      }

      const userEmail = String(req.user?.email || "").trim().toLowerCase();
      const isKct = isKctEmail(userEmail);

      const pricePerHour = isKct
        ? (parseFloat(equipment.kctPricePerHour) || 0)
        : (parseFloat(equipment.pricePerHour) || 0);

      const totalAmount = Math.round(durationHours * pricePerHour * 100) / 100;

      // Format consumables payload safely
      const formattedConsumables = consumablesRequested
        ? (typeof consumablesRequested === "object" ? JSON.stringify(consumablesRequested) : String(consumablesRequested))
        : null;

      // Create booking as draft (only sent to admin when student confirms "Book Now" in cart)
      const booking = await EquipmentBooking.create(
        {
          equipmentId,
          userId,
          bookingDate,
          bookingTime,
          duration: durationHours,
          totalAmount,
          purposeOfUsage,
          benefitsForKCT,
          benefitsReason,
          notes,
          consumablesRequested: formattedConsumables,
          consumablesPurpose: consumablesPurpose ? String(consumablesPurpose).trim() : null,
          status: "draft",
        },
        { transaction: t }
      );

      // Fetch the created booking with associations
      createdBooking = await EquipmentBooking.findByPk(booking.id, {
        include: [
          {
            model: Equipment,
            as: "equipment",
            attributes: [
              "id",
              "equipmentName",
              "brandName",
              "image",
              "quantity",
              "isAvailable",
              "pricePerHour",
              "kctPricePerHour",
            ],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "fullName", "email"],
          },
        ],
        transaction: t,
      });
    });

    res.status(201).json({
      success: true,
      message: "Equipment scheduled and added to cart successfully",
      data: createdBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    const isClientError =
      error.message.includes("not found") ||
      error.message.includes("unbookable") ||
      error.message.includes("already booked") ||
      error.message.includes("capacity reached");

    res.status(isClientError ? 400 : 500).json({
      success: false,
      message: error.message || "Error creating booking",
      error: error.message,
    });
  }
};

// @desc    Get all bookings for a specific equipment (pending & approved for slot availability tracking)
// @route   GET /api/bookings/equipment/:equipmentId
// @access  Public
export const getEquipmentBookings = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const { date } = req.query;

    const whereClause = {
      equipmentId,
      status: { [Op.in]: ["pending", "approved"] },
    };
    if (date) {
      whereClause.bookingDate = date;
    }

    const equipment = await Equipment.findByPk(equipmentId, {
      attributes: ["id", "equipmentName", "brandName", "quantity", "isAvailable", "image"],
    });

    const bookings = await EquipmentBooking.findAll({
      where: whereClause,
      attributes: ["id", "bookingDate", "bookingTime", "duration", "status"],
      order: [["bookingDate", "ASC"], ["bookingTime", "ASC"]],
    });

    res.status(200).json({
      success: true,
      equipment,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching equipment bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get all bookings for the logged-in user
// @route   GET /api/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await EquipmentBooking.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour", "kctPricePerHour", "equipmentDetails", "quantity"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
      // FIX: Use the actual database column name
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await EquipmentBooking.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour", "kctPricePerHour"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isAdmin = req.user?.role === "admin" || req.session?.user?.role === "admin";
    if (Number(booking.userId) !== Number(req.user?.id) && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission to view this booking.",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "approved", "rejected", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const booking = await EquipmentBooking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (status === "approved") {
      const capacityCheck = await checkSlotCapacity({
        equipmentId: booking.equipmentId,
        bookingDate: booking.bookingDate,
        startTime: booking.bookingTime,
        durationHours: booking.duration,
        excludeBookingId: booking.id,
        statuses: ["approved"], // Capacity check against already approved bookings
      });

      if (!capacityCheck.available) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve booking: all ${capacityCheck.maxQuantity} unit(s) are already occupied by approved bookings for this time window.`,
        });
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await EquipmentBooking.findByPk(id, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if ((status === "approved" || status === "rejected") && updatedBooking.user?.email) {
      try {
        await sendBookingStatusEmail(
          updatedBooking.user.email,
          updatedBooking.user.fullName,
          updatedBooking.equipment?.equipmentName,
          updatedBooking.bookingDate,
          updatedBooking.bookingTime,
          status
        );
      } catch (emailErr) {
        console.error("Error sending booking status email:", emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking status",
      error: error.message,
    });
  }
};

// @desc    Update status for a whole cart submission (batch) - one request to admin
// @route   PUT /api/bookings/batch/:batchId/status
// @access  Private/Admin
export const updateBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const bookings = await EquipmentBooking.findAll({
      where: { submissionBatchId: batchId },
      include: [
        { model: Equipment, as: "equipment", attributes: ["id", "equipmentName", "brandName", "image"] },
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
      ],
    });

    if (!bookings.length) {
      return res.status(404).json({
        success: false,
        message: "No bookings found for this request",
      });
    }

    if (status === "approved") {
      for (const booking of bookings) {
        const capacityCheck = await checkSlotCapacity({
          equipmentId: booking.equipmentId,
          bookingDate: booking.bookingDate,
          startTime: booking.bookingTime,
          durationHours: booking.duration,
          excludeBookingId: booking.id,
          statuses: ["approved"],
        });

        if (!capacityCheck.available) {
          return res.status(400).json({
            success: false,
            message: `Cannot approve batch: ${booking.equipment?.equipmentName || "Equipment"} conflict: ${capacityCheck.message}`,
          });
        }
      }
    }

    await sequelize.transaction(async (t) => {
      for (const b of bookings) {
        b.status = status;
        await b.save({ transaction: t });
      }
    });

    const user = bookings[0].user;
    if (user?.email) {
      try {
        const items = bookings.map((b) => ({
          equipmentName: b.equipment?.equipmentName,
          bookingDate: b.bookingDate,
          bookingTime: b.bookingTime,
        }));
        await sendBookingBatchStatusEmail(user.email, user.fullName, items, status);
      } catch (emailErr) {
        console.error("Error sending batch status email:", emailErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: bookings,
    });
  } catch (error) {
    console.error("Error updating batch status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating batch status",
      error: error.message,
    });
  }
};

// @desc    Submit cart: move all user's draft bookings to pending (so admin sees them)
// @route   POST /api/bookings/submit-cart
// @access  Private
export const submitCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let submitted = 0;
    const skipped = [];
    const batchId = `sub-${userId}-${Date.now()}`;

    await sequelize.transaction(async (t) => {
      const draftBookings = await EquipmentBooking.findAll({
        where: { userId, status: "draft" },
        include: [
          {
            model: Equipment,
            as: "equipment",
            attributes: ["id", "equipmentName", "quantity", "isAvailable"],
          },
        ],
        order: [["id", "ASC"]],
        transaction: t,
      });

      if (draftBookings.length === 0) {
        throw new Error("No items in cart to book");
      }

      for (const booking of draftBookings) {
        const eq = booking.equipment;
        if (!eq || !eq.isAvailable) {
          skipped.push({
            id: booking.id,
            equipmentName: eq?.equipmentName || "Unknown",
            reason: "Equipment is currently unbookable",
          });
          continue;
        }

        // Multi-unit capacity check against equipment.quantity
        const capacityCheck = await checkSlotCapacity({
          equipmentId: booking.equipmentId,
          bookingDate: booking.bookingDate,
          startTime: booking.bookingTime,
          durationHours: booking.duration,
          excludeBookingId: booking.id,
          transaction: t,
        });

        if (!capacityCheck.available) {
          skipped.push({
            id: booking.id,
            equipmentName: eq.equipmentName,
            reason: capacityCheck.message,
          });
          continue;
        }

        booking.status = "pending";
        booking.submissionBatchId = batchId;
        await booking.save({ transaction: t });
        submitted++;
      }
    });

    res.status(200).json({
      success: submitted > 0,
      message:
        submitted > 0
          ? `Booking confirmed! ${submitted} equipment reservation(s) booked successfully.${skipped.length ? ` ${skipped.length} could not be booked (capacity reached or unbookable).` : ""}`
          : `Could not book: ${skipped.map((s) => s.reason).join("; ")}`,
      data: { submitted, skipped },
    });
  } catch (error) {
    console.error("Error submitting cart:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Error submitting cart",
      error: error.message,
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await EquipmentBooking.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or you don't have permission to cancel it",
      });
    }

    if (!["draft", "pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this booking",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// @desc    Delete a booking (Admin only)
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await EquipmentBooking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await booking.destroy();

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting booking",
      error: error.message,
    });
  }
};

// @desc    Verify QR code (scan and validate booking)
// @route   POST /api/bookings/verify-qr
// @access  Private/Admin
export const verifyQRCode = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "QR code data is required",
      });
    }

    let parsedData;
    try {
      parsedData = typeof qrData === "string" ? JSON.parse(qrData) : qrData;
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid QR code format",
      });
    }

    const { bookingId } = parsedData;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID not found in QR code",
      });
    }

    const booking = await EquipmentBooking.findByPk(bookingId, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Verify QR data matches booking
    const isValid =
      booking.id === parseInt(bookingId) &&
      booking.equipment?.equipmentName === parsedData.equipmentName &&
      booking.bookingDate === parsedData.bookingDate &&
      String(booking.bookingTime).slice(0, 5) === String(parsedData.bookingTime).slice(0, 5);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "QR code data does not match booking records",
      });
    }

    // Check if booking is already verified
    if (booking.verifiedAt) {
      return res.status(400).json({
        success: false,
        message: "This booking has already been verified",
        data: booking,
      });
    }

    // Mark booking as verified (admin scanned QR)
    await booking.update({ verifiedAt: new Date() });

    // Reload with includes for response
    const updatedBooking = await EquipmentBooking.findByPk(bookingId, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "QR code verified successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error verifying QR code:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying QR code",
      error: error.message,
    });
  }
};
