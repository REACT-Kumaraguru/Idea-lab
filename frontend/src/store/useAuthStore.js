
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      // If user check fails, try admin check
      try {
        const resAdmin = await axiosInstance.get("/admin/check");
        set({ authUser: resAdmin.data });
      } catch (adminError) {
        console.log("Error in checkAuth:", adminError);
        set({ authUser: null });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error creating account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      console.log("useAuthStore login called with:", data);
      const route = data.loginType === "admin" ? "/admin/login" : "/auth/login";
      console.log("Determined login route:", route);
      const res = await axiosInstance.post(route, data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging in");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    const { authUser } = get();
    const primaryRoute = authUser?.role === "admin" ? "/admin/logout" : "/auth/logout";
    const fallbackRoute = authUser?.role === "admin" ? "/auth/logout" : "/admin/logout";
    let ok = false;
    try {
      await axiosInstance.post(primaryRoute);
      ok = true;
    } catch (err) {
      try {
        await axiosInstance.post(fallbackRoute);
        ok = true;
      } catch {
        toast.error(err.response?.data?.message || "Error logging out");
      }
    } finally {
      set({ authUser: null });
      if (ok) toast.success("Logged out successfully");
    }
  },
}));
