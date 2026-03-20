import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonProblem from "../../models/hackathon/HackathonProblemModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";
import HackathonMentor from "../../models/hackathon/HackathonMentorModel.js";
import HackathonTeamMentor from "../../models/hackathon/HackathonTeamMentorModel.js";

const getUserIdFromSession = (req) => {
  const id = req.hackathonUser?.id ?? req.session?.user?.id;
  return Number(id);
};

const buildTeamSummary = async ({ team, currentUserId }) => {
  const membersRows = await HackathonTeamMember.findAll({
    where: { teamId: team.id },
    order: [["created_at", "ASC"]],
  });

  const members = await Promise.all(
    membersRows.map(async (m) => {
      const memberUser = await HackathonUser.findByPk(m.userId, {
        attributes: { exclude: ["password"] },
      });

      return {
        id: m.id,
        userId: m.userId,
        isLeader: m.isLeader === true,
        member: memberUser
          ? {
              id: memberUser.id,
              fullName: memberUser.fullName,
              email: memberUser.email,
              phoneNumber: memberUser.phoneNumber,
              role: memberUser.role,
            }
          : null,
      };
    })
  );

  return {
    id: team.id,
    teamName: team.teamName,
    inviteCode: team.inviteCode,
    status: team.status,
    leaderUserId: team.leaderUserId,
    isLeader: team.leaderUserId === currentUserId,
    members,
  };
};

const getTeamForStudentUserId = async (userId) => {
  const member = await HackathonTeamMember.findOne({ where: { userId } });
  if (member?.teamId) {
    const team = await HackathonTeam.findByPk(member.teamId);
    if (!team) return null;
    return buildTeamSummary({ team, currentUserId: userId });
  }

  const leaderTeam = await HackathonTeam.findOne({ where: { leaderUserId: userId } });
  if (!leaderTeam) return null;
  return buildTeamSummary({ team: leaderTeam, currentUserId: userId });
};

const getTeamForMentorUserId = async (userId) => {
  const mentorRow = await HackathonMentor.findOne({ where: { userId } });
  if (!mentorRow) return null;

  const assignment = await HackathonTeamMentor.findOne({ where: { mentorId: mentorRow.id } });
  if (!assignment?.teamId) return null;

  const team = await HackathonTeam.findByPk(assignment.teamId);
  if (!team) return null;
  return buildTeamSummary({ team, currentUserId: userId });
};

export const getDashboard = async (req, res) => {
  try {
    const userId = getUserIdFromSession(req);
    const role = req.hackathonUser.role;

    const problems = await HackathonProblem.findAll({
      order: [["created_at", "DESC"]],
      attributes: ["id", "title", "sector", "prizeAmount", "seedMoneyAmount"],
    });

    let team = null;
    if (role === "student") team = await getTeamForStudentUserId(userId);
    else if (role === "mentor") team = await getTeamForMentorUserId(userId);
    else return res.status(403).json({ message: "Forbidden" });

    if (!team) {
      return res.status(200).json({
        team: null,
        mentor: null,
        selectedProblem: null,
        submissionStatus: null,
        submissions: [],
        problems,
      });
    }

    const teamId = team.id;

    const latestSubmission = await HackathonSubmission.findOne({
      where: { teamId },
      order: [["created_at", "DESC"]],
    });

    const selectedProblem = latestSubmission
      ? await HackathonProblem.findByPk(latestSubmission.problemId, {
          attributes: ["id", "title", "sector"],
        })
      : null;

    const submissionsRows = await HackathonSubmission.findAll({
      where: { teamId },
      order: [["created_at", "DESC"]],
    });

    const submissions = await Promise.all(
      submissionsRows.map(async (s) => {
        const problem = await HackathonProblem.findByPk(s.problemId, {
          attributes: ["id", "title", "sector"],
        });
        const submittedBy = await HackathonUser.findByPk(s.submittedByUserId, {
          attributes: { exclude: ["password"] },
        });

        return {
          ...(s.toJSON ? s.toJSON() : s),
          problem: problem
            ? { id: problem.id, title: problem.title, sector: problem.sector }
            : null,
          submittedBy: submittedBy
            ? {
                id: submittedBy.id,
                fullName: submittedBy.fullName,
                email: submittedBy.email,
                role: submittedBy.role,
              }
            : null,
        };
      })
    );

    return res.status(200).json({
      team,
      mentor: null,
      selectedProblem: selectedProblem
        ? { id: selectedProblem.id, title: selectedProblem.title, sector: selectedProblem.sector }
        : null,
      submissionStatus: latestSubmission?.status || null,
      submissions,
      problems,
    });
  } catch (error) {
    console.log("Error in getDashboard:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

