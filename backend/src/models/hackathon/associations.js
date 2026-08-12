import Hackathon from "./HackathonModel.js";
import HackathonUser from "./HackathonUserModel.js";
import HackathonSession from "./HackathonSessionModel.js";
import HackathonTeam from "./HackathonTeamModel.js";
import HackathonTeamMember from "./HackathonTeamMemberModel.js";
import HackathonProblem from "./HackathonProblemModel.js";
import HackathonSubmission from "./HackathonSubmissionModel.js";
import HackathonMentor from "./HackathonMentorModel.js";
import HackathonTeamMentor from "./HackathonTeamMentorModel.js";
import HackathonProblemMentor from "./HackathonProblemMentorModel.js";
import HackathonPaymentDetail from "./HackathonPaymentDetailModel.js";
import HackathonRegistration from "./HackathonRegistrationModel.js";

let isSetup = false;
export const setupHackathonAssociations = () => {
  if (isSetup) return;
  isSetup = true;
  // Hackathon scoping
  HackathonTeam.belongsTo(Hackathon, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "hackathon",
  });
  Hackathon.hasMany(HackathonTeam, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "teams",
  });

  HackathonProblem.belongsTo(Hackathon, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "hackathon",
  });
  Hackathon.hasMany(HackathonProblem, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "problems",
  });

  HackathonMentor.belongsTo(Hackathon, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "hackathon",
  });
  Hackathon.hasMany(HackathonMentor, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "mentors",
  });

  HackathonSubmission.belongsTo(Hackathon, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "hackathon",
  });
  Hackathon.hasMany(HackathonSubmission, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "submissions",
  });
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

  // Payment details
  HackathonPaymentDetail.belongsTo(HackathonTeam, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "team",
  });
  HackathonTeam.hasOne(HackathonPaymentDetail, {
    foreignKey: { name: "teamId", field: "team_id" },
    as: "paymentDetail",
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

  HackathonProblem.belongsToMany(HackathonMentor, {
    through: HackathonProblemMentor,
    foreignKey: "problemId",
    otherKey: "mentorId",
    as: "mentors",
  });
  HackathonMentor.belongsToMany(HackathonProblem, {
    through: HackathonProblemMentor,
    foreignKey: "mentorId",
    otherKey: "problemId",
    as: "problems",
  });

  HackathonRegistration.belongsTo(HackathonUser, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "user",
  });
  HackathonRegistration.belongsTo(Hackathon, {
    foreignKey: { name: "hackathonId", field: "hackathon_id" },
    as: "hackathon",
  });
  HackathonUser.hasMany(HackathonRegistration, {
    foreignKey: { name: "userId", field: "user_id" },
    as: "registrations",
  });
};

import HackathonLog from "./HackathonLogModel.js";

export {
  Hackathon,
  HackathonLog,
  HackathonUser,
  HackathonSession,
  HackathonTeam,
  HackathonTeamMember,
  HackathonProblem,
  HackathonSubmission,
  HackathonMentor,
  HackathonTeamMentor,
  HackathonProblemMentor,
  HackathonPaymentDetail,
  HackathonRegistration,
};

