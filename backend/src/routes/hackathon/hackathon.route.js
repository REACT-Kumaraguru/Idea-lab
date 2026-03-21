import express from "express";

import {
  register,
  login,
  logout,
  checkAuth,
  sendHackathonResetOtp,
  verifyHackathonResetOtp,
  resetHackathonPassword,
} from "../../controllers/hackathon/hackathonAuth.controller.js";
import {
  createTeam,
  joinTeam,
  getMyTeam,
} from "../../controllers/hackathon/hackathonTeam.controller.js";
import { getProblems, adminAddProblem, adminGetProblems } from "../../controllers/hackathon/hackathonProblem.controller.js";
import {
  submit,
  getStatus,
  adminListSubmissions,
  adminSetSubmissionStatus,
  adminSelectWinner,
} from "../../controllers/hackathon/hackathonSubmission.controller.js";
import { protectHackathonRoute, requireHackathonRole, requireHackathonStudentRole, requireHackathonMentorRole, requireHackathonAdminRole } from "../../middleware/hackathonAuth.middleware.js";
import { hackathonUpload } from "../../modules/hackathon/lib/hackathonUpload.js";
import { getDashboard } from "../../controllers/hackathon/hackathonDashboard.controller.js";
import { adminListTeams, adminSetTeamStatus } from "../../controllers/hackathon/hackathonTeamAdmin.controller.js";
import {
  adminListMentors,
  adminCreateMentor,
  adminAssignMentor,
} from "../../controllers/hackathon/hackathonMentor.controller.js";
import { setupHackathonAssociations } from "../../models/hackathon/associations.js";

setupHackathonAssociations();

const router = express.Router();

// Hackathon auth (module-scoped)
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/check", protectHackathonRoute, checkAuth);

router.post("/send-reset-otp", sendHackathonResetOtp);
router.post("/verify-reset-otp", verifyHackathonResetOtp);
router.post("/reset-password", resetHackathonPassword);

// Public hackathon pages
router.get("/problems", getProblems);

// Student: team formation
router.post("/team/create", protectHackathonRoute, requireHackathonStudentRole, createTeam);
router.post("/team/join", protectHackathonRoute, requireHackathonStudentRole, joinTeam);
router.get("/team", protectHackathonRoute, requireHackathonRole("student", "mentor"), getMyTeam);

// Student/Mentor dashboard + progress
router.get("/dashboard", protectHackathonRoute, requireHackathonRole("student", "mentor"), getDashboard);
router.post(
  "/submit",
  protectHackathonRoute,
  requireHackathonStudentRole,
  hackathonUpload.fields([
    { name: "pocFiles", maxCount: 10 },
    { name: "prototypeFiles", maxCount: 10 },
  ]),
  submit
);
router.get("/status", protectHackathonRoute, requireHackathonRole("student", "mentor"), getStatus);

// Admin panel
router.get("/admin/teams", protectHackathonRoute, requireHackathonAdminRole, adminListTeams);
router.post("/admin/teams/:id/status", protectHackathonRoute, requireHackathonAdminRole, adminSetTeamStatus);

router.get("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminGetProblems);
router.post("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminAddProblem);

router.get("/admin/submissions", protectHackathonRoute, requireHackathonAdminRole, adminListSubmissions);
router.post("/admin/submissions/:id/status", protectHackathonRoute, requireHackathonAdminRole, adminSetSubmissionStatus);

router.get("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminListMentors);
router.post("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminCreateMentor);
router.post("/admin/mentors/assign", protectHackathonRoute, requireHackathonAdminRole, adminAssignMentor);

router.post("/admin/winners/select", protectHackathonRoute, requireHackathonAdminRole, adminSelectWinner);

export default router;

