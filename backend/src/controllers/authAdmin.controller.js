import { generateToken } from "../lib/utils.js";
import Admin from "../models/AdminModel.js";
import bcrypt from "bcryptjs";

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(admin.id, res);

    res.status(200).json({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      role: "admin", // Explicitly return role for frontend logic
    });
  } catch (error) {
    console.log("Error in admin login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in admin logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    // req.user is populated by protectRoute middleware
    res.status(200).json({ ...req.user.toJSON(), role: "admin" });
  } catch (error) {
    console.log("Error in admin checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
