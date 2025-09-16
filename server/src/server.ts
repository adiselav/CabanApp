import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client"; // Prisma Client pentru PostgreSQL
import helmet from "helmet";
import path from "path";
import rateLimit from "express-rate-limit";

//Importul rutelor
import utilizatorRoutes from "./routes/utilizatorRoutes";
import cabanaRoutes from "./routes/cabanaRoutes";
import cameraRoutes from "./routes/cameraRoutes";
import recenzieRoutes from "./routes/recenzieRoutes";
import mediaRoutes from "./routes/mediaRoutes";
import rezervareRoutes from "./routes/rezervareRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config(); // Încarcă variabilele din .env
export const prisma = new PrismaClient(); // Prisma Client
const app = express();
const PORT = process.env.PORT || 5001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// Middleware-uri
const JSON_LIMIT = process.env.JSON_LIMIT || "1mb";
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // max 100 requests per 15 min

// CORS
app.use(
  cors({
    origin: [`http://localhost:${FRONTEND_PORT}`],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Permite preflight pentru orice endpoint
app.options("*", cors());

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.resolve("uploads"))
);


// Montare modulară a rutelor
app.use("/utilizatori", utilizatorRoutes);
app.use("/cabane", cabanaRoutes);
app.use("/camere", cameraRoutes);
app.use("/recenzie", recenzieRoutes);
app.use("/media", mediaRoutes);
app.use("/rezervare", rezervareRoutes);
app.use("/auth", authRoutes);

// modele(tabela entitate), controlere(C.R.U.D. = CREATE, READ, UPDATE, DELETE), route
// GET-READ POST-CREATE PUT-UPDATE PATCH-UPDATE DELETE-DELETE
// prima ruta ever
// Test ruta principală
app.get("/", (req: Request, res: Response) => {
  res.send(
    "Hello, World! I'm TypeScript + Node + Express + Prisma + PostgreSQL Server!"
  );
});

// Catch unregistered routes
// Handling 'Route not found'
// Gestionare 404 (Route Not Found)
app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Global error handler:");
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    error: "Something went wrong",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Unable to connect: ", error);
    process.exit(1);
  }
};
startServer();

process.on("SIGINT", async () => {
  console.log("Received SIGINT. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("Received SIGTERM. Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
