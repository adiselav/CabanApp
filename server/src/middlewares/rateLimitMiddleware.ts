import rateLimit from "express-rate-limit";

const maxAttemptsRaw = process.env.LOGIN_RATE_LIMIT_MAX;
const windowMsRaw = process.env.LOGIN_RATE_LIMIT_WINDOW_MS;

if (!maxAttemptsRaw) {
  throw new Error('LOGIN_RATE_LIMIT_MAX is not defined in the environment.');
}
if (!windowMsRaw) {
  throw new Error('LOGIN_RATE_LIMIT_WINDOW_MS is not defined in the environment.');
}

const maxAttempts = parseInt(maxAttemptsRaw, 10);
const windowMs = parseInt(windowMsRaw, 10);

if (isNaN(maxAttempts)) {
  throw new Error(`LOGIN_RATE_LIMIT_MAX must be a valid integer. Got: "${maxAttemptsRaw}"`);
}
if (isNaN(windowMs)) {
  throw new Error(`LOGIN_RATE_LIMIT_WINDOW_MS must be a valid integer. Got: "${windowMsRaw}"`);
}

export const loginRateLimiter = rateLimit({
  windowMs,
  max: maxAttempts,
  message: {
    error: "Prea multe încercări de conectare. Vă rugăm să încercați din nou după 15 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});