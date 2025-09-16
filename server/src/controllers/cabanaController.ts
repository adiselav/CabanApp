import { Request, Response } from "express";
import { prisma } from "../server";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
  };
}

export const insertCabana = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const {
      denumire,
      locatie,
      altitudine,
      contactEmail,
      contactTelefon,
      descriere,
    } = req.body;
    const idUtilizator = req.user?.id;

    if (
      !denumire ||
      !locatie ||
      !altitudine ||
      !contactEmail ||
      !contactTelefon
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!idUtilizator) {
      return res.status(401).json({ error: "Unauthorized: User ID missing" });
    }

    const cabana = await prisma.cabana.create({
      data: {
        denumire,
        locatie,
        altitudine,
        contactEmail,
        contactTelefon,
        descriere,
        idUtilizator,
      },
    });

    return res.status(201).json(cabana);
  } catch (error: any) {
    console.error("Insert cabana error:", error.message);
    return res.status(500).json({
      error: "Server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getAllCabane = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const cabane = await prisma.cabana.findMany();
    if (cabane.length === 0) {
      return res.status(404).json({ error: "No cabane found" });
    }
    return res.status(200).json(cabane);
  } catch (error: any) {
    console.error("Get all cabane error:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", message: error.message });
  }
};

export const getCabanaById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const cabana = await prisma.cabana.findUnique({
      where: { id },
      include: { camere: true },
    });

    if (!cabana) {
      return res.status(404).json({ error: "Cabana not found" });
    }

    return res.status(200).json(cabana);
  } catch (error: any) {
    console.error("Get cabana by ID error:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", message: error.message });
  }
};

export const updateCabana = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.rol === "ADMIN";

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const existing = await prisma.cabana.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Cabana not found" });
    }

    if (!isAdmin && existing.idUtilizator !== userId) {
      return res.status(403).json({ error: "Forbidden: Not your cabana" });
    }

    const {
      denumire,
      locatie,
      altitudine,
      contactEmail,
      contactTelefon,
      descriere,
    } = req.body;

    const updatedCabana = await prisma.cabana.update({
      where: { id },
      data: {
        denumire,
        locatie,
        altitudine,
        contactEmail,
        contactTelefon,
        descriere,
      },
    });

    return res.status(200).json(updatedCabana);
  } catch (error: any) {
    console.error("Update cabana error:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", message: error.message });
  }
};

export const deleteCabana = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    const userId = req.user?.id;
    const isAdmin = req.user?.rol === "ADMIN";

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const cabana = await prisma.cabana.findUnique({ where: { id } });
    if (!cabana) {
      return res.status(404).json({ error: "Cabana not found" });
    }

    if (!isAdmin && cabana.idUtilizator !== userId) {
      return res.status(403).json({ error: "Forbidden: Not your cabana" });
    }

    await prisma.cabana.delete({ where: { id } });
    return res.status(200).json({ message: "Cabana deleted successfully" });
  } catch (error: any) {
    console.error("Delete cabana error:", error.message);
    return res
      .status(500)
      .json({ error: "Server error", message: error.message });
  }
};

export const getCabaneWithAvailability = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { dataSosire, dataPlecare, locatie, nrPersoane } = req.query;

    if (!dataSosire || !dataPlecare) {
      return res
        .status(400)
        .json({ error: "Missing required date parameters" });
    }

    const startDate = new Date(dataSosire as string);
    const endDate = new Date(dataPlecare as string);

    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const rezervariConflict = await prisma.rezervare.findMany({
      where: {
        AND: [
          { dataSosire: { lt: endDate } },
          { dataPlecare: { gt: startDate } },
        ],
      },
      select: {
        camere: {
          select: { id: true },
        },
      },
    });

    const camereIndisponibile = new Set(
      rezervariConflict.flatMap((rez) => rez.camere.map((c) => c.id))
    );

    const cabane = await prisma.cabana.findMany({
      where:
        typeof locatie === "string" && locatie.trim() !== ""
          ? { locatie: { contains: locatie, mode: "insensitive" } }
          : undefined,
      include: {
        camere: true,
        _count: {
          select: { recenzii: true },
        },
      },
    });

    const result = cabane.map((cabana) => {
      let camereDisponibile = cabana.camere.filter(
        (camera) => !camereIndisponibile.has(camera.id)
      );

      if (nrPersoane && !isNaN(Number(nrPersoane))) {
        camereDisponibile = camereDisponibile.filter(
          (camera) => camera.nrPersoane >= Number(nrPersoane)
        );
      }

      return {
        id: cabana.id,
        denumire: cabana.denumire,
        locatie: cabana.locatie,
        altitudine: cabana.altitudine,
        descriere: cabana.descriere,
        contactEmail: cabana.contactEmail,
        contactTelefon: cabana.contactTelefon,
        scorRecenzii: cabana.scorRecenzii,
        nrRecenzii: cabana._count.recenzii,
        camere: camereDisponibile.length > 0 ? camereDisponibile : "occupied",
      };
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Error checking availability:", error.message);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
