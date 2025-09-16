import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/utilizatorController";

const router = express.Router();

// C.R.U.D create, read, update, and delete
router.get("/", requireAuth, allowRoles("TURIST", "ADMIN", "PROPRIETAR"), getAllUsers); // READ all
router.get("/:id", requireAuth, allowRoles("TURIST", "ADMIN", "PROPRIETAR"), getUserById); // READ one
router.put("/:id", requireAuth, allowRoles("TURIST", "ADMIN", "PROPRIETAR"), updateUser); // UPDATE
router.delete("/:id", requireAuth, allowRoles("TURIST", "ADMIN", "PROPRIETAR"), deleteUser); // DELETE

export default router;
