import express from "express";
import fs from "fs";
import path from "path";

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
import {
  getProblems,
  adminAddProblem,
  adminGetProblems,
  adminDeleteProblem,
} from "../../controllers/hackathon/hackathonProblem.controller.js";
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
import { adminListTeams } from "../../controllers/hackathon/hackathonTeamAdmin.controller.js";
import { adminSendTeamMail } from "../../controllers/hackathon/hackathonAdminMail.controller.js";
import { listHackathonAdmins, createHackathonAdmin, updateHackathonAdmin, deleteHackathonAdmin } from "../../controllers/hackathon/hackathonAdminUsers.controller.js";
import {
  adminListMentors,
  adminCreateMentor,
  adminAssignMentor,
} from "../../controllers/hackathon/hackathonMentor.controller.js";
import { setupHackathonAssociations } from "../../models/hackathon/associations.js";

setupHackathonAssociations();

const router = express.Router();

// Serve uploaded files via API path (so reverse proxies can forward).
router.get("/uploads/hackathon/:filename", async (req, res) => {
  const { filename } = req.params || {};
  if (!filename) return res.status(400).send("filename is required");

  const uploadDir = path.join(process.cwd(), "src/uploads/hackathon");
  const filePath = path.join(uploadDir, String(filename));

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  return res.sendFile(filePath);
});

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
router.post("/admin/send-mail", protectHackathonRoute, requireHackathonAdminRole, adminSendTeamMail);

router.get("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminGetProblems);
router.post("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminAddProblem);
router.delete("/admin/problems/:id", protectHackathonRoute, requireHackathonAdminRole, adminDeleteProblem);

router.get("/admin/submissions", protectHackathonRoute, requireHackathonAdminRole, adminListSubmissions);
router.post("/admin/submissions/:id/status", protectHackathonRoute, requireHackathonAdminRole, adminSetSubmissionStatus);

// Hackathon admin account management (default admin only)
router.get("/admin/users", protectHackathonRoute, requireHackathonAdminRole, listHackathonAdmins);
router.post("/admin/users", protectHackathonRoute, requireHackathonAdminRole, createHackathonAdmin);
router.put("/admin/users/:id", protectHackathonRoute, requireHackathonAdminRole, updateHackathonAdmin);
router.delete("/admin/users/:id", protectHackathonRoute, requireHackathonAdminRole, deleteHackathonAdmin);

router.get("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminListMentors);
router.post("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminCreateMentor);
router.post("/admin/mentors/assign", protectHackathonRoute, requireHackathonAdminRole, adminAssignMentor);

router.post("/admin/winners/select", protectHackathonRoute, requireHackathonAdminRole, adminSelectWinner);

export default router;

