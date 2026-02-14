import express from "express";
import {
  createBooking,
  getEquipmentBookings,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
} from "../controllers/Booking.controller.js";
import { protectRoute, protectAdminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/equipment/:equipmentId", getEquipmentBookings);

// Protected routes (require authentication)
router.post("/", protectRoute, createBooking);
router.get("/my-bookings", protectRoute, getMyBookings);
router.get("/:id", protectRoute, getBookingById);
router.put("/:id/cancel", protectRoute, cancelBooking);

// Admin routes
router.get("/", protectAdminRoute, getAllBookings);
router.put("/:id/status", protectAdminRoute, updateBookingStatus);
router.delete("/:id", protectAdminRoute, deleteBooking);

export default router;