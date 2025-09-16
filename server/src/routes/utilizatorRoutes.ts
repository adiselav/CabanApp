import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import { Rol } from "@prisma/client";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/utilizatorController";

const router = express.Router();

// C.R.U.D create, read, update, and delete
router.get("/", requireAuth, allowRoles(Rol.TURIST, Rol.ADMIN, Rol.PROPRIETAR), getAllUsers); // READ all
router.get("/:id", requireAuth, allowRoles(Rol.TURIST, Rol.ADMIN, Rol.PROPRIETAR), getUserById); // READ one
router.put("/:id", requireAuth, allowRoles(Rol.TURIST, Rol.ADMIN, Rol.PROPRIETAR), updateUser); // UPDATE
router.delete("/:id", requireAuth, allowRoles(Rol.TURIST, Rol.ADMIN, Rol.PROPRIETAR), deleteUser); // DELETE

export default router;