import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
import {
  insertMedia,
  getAllMedia,
  getMediaById,
  updateMedia,
  deleteMedia,
} from "../controllers/mediaController";
import { upload } from "../middlewares/multer";

const router = express.Router();

router.post("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), upload.single("file"), insertMedia);
router.get("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAllMedia);
router.get("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getMediaById);
router.put("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), updateMedia);
router.delete("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), deleteMedia);

export default router;
