import { Request, Response } from "express";
import { prisma } from "../server";

type UserRole = "ADMIN" | "PROPRIETAR" | "TURIST";
type RezWithCamere = { camere: { id: number }[] };

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: UserRole;
  };
}

export const insertCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { nrCamera, nrPersoane, pretNoapte, descriere, idCabana } = req.body;

    if (
      nrCamera === undefined ||
      nrPersoane === undefined ||
      pretNoapte === undefined ||
      idCabana === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const camera = await prisma.camera.create({
      data: {
        nrCamera: Number(nrCamera),
        nrPersoane: Number(nrPersoane),
        pretNoapte: Number(pretNoapte),
        descriere: descriere ?? null,
        idCabana: Number(idCabana),
      },
    });

    return res.status(201).json(camera);
  } catch (error: any) {
    console.error("Insert camera error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const getAllCamere = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const camere = await prisma.camera.findMany();
    if (camere.length === 0) {
      return res.status(404).json({ error: "No camere found" });
    }
    return res.status(200).json(camere);
  } catch (error: any) {
    console.error("Get all camere error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const getCameraById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const camera = await prisma.camera.findUnique({ where: { id } });
    if (!camera) {
      return res.status(404).json({ error: "Camera not found" });
    }
    return res.status(200).json(camera);
  } catch (error: any) {
    console.error("Get camera by id error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const updateCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    const { nrCamera, nrPersoane, pretNoapte, descriere, idCabana } = req.body;

    const updatedCamera = await prisma.camera.update({
      where: { id },
      data: {
        ...(nrCamera !== undefined ? { nrCamera: Number(nrCamera) } : {}),
        ...(nrPersoane !== undefined ? { nrPersoane: Number(nrPersoane) } : {}),
        ...(pretNoapte !== undefined ? { pretNoapte: Number(pretNoapte) } : {}),
        ...(descriere !== undefined ? { descriere } : {}),
        ...(idCabana !== undefined ? { idCabana: Number(idCabana) } : {}),
      },
    });

    return res.status(200).json(updatedCamera);
  } catch (error: any) {
    console.error("Update camera error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const deleteCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid ID parameter" });
    }

    await prisma.camera.delete({ where: { id } });
    return res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error: any) {
    console.error("Delete camera error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const getAllCamereByCabanaId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const idCabana = Number(req.params.idCabana);
    if (isNaN(idCabana)) {
      return res.status(400).json({ error: "Invalid idCabana parameter" });
    }

    const camere = await prisma.camera.findMany({ where: { idCabana } });
    if (camere.length === 0) {
      return res.status(404).json({ error: "No camere found for this cabana" });
    }
    return res.status(200).json(camere);
  } catch (error: any) {
    console.error("Get camere by cabana error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const getAvailableCamere = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { dataSosire, dataPlecare } = req.query;

    if (!dataSosire || !dataPlecare) {
      return res.status(400).json({
        error: "Missing dataSosire or dataPlecare query parameters",
      });
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
        AND: [{ dataSosire: { lt: endDate } }, { dataPlecare: { gt: startDate } }],
      },
      select: {
        camere: { select: { id: true } },
      },
    });

    const camereIndisponibile = new Set<number>(
      (rezervariConflict as RezWithCamere[]).flatMap((rez: RezWithCamere) =>
        rez.camere.map((c: { id: number }) => c.id)
      )
    );

    const camereDisponibile = await prisma.camera.findMany({
      where: {
        id: { notIn: Array.from(camereIndisponibile) },
      },
    });

    return res.status(200).json(camereDisponibile);
  } catch (error: any) {
    console.error("Get available camere error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};

export const getAvailableCamereByCabana = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const idCabana = Number(req.params.idCabana);
    const { dataSosire, dataPlecare, nrPersoane } = req.query;

    if (isNaN(idCabana) || !dataSosire || !dataPlecare) {
      return res.status(400).json({ error: "Missing or invalid parameters" });
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
        AND: [{ dataSosire: { lt: endDate } }, { dataPlecare: { gt: startDate } }],
      },
      select: {
        camere: { select: { id: true } },
      },
    });

    const camereIndisponibile = new Set<number>(
      (rezervariConflict as RezWithCamere[]).flatMap((rez: RezWithCamere) =>
        rez.camere.map((c: { id: number }) => c.id)
      )
    );

    const camereDisponibile = await prisma.camera.findMany({
      where: {
        idCabana,
        id: { notIn: Array.from(camereIndisponibile) },
        ...(nrPersoane
          ? { nrPersoane: { gte: Number(nrPersoane) } }
          : {}),
      },
    });

    return res.status(200).json(camereDisponibile);
  } catch (error: any) {
    console.error("getAvailableCamereByCabana error:", error);
    return res.status(500).json({ error: "Server error", message: error?.message });
  }
};
