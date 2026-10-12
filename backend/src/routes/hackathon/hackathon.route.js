import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  register,
  login,
  logout,
  checkAuth,
  sendHackathonResetOtp,
  verifyHackathonResetOtp,
  resetHackathonPassword,
  getHackathonRegistrationStatus,
} from "../../controllers/hackathon/hackathonAuth.controller.js";
import {
  createTeam,
  joinTeam,
  leaveTeam,
  dismantleTeam,
  getMyTeam,
  updateCustomProblem,
} from "../../controllers/hackathon/hackathonTeam.controller.js";
import {
  getProblems,
  adminAddProblem,
  adminUpdateProblem,
  adminGetProblems,
  adminDeleteProblem,
} from "../../controllers/hackathon/hackathonProblem.controller.js";
import {
  submit,
  getStatus,
  adminListSubmissions,
  adminSetSubmissionStatus,
  adminSelectWinner,
  mentorSetSubmissionApproval,
} from "../../controllers/hackathon/hackathonSubmission.controller.js";
import { protectHackathonRoute, requireHackathonRole, requireHackathonStudentRole, requireHackathonMentorRole, requireHackathonAdminRole, requireHackathonVolunteerOrAdminRole } from "../../middleware/hackathonAuth.middleware.js";
import { authRateLimiter, otpRateLimiter, uploadRateLimiter } from "../../middleware/rateLimit.middleware.js";
import { checkAccountLockout } from "../../middleware/accountLockout.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { loginSchema, registerSchema, otpRequestSchema, otpVerifySchema } from "../../validators/auth.validator.js";
import { hackathonUpload } from "../../modules/hackathon/lib/hackathonUpload.js";
import { getDashboard } from "../../controllers/hackathon/hackathonDashboard.controller.js";
import { adminListTeams, adminExportTeamsExcel, adminDeleteTeam } from "../../controllers/hackathon/hackathonTeamAdmin.controller.js";
import { adminListRegisteredStudents } from "../../controllers/hackathon/hackathonAdminStudents.controller.js";
import { adminSendTeamMail, getAdminEmailLogs } from "../../controllers/hackathon/hackathonAdminMail.controller.js";
import { listHackathonAdmins, createHackathonAdmin, updateHackathonAdmin, deleteHackathonAdmin } from "../../controllers/hackathon/hackathonAdminUsers.controller.js";
import {
  adminListMentors,
  adminCreateMentor,
  adminUpdateMentor,
  adminDeleteMentor,
  adminAssignMentor,
} from "../../controllers/hackathon/hackathonMentor.controller.js";
import { setupHackathonAssociations } from "../../models/hackathon/associations.js";
import { adminExportSubmissionsExcel, adminExportMentorsExcel } from "../../controllers/hackathon/hackathonAdminExport.controller.js";
import {
  getMyPaymentDetail,
  submitMyPaymentDetail,
  adminListPaymentDetails,
  adminVerifyPaymentDetail,
  adminExportPaymentDetailsExcel,
} from "../../controllers/hackathon/hackathonPayment.controller.js";

import {
  getPublicHackathons,
  adminListHackathons,
  adminListHackathonLogs,
  adminCreateHackathon,
  adminUpdateHackathon,
  adminDeleteHackathon,
  registerUserForHackathon,
  getMyHackathonRegistrations,
} from "../../controllers/hackathon/hackathonManagement.controller.js";

setupHackathonAssociations();

const router = express.Router();

// Download API (authenticated & secured route): GET /api/ich2026/download/hackathon/:filename
router.get("/download/hackathon/:filename", protectHackathonRoute, async (req, res) => {
  const { filename } = req.params || {};
  if (!filename) return res.status(400).json({ message: "Filename is required" });

  const safeName = path.basename(String(filename));
  const uploadDir = process.env.UPLOADS_DIR 
    ? path.resolve(process.env.UPLOADS_DIR, "hackathon")
    : path.join(process.cwd(), "uploads", "hackathon");

  const filePath = path.join(uploadDir, safeName);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  return res.sendFile(filePath);
});

