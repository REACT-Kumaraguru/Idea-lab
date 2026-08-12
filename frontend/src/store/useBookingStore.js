import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  equipmentBookings: [],
  isCreatingBooking: false,
  isFetchingBookings: false,
  isFetchingEquipmentBookings: false,
  isSubmittingCart: false,

  // Fetch bookings for a specific equipment (public)
  fetchEquipmentBookings: async (equipmentId) => {
    set({ isFetchingEquipmentBookings: true });
    try {
      const res = await axiosInstance.get(`/bookings/equipment/${equipmentId}`);
      set({ equipmentBookings: res.data.data || [] });
    } catch (error) {
      console.log("Error in fetchEquipmentBookings:", error);
      toast.error(error.response?.data?.message || "Error fetching bookings");
    } finally {
      set({ isFetchingEquipmentBookings: false });
    }
  },

  // Create a new booking (protected)
  createBooking: async (data) => {
    set({ isCreatingBooking: true });
    try {
      const res = await axiosInstance.post("/bookings", data);
      if (res.data.success) {
        set((state) => ({
          bookings: [res.data.data, ...state.bookings],
        }));
        toast.success("Booking created successfully");
        return res.data.data;
      }
      return null;
    } catch (error) {
      console.log("Error in createBooking:", error);
      toast.error(error.response?.data?.message || "Error creating booking");
      return null;
    } finally {
      set({ isCreatingBooking: false });
    }
  },

  // Fetch logged-in user's bookings (protected)
  fetchMyBookings: async () => {
    set({ isFetchingBookings: true });
    try {
      const res = await axiosInstance.get("/bookings/my-bookings");
      set({ bookings: res.data.data || [] });
    } catch (error) {
      console.log("Error in fetchMyBookings:", error);
      toast.error(error.response?.data?.message || "Error fetching your bookings");
    } finally {
      set({ isFetchingBookings: false });
    }
  },

  // Submit cart: move all draft bookings to pending so admin sees them (protected)
  submitCart: async () => {
    set({ isSubmittingCart: true });
    try {
      const res = await axiosInstance.post("/bookings/submit-cart");
      if (res.data.success) {
        toast.success(res.data.message || "Request submitted to admin!");
        const updated = await axiosInstance.get("/bookings/my-bookings");
        set({ bookings: updated.data.data || [] });
        return res.data;
      }
      toast.error(res.data?.message || "Failed to submit");
      return null;
    } catch (error) {
      console.log("Error in submitCart:", error);
      toast.error(error.response?.data?.message || "Error submitting cart");
      return null;
    } finally {
      set({ isSubmittingCart: false });
    }
  },
}));
