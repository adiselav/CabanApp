import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
import {
  insertCabana,
  getAllCabane,
  getCabanaById,
  updateCabana,
  deleteCabana,
  getCabaneWithAvailability,
} from "../controllers/cabanaController";

const router = express.Router();

// C.R.U.D create, read, update, and delete
router.post("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN), insertCabana); // CREATE
router.get("/disponibilitate", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getCabaneWithAvailability); // AVAILABILITY
router.get("/", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN), getAllCabane); // READ all
router.get("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN, Rol.TURIST), getCabanaById); // READ one
router.put("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN), updateCabana); // UPDATE
router.delete("/:id", requireAuth, allowRoles(Rol.PROPRIETAR, Rol.ADMIN), deleteCabana); // DELETE

export default router;
