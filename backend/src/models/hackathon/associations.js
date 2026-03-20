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
  HackathonSession.belongsTo(HackathonUser, { foreignKey: "userId", as: "user" });

  // Teams
  HackathonTeam.belongsTo(HackathonUser, {
    foreignKey: "leaderUserId",
    as: "leader",
  });
  HackathonUser.hasMany(HackathonTeam, {
    foreignKey: "leaderUserId",
    as: "ledTeams",
  });

  // Team members
  HackathonTeam.hasMany(HackathonTeamMember, { foreignKey: "teamId", as: "members" });
  HackathonTeamMember.belongsTo(HackathonTeam, { foreignKey: "teamId", as: "team" });

  HackathonUser.hasMany(HackathonTeamMember, {
    foreignKey: "userId",
    as: "teamMemberships",
  });
  HackathonTeamMember.belongsTo(HackathonUser, { foreignKey: "userId", as: "member" });

  // Submissions
  HackathonSubmission.belongsTo(HackathonTeam, { foreignKey: "teamId", as: "team" });
  HackathonSubmission.belongsTo(HackathonProblem, { foreignKey: "problemId", as: "problem" });
  HackathonSubmission.belongsTo(HackathonUser, {
    foreignKey: "submittedByUserId",
    as: "submittedBy",
  });

  HackathonTeam.hasMany(HackathonSubmission, { foreignKey: "teamId", as: "submissions" });
  HackathonProblem.hasMany(HackathonSubmission, { foreignKey: "problemId", as: "submissions" });

  // Mentors
  HackathonMentor.belongsTo(HackathonUser, { foreignKey: "userId", as: "user" });
  HackathonTeamMentor.belongsTo(HackathonTeam, { foreignKey: "teamId", as: "team" });
  HackathonTeamMentor.belongsTo(HackathonMentor, { foreignKey: "mentorId", as: "mentor" });
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

