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

// @desc    Create a new admin (only existing admin can add)
// @route   POST /api/admin/create
// @access  Private/Admin
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingAdmin = await Admin.findOne({ where: { email: email.trim() } });
    if (existingAdmin) {
      return res.status(400).json({ message: "An admin with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // phoneNumber is required in model; use a placeholder that is unique per email
    const phoneNumber = `admin-${email.trim().replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`;

    const admin = await Admin.create({
      fullName: fullName.trim(),
      email: email.trim(),
      password: hashedPassword,
      phoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error in createAdmin:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
