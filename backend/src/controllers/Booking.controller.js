import EquipmentBooking from "../models/EquipmentBooking.model.js";
import Equipment from "../models/EquipmentModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

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

    // Check if there's already a booking for this equipment on this date
    const existingBooking = await EquipmentBooking.findOne({
      where: {
        equipmentId,
        bookingDate,
        status: {
          [Op.in]: ["pending", "approved"],
        },
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Equipment is already booked for this date",
      });
    }

    // Calculate total amount - daily rate (not multiplied by hours)
    // The duration field stores working hours for informational purposes only
    const totalAmount = parseFloat(equipment.rentAmount);

    // Create booking
    const booking = await EquipmentBooking.create({
      equipmentId,
      userId,
      bookingDate,
      bookingTime,
      duration,
      totalAmount,
      notes,
      status: "pending",
    });

    // Fetch the created booking with associations
    const createdBooking = await EquipmentBooking.findByPk(booking.id, {
      include: [
        {
          model: Equipment,
          as: "equipment",
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount"],
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

// @desc    Get all bookings for a specific equipment
// @route   GET /api/bookings/equipment/:equipmentId
// @access  Public
export const getEquipmentBookings = async (req, res) => {
  try {
    const { equipmentId } = req.params;

    const bookings = await EquipmentBooking.findAll({
      where: {
        equipmentId,
        status: {
          [Op.in]: ["pending", "approved"],
        },
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount"],
        },
      ],
      order: [["createdAt", "DESC"]],
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

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    const { status, equipmentId } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
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
          attributes: ["id", "equipmentName", "brandName", "image", "rentAmount"],
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

    if (booking.status === "completed" || booking.status === "cancelled") {
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