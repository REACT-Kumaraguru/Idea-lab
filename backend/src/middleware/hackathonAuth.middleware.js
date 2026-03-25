import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const unauthorized = (res) => res.status(401).json({ error: "Not authenticated" });
const forbidden = (res) => res.status(403).json({ error: "Forbidden" });

const ADMIN_ALLOWED_HOST = "react.kct.ac.in";
function isAllowedAdminOrigin(req) {
  // Allow all in non-production to avoid blocking local dev.
  if (process.env.NODE_ENV !== "production") return true;

  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";
  const candidates = [origin, referer].filter(Boolean);
  for (const c of candidates) {
    try {
      const u = new URL(c);
      if (u.hostname === ADMIN_ALLOWED_HOST) return true;
    } catch {
      // ignore invalid URL strings
    }
  }
  return false;
}

const hydrateHackathonUserFromSession = async (req, res) => {
  const sessionUser = req.session?.hackathonUser;
  if (!sessionUser?.id || !sessionUser?.role) {
    unauthorized(res);
    return null;
  }

  const user = await HackathonUser.findByPk(sessionUser.id, {
    attributes: { exclude: ["password"] },
  });

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
    const sessionUser = req.session?.hackathonUser;
    if (!sessionUser?.role) return unauthorized(res);
    if (!allowedRoles.includes(sessionUser.role)) return forbidden(res);

    if (allowedRoles.includes("admin") && sessionUser.role === "admin" && !isAllowedAdminOrigin(req)) {
      return forbidden(res);
    }

    next();
  };
};

export const requireHackathonStudentRole = requireHackathonRole("student");
export const requireHackathonMentorRole = requireHackathonRole("mentor");
export const requireHackathonAdminRole = requireHackathonRole("admin");

