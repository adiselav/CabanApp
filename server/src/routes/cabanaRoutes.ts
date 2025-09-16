import express from "express";
import { requireAuth } from "../middlewares/authMiddleware";
import { allowRoles } from "../middlewares/roleMiddleware";

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
router.post("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN"), insertCabana); // CREATE
router.get(
  "/disponibilitate",
  requireAuth,
  allowRoles("PROPRIETAR", "ADMIN", "TURIST"),
  getCabaneWithAvailability
);
router.get("/", requireAuth, allowRoles("PROPRIETAR", "ADMIN"), getAllCabane); // READ all
router.get("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN", "TURIST"), getCabanaById); // READ one
router.put("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN"), updateCabana); // UPDATE
router.delete("/:id", requireAuth, allowRoles("PROPRIETAR", "ADMIN"), deleteCabana); // DELETE

export default router;
