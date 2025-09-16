import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
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
router.post("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), insertRezervare); // CREATE
router.get("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAllRezervari); // READ all
router.get("/utilizator", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getRezervareByUtilizatorId);
router.get("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getRezervareById); // READ one
router.put("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), updateRezervare); // UPDATE
router.delete("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), deleteRezervare); // DELETE

export default router;