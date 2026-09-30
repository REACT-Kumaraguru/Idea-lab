import express from "express";
import {
  getClusterTeams,
  gradeClusterTeam,
  getAdminClusterTeams,
  adminApproveClusterTeam,
  getClusterFacultyList,
  sendClusterFacultyEmails,
} from "../../controllers/hackathon/hackathonCluster.controller.js";

const router = express.Router();

router.get("/teams", getClusterTeams);
router.post("/grade", gradeClusterTeam);
router.get("/admin/teams", getAdminClusterTeams);
router.post("/admin/approve", adminApproveClusterTeam);
router.get("/admin/faculty-list", getClusterFacultyList);
router.post("/admin/send-faculty-emails", sendClusterFacultyEmails);

export default router;
