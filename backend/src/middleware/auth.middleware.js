import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { ENV } from "../lib/env.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const protectAdminRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
    }

    const Admin = (await import('../models/AdminModel.js')).default;
    
    const admin = await Admin.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    req.user = admin;

    next();
  } catch (error) {
    console.log('Error in protectAdminRoute middleware: ', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
