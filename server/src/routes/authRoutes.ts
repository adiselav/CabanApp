import express from "express";
import { register, login } from "../controllers/authController";
import { loginRateLimiter } from "../middlewares/rateLimitMiddleware";

const router = express.Router();

router.post("/register", register);

router.post("/login", loginRateLimiter, login);

export default router;