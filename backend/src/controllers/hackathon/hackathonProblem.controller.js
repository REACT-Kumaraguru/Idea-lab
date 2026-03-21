import { QueryTypes } from "sequelize";
import { sequelize } from "../../lib/db.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";

export const getProblems = async (req, res) => {
  try {
    const problems = await HackathonProblem.findAll({
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({ problems });
  } catch (error) {
    console.log("Error in getProblems:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const adminAddProblem = async (req, res) => {
  const { title, description, sector, prizeAmount, seedMoneyAmount } = req.body || {};
  try {
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: "title and description are required" });
    }

    const problem = await HackathonProblem.create({
      title: title.trim(),
      description: description.trim(),
      sector: sector ? String(sector).trim() : null,
      prizeAmount: prizeAmount ?? null,
      seedMoneyAmount: seedMoneyAmount ?? null,
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

    const enriched = problems.map((p) => {
      const t = tally[p.id] || { total: 0, poc: 0, prototype: 0 };
      return {
        ...p.toJSON(),
        submissionCount: t.total,
        pocSubmissionCount: t.poc,
        prototypeSubmissionCount: t.prototype,
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

