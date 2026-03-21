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
    return res.status(200).json({ problems });
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

