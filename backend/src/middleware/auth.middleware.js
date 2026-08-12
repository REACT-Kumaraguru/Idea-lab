import User from "../models/UserModel.js";
import Admin from "../models/AdminModel.js";

const unauthorized = (res) => res.status(401).json({ error: "Not authenticated" });

const forbidden = (res) => res.status(403).json({ error: "Forbidden" });

const hydrateUserFromSession = async (req, res) => {
  const sessionUser = req.session?.user;
  if (!sessionUser?.id || !sessionUser?.role) {
    unauthorized(res);
    return null;
  }

  if (sessionUser.role === "admin") {
    const admin = await Admin.findByPk(sessionUser.id, {
      attributes: { exclude: ["passwordHash"] },
    });
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return null;
    }
    req.user = admin;
    return sessionUser;
  }

  const user = await User.findByPk(sessionUser.id, {
    attributes: { exclude: ["passwordHash"] },
  });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return null;
  }

  req.user = user;
  return sessionUser;
};

export const protectRoute = async (req, res, next) => {
  try {
    const sessionUser = await hydrateUserFromSession(req, res);
    if (!sessionUser) return;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const sessionUser = req.session?.user;
    if (!sessionUser?.role) {
      return unauthorized(res);
    }

    if (!allowedRoles.includes(sessionUser.role)) {
      return forbidden(res);
    }

    next();
  };
};

export const protectAdminRoute = async (req, res, next) => {
  try {
    const sessionUser = await hydrateUserFromSession(req, res);
    if (!sessionUser) return;
    if (sessionUser.role !== "admin") {
      return forbidden(res);
    }
    next();
  } catch (error) {
    console.log("Error in protectAdminRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireAdminRole = requireRole("admin");
export const requireStudentRole = requireRole("student");
export const requireExternalRole = requireRole("external");
