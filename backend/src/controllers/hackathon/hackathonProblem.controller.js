import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonProblemMentor from "../../models/hackathon/HackathonProblemMentorModel.js";

/** @returns {Promise<Record<number, number>>} */
async function getDistinctTeamCountByProblem() {
  const rows = await sequelize.query(
    `SELECT problem_id AS "problemId", COUNT(DISTINCT team_id) AS n
     FROM hackathon_submissions
     GROUP BY problem_id`,
    { type: QueryTypes.SELECT }
  );
  /** @type {Record<number, number>} */
  const map = {};
  for (const r of rows) {
    map[Number(r.problemId)] = Number(r.n) || 0;
  }
  return map;
}

/** @returns {Promise<Record<number, { pending: number; approved: number; rejected: number }>>} */
async function getTeamStatusCountsByProblem() {
  const rows = await sequelize.query(
    `SELECT s.problem_id AS "problemId", t.status AS status, COUNT(DISTINCT s.team_id) AS n
     FROM hackathon_submissions s
     INNER JOIN hackathon_teams t ON t.id = s.team_id
     GROUP BY s.problem_id, t.status`,
    { type: QueryTypes.SELECT }
  );
  /** @type {Record<number, { pending: number; approved: number; rejected: number }>} */
  const map = {};
  for (const r of rows) {
    const pid = Number(r.problemId);
    if (!map[pid]) {
      map[pid] = { pending: 0, approved: 0, rejected: 0 };
    }
    const n = Number(r.n) || 0;
    if (r.status === "pending") map[pid].pending = n;
    if (r.status === "approved") map[pid].approved = n;
    if (r.status === "rejected") map[pid].rejected = n;
  }
  return map;
}

function serializeMentor(mentorInstance) {
  if (!mentorInstance) return null;
  const mentor = mentorInstance.toJSON ? mentorInstance.toJSON() : mentorInstance;
  return {
    id: mentor.id,
    userId: mentor.userId,
    expertise: mentor.expertise || null,
    user: mentor.user
      ? {
          id: mentor.user.id,
          fullName: mentor.user.fullName,
          email: mentor.user.email,
          phoneNumber: mentor.user.phoneNumber,
        }
      : null,
  };
}

