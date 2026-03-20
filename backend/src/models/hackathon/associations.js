import HackathonUser from "./HackathonUserModel.js";
import HackathonSession from "./HackathonSessionModel.js";
import HackathonTeam from "./HackathonTeamModel.js";
import HackathonTeamMember from "./HackathonTeamMemberModel.js";
import HackathonProblem from "./HackathonProblemModel.js";
import HackathonSubmission from "./HackathonSubmissionModel.js";
import HackathonMentor from "./HackathonMentorModel.js";
import HackathonTeamMentor from "./HackathonTeamMentorModel.js";

export const setupHackathonAssociations = () => {
  // Sessions
  HackathonSession.belongsTo(HackathonUser, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "user",
  });

  // Teams
  HackathonTeam.belongsTo(HackathonUser, {
    foreignKey: { name: "leaderUserId", field: "leader_user_id" },
    as: "leader",
  });
  HackathonUser.hasMany(HackathonTeam, {
    foreignKey: { name: "leaderUserId", field: "leader_user_id" },
    as: "ledTeams",
  });

  // Team members
  HackathonTeam.hasMany(HackathonTeamMember, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "members",
  });
  HackathonTeamMember.belongsTo(HackathonTeam, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "team",
  });

  HackathonUser.hasMany(HackathonTeamMember, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "teamMemberships",
  });
  HackathonTeamMember.belongsTo(HackathonUser, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "member",
  });

  // Submissions
  HackathonSubmission.belongsTo(HackathonTeam, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "team",
  });
  HackathonSubmission.belongsTo(HackathonProblem, {
    foreignKey: { name: "problemId", field: "problem_id" },
    as: "problem",
  });
  HackathonSubmission.belongsTo(HackathonUser, {
    foreignKey: { name: "submittedByUserId", field: "submitted_by_user_id" },
    as: "submittedBy",
  });

  HackathonTeam.hasMany(HackathonSubmission, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "submissions",
  });
  HackathonProblem.hasMany(HackathonSubmission, {
    foreignKey: { name: "problemId", field: "problem_id" },
    as: "submissions",
  });

  // Mentors
  HackathonMentor.belongsTo(HackathonUser, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "user",
  });
  HackathonTeamMentor.belongsTo(HackathonTeam, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "team",
  });
  HackathonTeamMentor.belongsTo(HackathonMentor, {
    foreignKey: { name: "mentorId", field: "mentor_id" },
    as: "mentor",
  });
};

export {
  HackathonUser,
  HackathonSession,
  HackathonTeam,
  HackathonTeamMember,
  HackathonProblem,
  HackathonSubmission,
  HackathonMentor,
  HackathonTeamMentor,
};