// Download Templatehackthon.pdf via API (avoid Nginx static-file misconfig).
// Prefer monorepo frontend/public first — backend/assets may hold a tiny placeholder
// that still "exists", which would otherwise be served and appear as a blank PDF.
router.get("/templatehackthon.pdf", (req, res) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirnameRoute = path.dirname(__filename);
    const candidates = [
      path.resolve(__dirnameRoute, "../../../../frontend/public/Templatehackthon.pdf"),
      path.resolve(__dirnameRoute, "../../../assets/Templatehackthon.pdf"),
      path.join(process.cwd(), "assets", "Templatehackthon.pdf"),
    ];
    const pdfPath = candidates.find((p) => fs.existsSync(p));
    if (!pdfPath) {
      return res.status(404).send("Templatehackthon.pdf not found");
    }
    const absolute = path.resolve(pdfPath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="Templatehackthon.pdf"');
    return res.sendFile(absolute);
  } catch (e) {
    console.error("templatehackthon.pdf:", e);
    return res.status(500).send("Failed to download Templatehackthon.pdf");
  }
});

// Hackathon auth (module-scoped)
router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, checkAccountLockout, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/check", protectHackathonRoute, checkAuth);

router.post("/send-reset-otp", otpRateLimiter, validate(otpRequestSchema), sendHackathonResetOtp);
router.post("/verify-reset-otp", otpRateLimiter, validate(otpVerifySchema), verifyHackathonResetOtp);
router.post("/reset-password", authRateLimiter, resetHackathonPassword);

// Public hackathon pages
router.get("/hackathons", getPublicHackathons);
router.post("/hackathons/register-event", protectHackathonRoute, registerUserForHackathon);
router.get("/my-registrations", protectHackathonRoute, getMyHackathonRegistrations);
router.get("/registration-status", getHackathonRegistrationStatus);
router.get("/problems", getProblems);

// Student: team formation
router.post("/team/create", protectHackathonRoute, requireHackathonStudentRole, createTeam);
router.post("/team/join", protectHackathonRoute, requireHackathonStudentRole, joinTeam);
router.post("/team/leave", protectHackathonRoute, leaveTeam);
router.post("/team/dismantle", protectHackathonRoute, dismantleTeam);
router.get("/team", protectHackathonRoute, requireHackathonRole("student", "mentor"), getMyTeam);
router.put("/team/custom-problem", protectHackathonRoute, requireHackathonStudentRole, updateCustomProblem);

// Student/Mentor dashboard + progress
router.get("/dashboard", protectHackathonRoute, requireHackathonRole("student", "mentor"), getDashboard);
router.post(
  "/submit",
  protectHackathonRoute,
  requireHackathonStudentRole,
  uploadRateLimiter,
  hackathonUpload.fields([
    { name: "pocFiles", maxCount: 10 },
    { name: "prototypeFiles", maxCount: 10 },
  ]),
  submit
);
router.get("/status", protectHackathonRoute, requireHackathonRole("student", "mentor"), getStatus);
router.get("/payment-details", protectHackathonRoute, requireHackathonStudentRole, getMyPaymentDetail);
router.post("/payment-details", protectHackathonRoute, requireHackathonStudentRole, submitMyPaymentDetail);
router.post(
  "/mentor/submissions/:id/approval",
  protectHackathonRoute,
  requireHackathonMentorRole,
  mentorSetSubmissionApproval
);

// Admin panel
router.get("/admin/hackathons", protectHackathonRoute, requireHackathonAdminRole, adminListHackathons);
router.post("/admin/hackathons", protectHackathonRoute, requireHackathonAdminRole, adminCreateHackathon);
router.put("/admin/hackathons/:id", protectHackathonRoute, requireHackathonAdminRole, adminUpdateHackathon);
router.delete("/admin/hackathons/:id", protectHackathonRoute, requireHackathonAdminRole, adminDeleteHackathon);
router.get("/admin/hackathons/logs", protectHackathonRoute, requireHackathonAdminRole, adminListHackathonLogs);

