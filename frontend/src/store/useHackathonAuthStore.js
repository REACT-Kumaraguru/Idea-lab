import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useHackathonAuthStore = create((set, get) => ({
  hackathonUser: (() => {
    try {
      const raw = localStorage.getItem("hackathon_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: !Boolean(localStorage.getItem("hackathon_user")),

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/ich2026/check");
      if (res.data) {
        localStorage.setItem("hackathon_user", JSON.stringify(res.data));
        set({ hackathonUser: res.data });
      }
    } catch (error) {
      localStorage.removeItem("hackathon_user");
      set({ hackathonUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  register: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/ich2026/register", data);
      if (res.data) {
        localStorage.setItem("hackathon_user", JSON.stringify(res.data));
      }
      set({ hackathonUser: res.data, isCheckingAuth: false });
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
      const payload = {
        email: String(data?.email || "").trim(),
        password: String(data?.password || ""),
      };
      const res = await axiosInstance.post("/ich2026/login", payload);
      if (res.data) {
        localStorage.setItem("hackathon_user", JSON.stringify(res.data));
      }
      set({ hackathonUser: res.data, isCheckingAuth: false });
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
      await axiosInstance.post("/ich2026/logout");
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      localStorage.removeItem("hackathon_user");
      set({ hackathonUser: null, isCheckingAuth: false });
    }
  },
}));

