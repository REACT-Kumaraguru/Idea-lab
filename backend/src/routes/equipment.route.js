
import express from "express";
import { protectAdminRoute } from "../middleware/auth.middleware.js";
import { createEquipment, getAllEquipment, updateEquipment, deleteEquipment, toggleEquipmentStatus } from "../controllers/equipment.controller.js";
import { upload } from "../lib/upload.js"; // Import configured multer instance

const router = express.Router();

router.post("/add", protectAdminRoute, upload.single("image"), createEquipment);
router.get("/", getAllEquipment);
router.patch("/:id/toggle", protectAdminRoute, toggleEquipmentStatus);
router.put("/:id/toggle", protectAdminRoute, toggleEquipmentStatus);
router.put("/:id", protectAdminRoute, upload.single("image"), updateEquipment);
router.delete("/:id", protectAdminRoute, deleteEquipment);

export default router;
