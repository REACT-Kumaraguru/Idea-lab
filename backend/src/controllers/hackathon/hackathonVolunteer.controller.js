import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";

export const volunteerScanTeam = async (req, res) => {
  try {
    const { query } = req.query || {};
    if (!query || !String(query).trim()) {
      return res.status(400).json({ message: "Scan code or search query required" });
    }

    const trimmed = String(query).trim();
    let team = null;

    // Try parsing as JSON if it came from the official QR Code
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.tCode || parsed.inviteCode) {
        team = await HackathonTeam.findOne({
          where: { inviteCode: parsed.tCode || parsed.inviteCode },
        });
      } else if (parsed.tId || parsed.teamId) {
        team = await HackathonTeam.findByPk(parsed.tId || parsed.teamId);
      }
    } catch {
      // Not JSON, treat as raw invite code, team ID, or team name
    }

    if (!team) {
      if (/^\d+$/.test(trimmed)) {
        team = await HackathonTeam.findByPk(Number(trimmed));
      }
    }

    if (!team) {
      team = await HackathonTeam.findOne({
        where: { inviteCode: trimmed },
      });
    }

    if (!team) {
      team = await HackathonTeam.findOne({
        where: { teamName: trimmed },
      });
    }

    if (!team) {
      return res.status(404).json({ message: "Team not found for the scanned QR code" });
    }

    const leader = await HackathonUser.findByPk(team.leaderUserId, {
      attributes: ["id", "fullName", "email", "phone", "phoneNumber", "college", "branch"],
    });

    const memberRows = await HackathonTeamMember.findAll({
      where: { teamId: team.id },
    });

    const members = await Promise.all(
      memberRows.map(async (m) => {
        const u = await HackathonUser.findByPk(m.userId, {
          attributes: ["id", "fullName", "email", "phone", "phoneNumber", "college", "branch"],
        });
        return {
          id: m.id,
          userId: m.userId,
          isLeader: m.isLeader === true,
          fullName: u?.fullName || "Member",
          email: u?.email,
          phone: u?.phoneNumber || u?.phone,
          college: u?.college,
          branch: u?.branch,
        };
      })
    );

    const hackathon = team.hackathonId ? await Hackathon.findByPk(team.hackathonId) : null;

    return res.json({
      success: true,
      team: {
        id: team.id,
        teamName: team.teamName,
        inviteCode: team.inviteCode,
        theme: team.theme,
        topic: team.topic,
        status: team.status,
        isPresent: Boolean(team.isPresent),
        benchNumber: team.benchNumber || null,
        attendanceMarkedAt: team.attendanceMarkedAt || null,
        attendanceMarkedBy: team.attendanceMarkedBy || null,
        hackathonTitle: hackathon?.title || hackathon?.name || "Hackathon",
        leader,
        members,
      },
    });
  } catch (error) {
    console.error("Error in volunteerScanTeam:", error);
    return res.status(500).json({ message: "Failed to process team QR scan" });
  }
};

export const volunteerCheckInTeam = async (req, res) => {
  try {
    const { teamId, benchNumber, isPresent = true } = req.body || {};
    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const team = await HackathonTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const volunteerName =
      req.session?.hackathonUser?.fullName ||
      req.hackathonUser?.fullName ||
      req.session?.user?.fullName ||
      "Event Volunteer";

    team.isPresent = Boolean(isPresent);
    if (benchNumber) {
      team.benchNumber = String(benchNumber).trim().toUpperCase();
    }
    team.attendanceMarkedAt = new Date();
    team.attendanceMarkedBy = volunteerName;
    await team.save();

    return res.json({
      success: true,
      message: `Team "${team.teamName}" attendance verified successfully!`,
      team: {
        id: team.id,
        teamName: team.teamName,
        isPresent: team.isPresent,
        benchNumber: team.benchNumber,
        attendanceMarkedAt: team.attendanceMarkedAt,
        attendanceMarkedBy: team.attendanceMarkedBy,
      },
    });
  } catch (error) {
    console.error("Error in volunteerCheckInTeam:", error);
    return res.status(500).json({ message: "Failed to check in team" });
  }
};

