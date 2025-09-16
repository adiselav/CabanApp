import { Request, Response, NextFunction } from "express";

// Tip local stabil (aliniat cu enumul din schema.prisma)
type Rol = "ADMIN" | "PROPRIETAR" | "TURIST";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: Rol; // "ADMIN" | "PROPRIETAR" | "TURIST"
  };
}

export const allowRoles = (...allowedRoles: Rol[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: "Unauthorized: Missing user info" });
        return;
      }

      if (!allowedRoles.includes(user.rol)) {
        res.status(403).json({ error: "Forbidden: Insufficient role" });
        return;
      }

      next();
    } catch (err) {
      console.error("Role middleware error:", err);
      res.status(500).json({ error: "Internal server error in role check" });
    }
  };
};
