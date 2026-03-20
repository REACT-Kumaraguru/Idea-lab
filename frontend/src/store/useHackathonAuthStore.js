import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useHackathonAuthStore = create((set, get) => ({
  hackathonUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/hackathon/check");
      set({ hackathonUser: res.data });
    } catch (error) {
      set({ hackathonUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/hackathon/register", data);
      set({ hackathonUser: res.data });
      toast.success("Hackathon account created");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating account");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/hackathon/login", data);
      set({ hackathonUser: res.data });
      toast.success("Logged in successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging in");
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/hackathon/logout");
    } finally {
      set({ hackathonUser: null, isCheckingAuth: false });
    }
  },
}));

