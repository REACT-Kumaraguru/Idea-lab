import Hackathon from "../../models/hackathon/HackathonModel.js";
import HackathonLog from "../../models/hackathon/HackathonLogModel.js";
import HackathonRegistration from "../../models/hackathon/HackathonRegistrationModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import { Op } from "sequelize";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getAdminInfo = (req) => {
  const user = req.hackathonUser || req.session?.user || {};
  const name = user.fullName || user.email || "Admin";
  const email = user.email || null;
  return { name, email };
};

/** Public/Student endpoint: list all active hackathons */
export const getPublicHackathons = async (req, res) => {
  try {
    const rows = await Hackathon.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ hackathons: rows.map((h) => h.toJSON()) });
  } catch (error) {
    console.error("Error in getPublicHackathons:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/** Admin endpoint: list all hackathons */
export const adminListHackathons = async (req, res) => {
  try {
    const rows = await Hackathon.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ hackathons: rows.map((h) => h.toJSON()) });
  } catch (error) {
    console.error("Error in adminListHackathons:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/** Admin endpoint: list all audit logs */
export const adminListHackathonLogs = async (req, res) => {
  try {
    const logs = await HackathonLog.findAll({
      order: [["created_at", "DESC"]],
    });
    return res.status(200).json({ logs: logs.map((l) => l.toJSON()) });
  } catch (error) {
    console.error("Error in adminListHackathonLogs:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/** Admin endpoint: create new hackathon */
export const adminCreateHackathon = async (req, res) => {
  const {
    name,
    description,
    startDate,
    endDate,
    status,
    schedule,
    venue,
    organizedBy,
    problemStatementType,
    coordinators,
    tagline,
    inAssociationWith,
    prizes,
    refreshments,
    requiredDocuments,
    themes,
  } = req.body || {};
  try {
    if (!name?.trim()) {
      return res.status(400).json({ message: "Hackathon name is required" });
    }

    const nameTrimmed = name.trim();
    let baseSlug = slugify(nameTrimmed) || "hackathon";
    let finalSlug = baseSlug;
    let count = 1;

    while (await Hackathon.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count}`;
      count += 1;
    }

    const hackathon = await Hackathon.create({
      name: nameTrimmed,
      slug: finalSlug,
      description: description ? String(description).trim() : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: ["draft", "active", "completed", "closed"].includes(status) ? status : "active",
      registrationClosed: false,
      schedule: Array.isArray(schedule) ? schedule : [],
      venue: venue?.trim() || "Kumaraguru College of Technology",
      organizedBy: organizedBy?.trim() || "AICTE IDEA Lab, KCT",
      problemStatementType: ["predefined", "custom"].includes(problemStatementType) ? problemStatementType : "predefined",
      coordinators: coordinators || null,
      tagline: tagline?.trim() || null,
      inAssociationWith: inAssociationWith?.trim() || null,
      prizes: prizes?.trim() || null,
      refreshments: refreshments?.trim() || null,
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : (typeof requiredDocuments === "string" ? requiredDocuments.split(",").map((s) => s.trim()).filter(Boolean) : []),
      themes: Array.isArray(themes) ? themes : (typeof themes === "string" ? themes.split(",").map((s) => s.trim()).filter(Boolean) : []),
    });

    const adminInfo = getAdminInfo(req);
    await HackathonLog.create({
      hackathonName: nameTrimmed,
      action: "created",
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
    });

    return res.status(201).json({ hackathon: hackathon.toJSON() });
  } catch (error) {
    console.error("Error in adminCreateHackathon:", error.message);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/** Admin endpoint: update hackathon */
export const adminUpdateHackathon = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    startDate,
    endDate,
    status,
    registrationClosed,
    registrationClosedMessage,
    schedule,
    venue,
    organizedBy,
    problemStatementType,
    coordinators,
    tagline,
    inAssociationWith,
    prizes,
    refreshments,
    requiredDocuments,
    themes,
  } = req.body || {};

  try {
    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (description !== undefined) updates.description = description ? String(description).trim() : null;
    if (startDate !== undefined) updates.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
    if (status && ["draft", "active", "completed", "closed"].includes(status)) updates.status = status;
    if (typeof registrationClosed === "boolean") updates.registrationClosed = registrationClosed;
    if (registrationClosedMessage !== undefined) updates.registrationClosedMessage = registrationClosedMessage;
    if (Array.isArray(schedule)) updates.schedule = schedule;
    if (venue !== undefined) updates.venue = venue?.trim() || "Kumaraguru College of Technology";
    if (organizedBy !== undefined) updates.organizedBy = organizedBy?.trim() || "AICTE IDEA Lab, KCT";
    if (problemStatementType && ["predefined", "custom"].includes(problemStatementType)) updates.problemStatementType = problemStatementType;
    if (coordinators !== undefined) updates.coordinators = coordinators;
    if (tagline !== undefined) updates.tagline = tagline?.trim() || null;
    if (inAssociationWith !== undefined) updates.inAssociationWith = inAssociationWith?.trim() || null;
    if (prizes !== undefined) updates.prizes = prizes?.trim() || null;
    if (refreshments !== undefined) updates.refreshments = refreshments?.trim() || null;
    if (requiredDocuments !== undefined) updates.requiredDocuments = Array.isArray(requiredDocuments) ? requiredDocuments : (typeof requiredDocuments === "string" ? requiredDocuments.split(",").map((s) => s.trim()).filter(Boolean) : []);
    if (themes !== undefined) updates.themes = Array.isArray(themes) ? themes : (typeof themes === "string" ? themes.split(",").map((s) => s.trim()).filter(Boolean) : []);

    await hackathon.update(updates);

    const adminInfo = getAdminInfo(req);
    await HackathonLog.create({
      hackathonName: hackathon.name,
      action: "edited",
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
    });

    return res.status(200).json({ hackathon: hackathon.toJSON() });
  } catch (error) {
    console.error("Error in adminUpdateHackathon:", error.message);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/** Admin endpoint: delete hackathon */
export const adminDeleteHackathon = async (req, res) => {
  const { id } = req.params;
  try {
    const hackathon = await Hackathon.findByPk(id);
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    const hackathonName = hackathon.name;
    const adminInfo = getAdminInfo(req);

    await hackathon.destroy();

    await HackathonLog.create({
      hackathonName,
      action: "deleted",
      adminName: adminInfo.name,
      adminEmail: adminInfo.email,
    });

    return res.status(200).json({ success: true, id: Number(id) });
  } catch (error) {
    console.error("Error in adminDeleteHackathon:", error.message);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/** Student endpoint: register logged-in user for a specific hackathon */
export const registerUserForHackathon = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser?.id ?? req.session?.user?.id);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const { hackathonId, slug } = req.body || {};
    let targetHackathon = null;
    if (hackathonId) {
      targetHackathon = await Hackathon.findByPk(hackathonId);
    } else if (slug) {
      targetHackathon = await Hackathon.findOne({ where: { slug } });
    }

    if (!targetHackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    await HackathonRegistration.sync().catch(() => {});

    let reg = await HackathonRegistration.findOne({
      where: { userId, hackathonId: targetHackathon.id },
    });
    let created = false;
    if (!reg) {
      reg = await HackathonRegistration.create({
        userId,
        hackathonId: targetHackathon.id,
      });
      created = true;
    }

    return res.status(200).json({
      success: true,
      alreadyRegistered: !created,
      message: created
        ? `Successfully registered for ${targetHackathon.name}`
        : `You are already registered for ${targetHackathon.name}`,
      hackathon: targetHackathon,
    });
  } catch (error) {
    console.error("Error in registerUserForHackathon:", error);
    return res.status(500).json({ message: error.message || "Failed to register for hackathon" });
  }
};

/** Student endpoint: get all hackathons registered by current user */
export const getMyHackathonRegistrations = async (req, res) => {
  try {
    const userId = Number(req.hackathonUser?.id ?? req.session?.user?.id);
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    await HackathonRegistration.sync().catch(() => {});

    // 1. Direct event registrations
    const regs = await HackathonRegistration.findAll({ where: { userId } });
    const regHackathonIds = new Set(regs.map((r) => String(r.hackathonId)));

    // 2. Team memberships
    const memberships = await HackathonTeamMember.findAll({ where: { userId } });
    if (memberships.length > 0) {
      const teamIds = memberships.map((m) => m.teamId);
      const teams = await HackathonTeam.findAll({ where: { id: { [Op.in]: teamIds } } });
      teams.forEach((t) => {
        if (t.hackathonId) regHackathonIds.add(String(t.hackathonId));
      });
    }

    const registeredIds = Array.from(regHackathonIds);
    return res.status(200).json({ registeredIds });
  } catch (error) {
    console.error("Error in getMyHackathonRegistrations:", error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
