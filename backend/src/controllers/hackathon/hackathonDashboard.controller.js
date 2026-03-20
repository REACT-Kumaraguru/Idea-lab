import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.hackathonUser.id;
    const role = req.hackathonUser.role;

    let teamId = null;

    if (role === "student") {
      const member = await HackathonTeamMember.findOne({ where: { userId } });
      teamId = member?.teamId || null;
    } else if (role === "mentor") {
      const mentor = await HackathonMentor.findOne({ where: { userId } });
      if (mentor) {
        const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentor.id } });
        teamId = assignment?.teamId || null;
      }
    } else {
      return res.status(403).json({ message: "Forbidden" });
    }

    const problems = await HackathonProblem.findAll({
      order: [["created_at", "DESC"]],
      attributes: ["id", "title", "sector", "prizeAmount", "seedMoneyAmount"],
    });

    if (!teamId) {
      return res.status(200).json({
        team: null,
        mentor: null,
        submissions: [],
        problems,
      });
    }

    const team = await HackathonTeam.findByPk(teamId, {
      attributes: ["id", "teamName", "inviteCode", "status", "leaderUserId"],
      include: [{ model: HackathonUser, as: "leader", attributes: ["id", "fullName", "email"] }],
    });

    const assignment = await HackathonTeamMentor.findOne({
      where: { teamId },
      include: [
        {
          model: HackathonMentor,
          as: "mentor",
          attributes: ["id", "expertise", "userId"],
          include: [{ model: HackathonUser, as: "user", attributes: ["id", "fullName", "email", "phoneNumber"] }],
        },
      ],
    });

    const submissions = await HackathonSubmission.findAll({
      where: { teamId },
      include: [{ model: HackathonProblem, as: "problem", attributes: ["id", "title", "sector"] }],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      team: team
        ? {
            id: team.id,
            teamName: team.teamName,
            inviteCode: team.inviteCode,
            status: team.status,
            leader: team.leader || null,
          }
        : null,
      mentor: assignment?.mentor?.user || null,
      submissions,
      problems,
    });
  } catch (error) {
    console.log("Error in getDashboard:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

