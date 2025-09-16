import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
import {
  insertRecenzie,
  getAllRecenzii,
  getRecenzieById,
  updateRecenzie,
  deleteRecenzie,
  getRecenziiByCabanaId,
} from "../controllers/recenzieController";

const router = express.Router();

// C.R.U.D create, read, update, and delete
router.post("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), insertRecenzie); // CREATE
router.get("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getAllRecenzii); // READ all
router.get("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getRecenzieById); // READ one

// requireAuth must come before allowRoles
router.get("/cabana/:idCabana", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getRecenziiByCabanaId);

router.put("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), updateRecenzie); // UPDATE
router.delete("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), deleteRecenzie);// DELETE

export default router;