export const getProblems = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    let where = {};
    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      const count = await HackathonProblem.count({
        where: { [Op.or]: [{ hackathonId: Number(hackathonId) }, { hackathonId: null }] },
      });
      if (count > 0) {
        where[Op.or] = [{ hackathonId: Number(hackathonId) }, { hackathonId: null }];
      } else {
        // Fallback: if no specific problems exist for this hackathon ID, return available system problems
        where = {};
      }
    }

    const problems = await HackathonProblem.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: HackathonMentor,
          as: "mentors",
          required: false,
          include: [
            {
              model: HackathonUser,
              as: "user",
              attributes: ["id", "fullName", "email", "phoneNumber"],
            },
          ],
          through: { attributes: [] },
        },
      ],
    });

    const teamCountMap = await getDistinctTeamCountByProblem();

    const enriched = problems.map((p) => {
      const json = p.toJSON();
      const registeredTeams = teamCountMap[p.id] || 0;
      const mentors = Array.isArray(json.mentors) ? json.mentors.map((m) => serializeMentor(m)) : [];
      return {
        ...json,
        registeredTeams,
        mentors,
        mentor: mentors[0] || null,
      };
    });

    return res.status(200).json({ problems: enriched });
  } catch (error) {
    console.log("Error in getProblems:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminAddProblem = async (req, res) => {
  const { title, description, sector, mentorIds, mentorId, teamRegistrationLimit, hackathonId } = req.body || {};
  try {
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "title and description are required" });
    }

    let limitVal = null;
    if (teamRegistrationLimit !== undefined && teamRegistrationLimit !== null && teamRegistrationLimit !== "") {
      const n = Number(teamRegistrationLimit);
      if (!Number.isInteger(n) || n < 1) {
        return res.status(400).json({ message: "teamRegistrationLimit must be a positive integer" });
      }
      limitVal = n;
    }

    const rawIds = Array.isArray(mentorIds) ? mentorIds : mentorId != null ? [mentorId] : [];
    const mentorIdList = [...new Set(rawIds.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0))];
    if (mentorIdList.length < 1) {
      return res.status(400).json({ message: "At least one mentor is required (mentorIds)" });
    }

    const mentors = await HackathonMentor.findAll({ where: { id: { [Op.in]: mentorIdList } } });
    if (mentors.length !== mentorIdList.length) {
      return res.status(400).json({ message: "One or more mentor ids are invalid" });
    }

    const problem = await HackathonProblem.create({
      title: title.trim(),
      description: description.trim(),
      sector: sector ? String(sector).trim() : null,
      teamRegistrationLimit: limitVal,
      hackathonId: hackathonId && Number.isInteger(Number(hackathonId)) ? Number(hackathonId) : null,
    });

    await HackathonProblemMentor.bulkCreate(
      mentorIdList.map((mid) => ({ problemId: problem.id, mentorId: mid }))
    );

    const full = await HackathonProblem.findByPk(problem.id, {
      include: [
        {
          model: HackathonMentor,
          as: "mentors",
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "phoneNumber"] }],
          through: { attributes: [] },
        },
      ],
    });

    const json = full.toJSON();
    const mentorsJson = Array.isArray(json.mentors) ? json.mentors.map((m) => serializeMentor(m)) : [];

    return res.status(201).json({
      problem: {
        ...json,
        mentors: mentorsJson,
        mentor: mentorsJson[0] || null,
      },
    });
  } catch (error) {
    console.log("Error in adminAddProblem:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminUpdateProblem = async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, sector, mentorIds, mentorId, teamRegistrationLimit } = req.body || {};
  try {
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const problem = await HackathonProblem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "title and description are required" });
    }

    let limitVal = null;
    if (teamRegistrationLimit !== undefined && teamRegistrationLimit !== null && teamRegistrationLimit !== "") {
      const n = Number(teamRegistrationLimit);
      if (!Number.isInteger(n) || n < 1) {
        return res.status(400).json({ message: "teamRegistrationLimit must be a positive integer" });
      }
      limitVal = n;
    }

    const rawIds = Array.isArray(mentorIds) ? mentorIds : mentorId != null ? [mentorId] : [];
    const mentorIdList = [...new Set(rawIds.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0))];
    if (mentorIdList.length < 1) {
      return res.status(400).json({ message: "At least one mentor is required (mentorIds)" });
    }

    const mentors = await HackathonMentor.findAll({ where: { id: { [Op.in]: mentorIdList } } });
    if (mentors.length !== mentorIdList.length) {
      return res.status(400).json({ message: "One or more mentor ids are invalid" });
    }

    await problem.update({
      title: title.trim(),
      description: description.trim(),
      sector: sector ? String(sector).trim() : null,
      teamRegistrationLimit: limitVal,
    });

    await HackathonProblemMentor.destroy({ where: { problemId: id } });
    await HackathonProblemMentor.bulkCreate(mentorIdList.map((mid) => ({ problemId: id, mentorId: mid })));

    const full = await HackathonProblem.findByPk(id, {
      include: [
        {
          model: HackathonMentor,
          as: "mentors",
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "phoneNumber"] }],
          through: { attributes: [] },
        },
      ],
    });

    const json = full.toJSON();
    const mentorsJson = Array.isArray(json.mentors) ? json.mentors.map((m) => serializeMentor(m)) : [];

    const teamCountMap = await getDistinctTeamCountByProblem();
    const statusMap = await getTeamStatusCountsByProblem();
    const statsRows = await sequelize.query(
      `SELECT problem_id AS "problemId", submission_phase AS "submissionPhase", COUNT(*) AS n
       FROM hackathon_submissions
       WHERE problem_id = :pid
       GROUP BY problem_id, submission_phase`,
      { replacements: { pid: id }, type: QueryTypes.SELECT }
    );
    const t = { total: 0, poc: 0, prototype: 0 };
    for (const r of statsRows) {
      const n = Number(r.n) || 0;
      t.total += n;
      if (r.submissionPhase === "poc") t.poc = n;
      if (r.submissionPhase === "prototype") t.prototype = n;
    }
    const st = statusMap[id] || { pending: 0, approved: 0, rejected: 0 };

    return res.status(200).json({
      problem: {
        ...json,
        mentors: mentorsJson,
        mentor: mentorsJson[0] || null,
        submissionCount: t.total,
        pocSubmissionCount: t.poc,
        prototypeSubmissionCount: t.prototype,
        teamsSubmitted: teamCountMap[id] || 0,
        teamsPending: st.pending,
        teamsApproved: st.approved,
        teamsRejected: st.rejected,
      },
    });
  } catch (error) {
    console.log("Error in adminUpdateProblem:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminGetProblems = async (req, res) => {
  try {
    const { hackathonId } = req.query || {};
    const where = {};
    if (hackathonId && Number.isInteger(Number(hackathonId))) {
      where.hackathonId = Number(hackathonId);
    }

    const problems = await HackathonProblem.findAll({
      where,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: HackathonMentor,
          as: "mentors",
          required: false,
          include: [
            {
              model: HackathonUser,
              as: "user",
              attributes: ["id", "fullName", "email", "phoneNumber"],
            },
          ],
          through: { attributes: [] },
        },
      ],
    });

    const statsRows = await sequelize.query(
      `SELECT problem_id AS "problemId", submission_phase AS "submissionPhase", COUNT(*) AS n
       FROM hackathon_submissions
       GROUP BY problem_id, submission_phase`,
      { type: QueryTypes.SELECT }
    );

    /** @type {Record<number, { total: number; poc: number; prototype: number }>} */
    const tally = {};
    for (const r of statsRows) {
      const pid = Number(r.problemId);
      if (!tally[pid]) {
        tally[pid] = { total: 0, poc: 0, prototype: 0 };
      }
      const n = Number(r.n) || 0;
      tally[pid].total += n;
      if (r.submissionPhase === "poc") tally[pid].poc = n;
      if (r.submissionPhase === "prototype") tally[pid].prototype = n;
    }

    const teamCountMap = await getDistinctTeamCountByProblem();
    const statusMap = await getTeamStatusCountsByProblem();

    const enriched = problems.map((p) => {
      const t = tally[p.id] || { total: 0, poc: 0, prototype: 0 };
      const st = statusMap[p.id] || { pending: 0, approved: 0, rejected: 0 };
      const teamsSubmitted = teamCountMap[p.id] || 0;
      const mentors = Array.isArray(p.mentors) ? p.mentors.map((m) => serializeMentor(m)) : [];
      return {
        ...p.toJSON(),
        submissionCount: t.total,
        pocSubmissionCount: t.poc,
        prototypeSubmissionCount: t.prototype,
        teamsSubmitted,
        teamsPending: st.pending,
        teamsApproved: st.approved,
        teamsRejected: st.rejected,
        mentors,
        mentor: mentors[0] || null,
      };
    });

    return res.status(200).json({ problems: enriched });
  } catch (error) {
    console.log("Error in adminGetProblems:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminDeleteProblem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "Invalid problem id" });
    }

    const problem = await HackathonProblem.findByPk(id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await HackathonSubmission.destroy({ where: { problemId: id } });
    await HackathonProblemMentor.destroy({ where: { problemId: id } });
    await problem.destroy();

    return res.status(200).json({ message: "Problem deleted", id });
  } catch (error) {
    console.log("Error in adminDeleteProblem:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
