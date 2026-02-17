import EquipmentBooking from "../models/EquipmentBooking.model.js";
import Equipment from "../models/EquipmentModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount", "pricePerHour"],
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

    const pricePerHour = equipment.pricePerHour != null ? parseFloat(equipment.pricePerHour) : parseFloat(equipment.rentAmount) || 0;
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount", "pricePerHour"],
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount", "pricePerHour", "equipmentDetails", "quantity"],
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount", "pricePerHour"],
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

    let submitted = 0;
    const skipped = [];

    for (const booking of draftBookings) {
      const conflict = await EquipmentBooking.findOne({
        where: {
          equipmentId: booking.equipmentId,
          bookingDate: booking.bookingDate,
          status: { [Op.in]: ["pending", "approved"] },
          id: { [Op.ne]: booking.id },
        },
      });

      if (conflict) {
        skipped.push({ id: booking.id, reason: "Slot already taken" });
        continue;
      }

      booking.status = "pending";
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