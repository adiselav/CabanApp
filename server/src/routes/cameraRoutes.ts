import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
import {
  insertCamera,
  getAllCamere,
  getCameraById,
  updateCamera,
  deleteCamera,
  getAllCamereByCabanaId,
  getAvailableCamere,
  getAvailableCamereByCabana,
} from "../controllers/cameraController";

const router = express.Router();

router.post("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), insertCamera);
router.get("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAllCamere);
router.get("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getCameraById);
router.put("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), updateCamera);
router.delete("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), deleteCamera);
router.get("/cabana/:idCabana", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAllCamereByCabanaId);
router.get("/available", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAvailableCamere);
router.get("/available/cabana/:idCabana", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAvailableCamereByCabana);

export default router;







