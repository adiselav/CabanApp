import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";
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
router.post("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), insertRecenzie); // CREATE
router.get("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getAllRecenzii); // READ all
router.get("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getRecenzieById); // READ one
router.get(
  "/cabana/:idCabana",
  requireAuth,
  allowRoles("PROPRIETAR", "ADMIN", "TURIST"),
  getRecenziiByCabanaId
);
router.put("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), updateRecenzie); // UPDATE
router.delete("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), deleteRecenzie); // DELETE

export default router;
