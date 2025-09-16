import { Request, Response, NextFunction } from "express";
import { Rol } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: Rol;
  };
}

export const allowRoles = (...allowedRoles: Rol[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      console.log("User role:", user?.rol);

      if (!user) {
        console.warn("Access denied: Missing user on request object");
        res.status(401).json({ error: "Unauthorized: Missing user info" });
        return;
      }

      if (!allowedRoles.includes(user.rol)) {
        console.warn(
          `Access denied: User with role '${user.rol}' tried to access a restricted route`
        );
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
