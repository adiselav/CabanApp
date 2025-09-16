import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
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

// C.R.U.D create, read, update, and delete
router.post("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), insertCamera); // CREATE
router.get("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getAllCamere); // READ all
router.get("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getCameraById); // READ one
router.put("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), updateCamera); // UPDATE
router.delete("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), deleteCamera); // DELETE

// Extra endpoints
router.get(
  "/cabana/:idCabana",
  requireAuth,
  allowRoles("PROPRIETAR", "ADMIN", "TURIST"),
  getAllCamereByCabanaId
);
router.get("/available", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getAvailableCamere);
router.get(
  "/available/cabana/:idCabana",
  requireAuth,
  allowRoles("PROPRIETAR", "ADMIN", "TURIST"),
  getAvailableCamereByCabana
);

export default router;
