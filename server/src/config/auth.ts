import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = getEnv(
  "JWT_EXPIRES_IN"
) as jwt.SignOptions["expiresIn"];
