import { QueryTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";

/** @returns {Promise<Record<number, number>>} */
async function getDistinctTeamCountByProblem() {
  const rows = await sequelize.query(
    `SELECT problem_id AS "problemId", COUNT(DISTINCT team_id)::int AS n
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
    `SELECT s.problem_id AS "problemId", t.status::text AS status, COUNT(DISTINCT s.team_id)::int AS n
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
    const problems = await HackathonProblem.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: HackathonMentor,
          as: "mentor",
          required: false,
          include: [
            {
              model: HackathonUser,
              as: "user",
              attributes: ["id", "fullName", "email", "phoneNumber"],
            },
          ],
        },
      ],
    });

    const teamCountMap = await getDistinctTeamCountByProblem();

    const enriched = problems.map((p) => {
      const json = p.toJSON();
      const registeredTeams = teamCountMap[p.id] || 0;
      return {
        ...json,
        registeredTeams,
        mentor: serializeMentor(json.mentor),
      };
    });

    return res.status(200).json({ problems: enriched });
  } catch (error) {
    console.log("Error in getProblems:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminAddProblem = async (req, res) => {
  const { title, description, sector, mentorId, teamRegistrationLimit } = req.body || {};
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

    const resolvedMentorId = Number(mentorId);
    if (!Number.isInteger(resolvedMentorId)) {
      return res.status(400).json({ message: "mentorId is required and must be a valid mentor id" });
    }
    const mentor = await HackathonMentor.findByPk(resolvedMentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const problem = await HackathonProblem.create({
      title: title.trim(),
      description: description.trim(),
      sector: sector ? String(sector).trim() : null,
      mentorId: resolvedMentorId,
      teamRegistrationLimit: limitVal,
    });

    return res.status(201).json({ problem });
  } catch (error) {
    console.log("Error in adminAddProblem:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminGetProblems = async (req, res) => {
  try {
    const problems = await HackathonProblem.findAll({
      order: [["created_at", "DESC"]],
      include: [
        {
          model: HackathonMentor,
          as: "mentor",
          required: false,
          include: [
            {
              model: HackathonUser,
              as: "user",
              attributes: ["id", "fullName", "email", "phoneNumber"],
            },
          ],
        },
      ],
    });

    const statsRows = await sequelize.query(
      `SELECT problem_id AS "problemId", submission_phase AS "submissionPhase", COUNT(*)::int AS n
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
      return {
        ...p.toJSON(),
        submissionCount: t.total,
        pocSubmissionCount: t.poc,
        prototypeSubmissionCount: t.prototype,
        teamsSubmitted,
        teamsPending: st.pending,
        teamsApproved: st.approved,
        teamsRejected: st.rejected,
        mentor: serializeMentor(p.mentor),
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
    await problem.destroy();

    return res.status(200).json({ message: "Problem deleted", id });
  } catch (error) {
    console.log("Error in adminDeleteProblem:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
