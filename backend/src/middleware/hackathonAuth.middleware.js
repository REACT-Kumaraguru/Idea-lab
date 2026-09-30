import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const unauthorized = (res) => res.status(401).json({ error: "Not authenticated" });
const forbidden = (res) => res.status(403).json({ error: "Forbidden" });


const getSessionUser = (req) => {
  if (req.session?.hackathonUser?.id) return req.session.hackathonUser;
  if (req.session?.user && (req.session.user.role === "admin" || req.session.user.isAdmin)) {
    return {
      id: req.session.user.id,
      email: req.session.user.email,
      role: "admin",
      fullName: req.session.user.fullName || req.session.user.name || "Administrator",
    };
  }
  return null;
};

const hydrateHackathonUserFromSession = async (req, res) => {
  const sessionUser = getSessionUser(req);
  if (!sessionUser?.id || !sessionUser?.role) {
    unauthorized(res);
    return null;
  }

  let user = await HackathonUser.findByPk(sessionUser.id, {
    attributes: { exclude: ["password"] },
  }).catch(() => null);

  if (!user && sessionUser.role === "admin") {
    user = {
      id: sessionUser.id,
      email: sessionUser.email,
      role: "admin",
      fullName: sessionUser.fullName || "Administrator",
    };
  }

  if (!user) {
    res.status(404).json({ message: "Hackathon user not found" });
    return null;
  }

  req.hackathonUser = user;
  return sessionUser;
};

export const protectHackathonRoute = async (req, res, next) => {
  try {
    const hydrated = await hydrateHackathonUserFromSession(req, res);
    if (!hydrated) return;
    next();
  } catch (error) {
    console.log("Error in protectHackathonRoute:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const requireHackathonRole = (...allowedRoles) => {
  return (req, res, next) => {
    const sessionUser = getSessionUser(req);
    if (!sessionUser?.role) return unauthorized(res);
    if (!allowedRoles.includes(sessionUser.role)) return forbidden(res);

    next();
  };
};

export const requireHackathonStudentRole = requireHackathonRole("student");
export const requireHackathonMentorRole = requireHackathonRole("mentor");
export const requireHackathonAdminRole = requireHackathonRole("admin");
export const requireHackathonVolunteerOrAdminRole = requireHackathonRole("volunteer", "admin");

