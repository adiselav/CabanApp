import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import {
  insertRezervare,
  getAllRezervari,
  getRezervareById,
  updateRezervare,
  deleteRezervare,
  getRezervareByUtilizatorId,
} from "../controllers/rezervareController";

const router = express.Router();

// C.R.U.D create, read, update, and delete
router.post("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), insertRezervare); // CREATE
router.get("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getAllRezervari); // READ all
router.get(
  "/utilizator",
  requireAuth,
  allowRoles("PROPRIETAR", "ADMIN", "TURIST"),
  getRezervareByUtilizatorId
);
router.get("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getRezervareById); // READ one
router.put("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), updateRezervare); // UPDATE
router.delete("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), deleteRezervare); // DELETE

export default router;