router.get("/admin/teams", protectHackathonRoute, requireHackathonAdminRole, adminListTeams);
router.delete("/admin/teams/:teamId", protectHackathonRoute, requireHackathonAdminRole, adminDeleteTeam);
router.get(
  "/admin/teams/export-xlsx",
  protectHackathonRoute,
  requireHackathonAdminRole,
  adminExportTeamsExcel
);
import multer from "multer";

const DANGEROUS_EXTENSIONS = /\.(exe|bat|cmd|sh|vbs|msi|dll|scr|com|pif)$/i;

const mailUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (DANGEROUS_EXTENSIONS.test(file.originalname)) {
      return cb(new Error("Executable attachments are not permitted for security reasons."));
    }
    cb(null, true);
  },
});

router.get("/admin/students", protectHackathonRoute, requireHackathonAdminRole, adminListRegisteredStudents);
router.post(
  "/admin/send-mail",
  protectHackathonRoute,
  requireHackathonAdminRole,
  mailUpload.array("attachments", 5),
  adminSendTeamMail
);
router.get("/admin/email-logs", protectHackathonRoute, requireHackathonAdminRole, getAdminEmailLogs);

router.get("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminGetProblems);
router.post("/admin/problems", protectHackathonRoute, requireHackathonAdminRole, adminAddProblem);
router.put("/admin/problems/:id", protectHackathonRoute, requireHackathonAdminRole, adminUpdateProblem);
router.delete("/admin/problems/:id", protectHackathonRoute, requireHackathonAdminRole, adminDeleteProblem);

router.get("/admin/submissions", protectHackathonRoute, requireHackathonAdminRole, adminListSubmissions);
router.get(
  "/admin/submissions/export-xlsx",
  protectHackathonRoute,
  requireHackathonAdminRole,
  adminExportSubmissionsExcel
);
router.post("/admin/submissions/:id/status", protectHackathonRoute, requireHackathonAdminRole, adminSetSubmissionStatus);
router.get("/admin/payment-details", protectHackathonRoute, requireHackathonAdminRole, adminListPaymentDetails);
router.get(
  "/admin/payment-details/export-xlsx",
  protectHackathonRoute,
  requireHackathonAdminRole,
  adminExportPaymentDetailsExcel
);
router.post(
  "/admin/payment-details/:id/verify",
  protectHackathonRoute,
  requireHackathonAdminRole,
  adminVerifyPaymentDetail
);

// Hackathon admin account management (default admin only)
router.get("/admin/users", protectHackathonRoute, requireHackathonAdminRole, listHackathonAdmins);
router.post("/admin/users", protectHackathonRoute, requireHackathonAdminRole, createHackathonAdmin);
router.put("/admin/users/:id", protectHackathonRoute, requireHackathonAdminRole, updateHackathonAdmin);
router.delete("/admin/users/:id", protectHackathonRoute, requireHackathonAdminRole, deleteHackathonAdmin);

router.get("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminListMentors);
router.get("/admin/mentors/export-xlsx", protectHackathonRoute, requireHackathonAdminRole, adminExportMentorsExcel);
router.post("/admin/mentors", protectHackathonRoute, requireHackathonAdminRole, adminCreateMentor);
router.put("/admin/mentors/:id", protectHackathonRoute, requireHackathonAdminRole, adminUpdateMentor);
router.delete("/admin/mentors/:id", protectHackathonRoute, requireHackathonAdminRole, adminDeleteMentor);
router.post("/admin/mentors/assign", protectHackathonRoute, requireHackathonAdminRole, adminAssignMentor);

router.post("/admin/winners/select", protectHackathonRoute, requireHackathonAdminRole, adminSelectWinner);

// Reviewer workspace endpoints
import { getReviewerTeams, reviewAbstraction } from "../../controllers/hackathon/hackathonReviewer.controller.js";
router.get("/reviewer/teams", protectHackathonRoute, getReviewerTeams);
router.post("/reviewer/review-abstraction", protectHackathonRoute, reviewAbstraction);

// Cluster workspace & Admin Clusteral Approval endpoints
import {
  getClusterTeams,
  gradeClusterTeam,
  getAdminClusterTeams,
  adminApproveClusterTeam,
  getClusterFacultyList,
  sendClusterFacultyEmails,
} from "../../controllers/hackathon/hackathonCluster.controller.js";

router.get("/cluster/teams", protectHackathonRoute, getClusterTeams);
router.post("/cluster/grade", protectHackathonRoute, gradeClusterTeam);
router.get("/admin/cluster-teams", protectHackathonRoute, requireHackathonAdminRole, getAdminClusterTeams);
router.get("/cluster/admin/teams", protectHackathonRoute, requireHackathonAdminRole, getAdminClusterTeams);
router.post("/admin/cluster-approve", protectHackathonRoute, requireHackathonAdminRole, adminApproveClusterTeam);
router.post("/cluster/admin/approve", protectHackathonRoute, requireHackathonAdminRole, adminApproveClusterTeam);
router.get("/admin/cluster-faculty-list", protectHackathonRoute, requireHackathonAdminRole, getClusterFacultyList);
router.post("/admin/send-cluster-faculty-emails", protectHackathonRoute, requireHackathonAdminRole, sendClusterFacultyEmails);


// System Diagnostics & Self-Healing Auto-Update endpoints
import {
  getSystemDiagnostics,
  runAutoUpdates,
  createDbSnapshot,
  listDbSnapshots,
  restoreDbSnapshot,
} from "../../controllers/hackathon/hackathonSystemDiagnostic.controller.js";

router.get("/admin/system-diagnostic", protectHackathonRoute, requireHackathonAdminRole, getSystemDiagnostics);
router.get("/admin/system-diagnostics", protectHackathonRoute, requireHackathonAdminRole, getSystemDiagnostics);
router.post("/admin/system-diagnostic/auto-update", protectHackathonRoute, requireHackathonAdminRole, runAutoUpdates);
router.post("/admin/system-diagnostic/db-snapshot", protectHackathonRoute, requireHackathonAdminRole, createDbSnapshot);
router.get("/admin/system-diagnostic/db-snapshots", protectHackathonRoute, requireHackathonAdminRole, listDbSnapshots);
router.post("/admin/system-diagnostic/db-snapshot/restore", protectHackathonRoute, requireHackathonAdminRole, restoreDbSnapshot);
// Volunteer Check-in Portal & Live Attendance (Phase 14.18)
import {
  volunteerScanTeam,
  volunteerCheckInTeam,
  volunteerListAttendance,
} from "../../controllers/hackathon/hackathonVolunteer.controller.js";

router.get("/volunteer/scan", protectHackathonRoute, requireHackathonVolunteerOrAdminRole, volunteerScanTeam);
router.post("/volunteer/check-in", protectHackathonRoute, requireHackathonVolunteerOrAdminRole, volunteerCheckInTeam);
router.get("/volunteer/attendance", protectHackathonRoute, requireHackathonVolunteerOrAdminRole, volunteerListAttendance);

// Announcements SSE & REST (Phase 14.13)
import {
  streamAnnouncements,
  getActiveAnnouncements,
  publishAnnouncement,
  deleteAnnouncement,
} from "../../controllers/hackathon/hackathonAnnouncement.controller.js";

router.get("/announcements/stream", streamAnnouncements);
router.get("/announcements", getActiveAnnouncements);
router.post("/admin/announcement", protectHackathonRoute, requireHackathonAdminRole, publishAnnouncement);
router.post("/admin/announcements", protectHackathonRoute, requireHackathonAdminRole, publishAnnouncement);
router.delete("/admin/announcements/:id", protectHackathonRoute, requireHackathonAdminRole, deleteAnnouncement);

// Admin Team Management (Phase 14.1)
import {
  adminCreateTeam,
  adminUpdateTeam,
  adminAddTeamMember,
  adminRemoveTeamMember,
} from "../../controllers/hackathon/hackathonTeamAdmin.controller.js";

router.post("/admin/teams/create", protectHackathonRoute, requireHackathonAdminRole, adminCreateTeam);
router.put("/admin/teams/:teamId", protectHackathonRoute, requireHackathonAdminRole, adminUpdateTeam);
router.post("/admin/teams/:teamId/members", protectHackathonRoute, requireHackathonAdminRole, adminAddTeamMember);
router.delete("/admin/teams/:teamId/members/:userId", protectHackathonRoute, requireHackathonAdminRole, adminRemoveTeamMember);

// Volunteers Management (Phase 14.20 & 14.25)
import {
  listVolunteers,
  createVolunteer,
  deleteVolunteer,
} from "../../controllers/hackathon/hackathonAdminUsers.controller.js";

router.get("/admin/volunteers", protectHackathonRoute, requireHackathonAdminRole, listVolunteers);
router.post("/admin/volunteers", protectHackathonRoute, requireHackathonAdminRole, createVolunteer);
router.delete("/admin/volunteers/:id", protectHackathonRoute, requireHackathonAdminRole, deleteVolunteer);

// Attendance Desk (Phase 14.21)
import {
  adminGetAttendance,
  adminToggleAttendance,
} from "../../controllers/hackathon/hackathonVolunteer.controller.js";

router.get("/admin/attendance", protectHackathonRoute, requireHackathonAdminRole, adminGetAttendance);
router.post("/admin/attendance/toggle", protectHackathonRoute, requireHackathonAdminRole, adminToggleAttendance);

// Public Project Showcase & Innovation Gallery (Phase 14.29)
import HackathonTeam from "../../models/hackathon/HackathonTeamModel.js";
import HackathonTeamMember from "../../models/hackathon/HackathonTeamMemberModel.js";
import HackathonUser from "../../models/hackathon/HackathonUserModel.js";
import Hackathon from "../../models/hackathon/HackathonModel.js";
import HackathonSubmission from "../../models/hackathon/HackathonSubmissionModel.js";

router.get("/hackathons/:slug/showcase", async (req, res) => {
  try {
    const { slug } = req.params;
    let hackathon = await Hackathon.findOne({ where: { slug } });
    if (!hackathon && /^\d+$/.test(slug)) {
      hackathon = await Hackathon.findByPk(Number(slug));
    }
    const hackathonId = hackathon?.id || 1;

    const teams = await HackathonTeam.findAll({
      where: { hackathonId, abstractionStatus: "approved" },
      limit: 50,
    });

    const enriched = await Promise.all(
      teams.map(async (t) => {
        const members = await HackathonTeamMember.findAll({ where: { teamId: t.id } });
        const memberUsers = await Promise.all(
          members.map((m) => HackathonUser.findByPk(m.userId, { attributes: ["fullName", "college", "branch"] }))
        );
        const sub = await HackathonSubmission.findOne({ where: { teamId: t.id } });
        return {
          id: t.id,
          teamName: t.teamName,
          theme: t.theme,
          topic: t.topic,
          description: t.description,
          cluster: t.cluster,
          githubRepo: sub?.githubRepo || sub?.projectLink || null,
          title: sub?.title || t.topic || t.teamName,
          members: memberUsers.map((u) => u?.fullName).filter(Boolean),
          college: memberUsers[0]?.college || "Kumaraguru College of Technology",
          isWinner: sub?.isWinner || false,
          awardCategory: sub?.awardCategory || (sub?.isWinner ? "Champion" : null),
        };
      })
    );

    let galleryItems = [];
    if (hackathon?.gallery) {
      try {
        galleryItems = typeof hackathon.gallery === "string" ? JSON.parse(hackathon.gallery) : hackathon.gallery;
      } catch {}
    }

    return res.json({
      success: true,
      hackathon: {
        id: hackathon?.id,
        name: hackathon?.name || "AICTE IDEA Lab Hackathon",
        slug: hackathon?.slug || slug,
        gallery: galleryItems,
      },
      showcase: enriched,
    });
  } catch (error) {
    console.error("Error in showcase route:", error);
    return res.status(500).json({ message: "Failed to load showcase" });
  }
});

export default router;

