import EquipmentBooking from "../models/EquipmentBooking.model.js";
import Equipment from "../models/EquipmentModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";
import { sendBookingStatusEmail, sendBookingBatchStatusEmail } from "../lib/email.js";

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
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour"],
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
    const { equipmentId, bookingDate, bookingTime, duration, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!equipmentId || !bookingDate || !bookingTime || !duration) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
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

    // Time to minutes from midnight (for overlap check)
    const timeToMinutes = (t) => {
      const s = String(t);
      const [h, m] = s.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    const newStartMin = timeToMinutes(bookingTime);
    const newEndMin = newStartMin + Math.round(durationHours * 60);

    // Fetch approved (and pending) bookings for this equipment on this date
    const existingBookings = await EquipmentBooking.findAll({
      where: {
        equipmentId,
        bookingDate,
        status: { [Op.in]: ["pending", "approved"] },
      },
      attributes: ["bookingTime", "duration"],
    });

    for (const existing of existingBookings) {
      const existingStartMin = timeToMinutes(existing.bookingTime);
      const existingDurationHours = parseFloat(existing.duration) || 1;
      const existingEndMin = existingStartMin + Math.round(existingDurationHours * 60);
      const overlaps = newStartMin < existingEndMin && newEndMin > existingStartMin;
      if (overlaps) {
        return res.status(400).json({
          success: false,
          message: "This time slot overlaps an existing booking",
        });
      }
    }

    const pricePerHour = parseFloat(equipment.pricePerHour) || 0;
    const totalAmount = Math.round(durationHours * pricePerHour * 100) / 100;

    // Create booking as draft (only sent to admin when user clicks "Proceed to Request" in cart)
    const booking = await EquipmentBooking.create({
      equipmentId,
      userId,
      bookingDate,
      bookingTime,
      duration: durationHours,
      totalAmount,
      notes,
      status: "draft",
    });

    // Fetch the created booking with associations
    const createdBooking = await EquipmentBooking.findByPk(booking.id, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: createdBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// @desc    Get all bookings for a specific equipment (approved only, for slot blocking)
// @route   GET /api/bookings/equipment/:equipmentId
// @access  Public
export const getEquipmentBookings = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    const bookings = await EquipmentBooking.findAll({
      where: {
        equipmentId,
        status: "approved",
      },
      attributes: ["id", "bookingDate", "bookingTime", "duration", "status"],
      order: [["bookingDate", "ASC"]],
    });

    res.status(200).json({
      success: true,
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
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour", "equipmentDetails", "quantity"],
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
          attributes: ["id", "equipmentName", "brandName", "image", "pricePerHour"],
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

    for (const b of bookings) {
      b.status = status;
      await b.save();
    }

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

    const draftBookings = await EquipmentBooking.findAll({
      where: { userId, status: "draft" },
      order: [["id", "ASC"]],
    });

    if (draftBookings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items in cart to submit",
      });
    }

    const batchId = `sub-${userId}-${Date.now()}`;
    let submitted = 0;
    const skipped = [];

    // Helper function to convert time to minutes
    const timeToMinutes = (t) => {
      const s = String(t);
      const [h, m] = s.split(":").map(Number);
      return (h || 0) * 60 + (m || 0);
    };

    for (const booking of draftBookings) {
      // Check for time slot overlap conflicts
      const newStartMin = timeToMinutes(booking.bookingTime);
      const newDurationHours = parseFloat(booking.duration) || 1;
      const newEndMin = newStartMin + Math.round(newDurationHours * 60);

      // Find all existing bookings for this equipment on this date
      const existingBookings = await EquipmentBooking.findAll({
        where: {
          equipmentId: booking.equipmentId,
          bookingDate: booking.bookingDate,
          status: { [Op.in]: ["pending", "approved"] },
          id: { [Op.ne]: booking.id },
        },
        attributes: ["id", "bookingTime", "duration"],
      });

      // Check if the new booking overlaps with any existing booking
      let hasConflict = false;
      for (const existing of existingBookings) {
        const existingStartMin = timeToMinutes(existing.bookingTime);
        const existingDurationHours = parseFloat(existing.duration) || 1;
        const existingEndMin = existingStartMin + Math.round(existingDurationHours * 60);
        
        // Check for overlap: newStart < existingEnd AND newEnd > existingStart
        const overlaps = newStartMin < existingEndMin && newEndMin > existingStartMin;
        if (overlaps) {
          hasConflict = true;
          break;
        }
      }

      if (hasConflict) {
        skipped.push({ id: booking.id, reason: "Time slot overlaps with existing booking" });
        continue;
      }

      booking.status = "pending";
      booking.submissionBatchId = batchId;
      await booking.save();
      submitted++;
    }

    res.status(200).json({
      success: true,
      message:
        submitted > 0
          ? `Request submitted. ${submitted} booking(s) sent to admin.${skipped.length ? ` ${skipped.length} skipped (slot already taken).` : ""}`
          : "No bookings could be submitted (all slots already taken).",
      data: { submitted, skipped },
    });
  } catch (error) {
    console.error("Error submitting cart:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting cart",
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