export const volunteerListAttendance = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    const where = { isPresent: true };
    if (hackathonId) {
      where.hackathonId = hackathonId;
    }

    const teams = await HackathonTeam.findAll({
      where,
      order: [["attendance_marked_at", "DESC"]],
      limit: 100,
    });

    return res.json({
      success: true,
      count: teams.length,
      attendance: teams.map((t) => ({
        id: t.id,
        teamName: t.teamName,
        inviteCode: t.inviteCode,
        benchNumber: t.benchNumber,
        attendanceMarkedAt: t.attendanceMarkedAt,
        attendanceMarkedBy: t.attendanceMarkedBy,
      })),
    });
  } catch (error) {
    console.error("Error in volunteerListAttendance:", error);
    return res.status(500).json({ message: "Failed to fetch attendance records" });
  }
};

export const adminGetAttendance = async (req, res) => {
  try {
    const { hackathonId = 1 } = req.query || {};
    const where = {};
    if (hackathonId) {
      where.hackathonId = hackathonId;
    }

    const teams = await HackathonTeam.findAll({
      where,
      order: [
        ["is_present", "DESC"],
        ["team_name", "ASC"],
      ],
    });

    const enriched = await Promise.all(
      teams.map(async (t) => {
        const leader = await HackathonUser.findByPk(t.leaderUserId, {
          attributes: ["id", "fullName", "email", "phone", "phoneNumber"],
        });
        const memberCount = await HackathonTeamMember.count({ where: { teamId: t.id } });
        return {
          id: t.id,
          teamName: t.teamName,
          inviteCode: t.inviteCode,
          theme: t.theme,
          cluster: t.cluster,
          isPresent: Boolean(t.isPresent),
          benchNumber: t.benchNumber || "",
          attendanceMarkedAt: t.attendanceMarkedAt,
          attendanceMarkedBy: t.attendanceMarkedBy,
          leaderName: leader?.fullName || "—",
          leaderEmail: leader?.email || "—",
          memberCount: Math.max(1, memberCount),
        };
      })
    );

    const total = enriched.length;
    const presentCount = enriched.filter((t) => t.isPresent).length;
    const absentCount = total - presentCount;

    return res.json({
      success: true,
      stats: {
        total,
        present: presentCount,
        absent: absentCount,
        rate: total > 0 ? Math.round((presentCount / total) * 100) : 0,
      },
      teams: enriched,
    });
  } catch (error) {
    console.error("Error in adminGetAttendance:", error);
    return res.status(500).json({ message: "Failed to load attendance list" });
  }
};

export const adminToggleAttendance = async (req, res) => {
  try {
    const { teamId, isPresent, benchNumber } = req.body;
    const team = await HackathonTeam.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (isPresent !== undefined) {
      team.isPresent = Boolean(isPresent);
      if (team.isPresent) {
        team.attendanceMarkedAt = new Date();
        team.attendanceMarkedBy = req.session?.hackathonUser?.fullName || "Admin Desk";
      } else {
        team.attendanceMarkedAt = null;
        team.attendanceMarkedBy = null;
      }
    }

    if (benchNumber !== undefined) {
      team.benchNumber = String(benchNumber).trim().toUpperCase();
    }

    await team.save();

    return res.json({
      success: true,
      message: `Team "${team.teamName}" attendance updated`,
      team: {
        id: team.id,
        teamName: team.teamName,
        isPresent: team.isPresent,
        benchNumber: team.benchNumber,
        attendanceMarkedAt: team.attendanceMarkedAt,
        attendanceMarkedBy: team.attendanceMarkedBy,
      },
    });
  } catch (error) {
    console.error("Error in adminToggleAttendance:", error);
    return res.status(500).json({ message: "Failed to update attendance" });
  }
};

