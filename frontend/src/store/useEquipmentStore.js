import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useEquipmentStore = create((set, get) => ({
  equipment: [],
  isFetchingEquipment: false,
  isCreatingEquipment: false,
  isUpdatingEquipment: false,
  isDeletingEquipment: false,

  fetchEquipment: async () => {
    set({ isFetchingEquipment: true });
    try {
      const res = await axiosInstance.get("/equipment");
      set({ equipment: res.data });
    } catch (error) {
      console.log("Error in fetchEquipment:", error);
      toast.error(error.response?.data?.message || "Error fetching equipment");
    } finally {
      set({ isFetchingEquipment: false });
    }
  },

  createEquipment: async (data) => {
    set({ isCreatingEquipment: true });
    try {
      const res = await axiosInstance.post("/equipment/add", data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({ equipment: [...state.equipment, res.data] }));
      toast.success("Equipment added successfully");
      return true; // Return success status
    } catch (error) {
      console.log("Error in createEquipment:", error);
      toast.error(error.response?.data?.message || "Error creating equipment");
      return false;
    } finally {
      set({ isCreatingEquipment: false });
    }
  },

  updateEquipment: async (id, data) => {
    set({ isUpdatingEquipment: true });
    try {
      const res = await axiosInstance.put(`/equipment/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set((state) => ({
        equipment: state.equipment.map((item) => (item.id === id ? res.data : item)),
      }));
      toast.success("Equipment updated successfully");
      return true;
    } catch (error) {
      console.log("Error in updateEquipment:", error);
      toast.error(error.response?.data?.message || "Error updating equipment");
      return false;
    } finally {
      set({ isUpdatingEquipment: false });
    }
  },

  deleteEquipment: async (id) => {
    set({ isDeletingEquipment: true });
    try {
      await axiosInstance.delete(`/equipment/${id}`);
      set((state) => ({
        equipment: state.equipment.filter((item) => item.id !== id),
      }));
      toast.success("Equipment deleted successfully");
    } catch (error) {
      console.log("Error in deleteEquipment:", error);
      toast.error(error.response?.data?.message || "Error deleting equipment");
    } finally {
      set({ isDeletingEquipment: false });
    }
  },
}));
