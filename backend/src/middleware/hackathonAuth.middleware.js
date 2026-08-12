import HackathonUser from "../models/hackathon/HackathonUserModel.js";

const unauthorized = (res) => res.status(401).json({ error: "Not authenticated" });
const forbidden = (res) => res.status(403).json({ error: "Forbidden" });


const getSessionOrHeaderUser = (req) => {
  if (req.session?.hackathonUser?.id) return req.session.hackathonUser;
  const rawHeader = req.headers["x-hackathon-user"];
  if (rawHeader) {
    try {
      const parsed = JSON.parse(decodeURIComponent(String(rawHeader)));
      if (parsed?.id && parsed?.role) return parsed;
    } catch (e) {
      // ignore parsing error
    }
  }
  return null;
};

const hydrateHackathonUserFromSession = async (req, res) => {
  const sessionUser = getSessionOrHeaderUser(req);
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
    const sessionUser = getSessionOrHeaderUser(req);
    if (!sessionUser?.role) return unauthorized(res);
    if (!allowedRoles.includes(sessionUser.role)) return forbidden(res);

    next();
  };
};

export const requireHackathonStudentRole = requireHackathonRole("student");
export const requireHackathonMentorRole = requireHackathonRole("mentor");
export const requireHackathonAdminRole = requireHackathonRole("admin");

