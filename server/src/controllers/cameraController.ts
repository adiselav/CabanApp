import { Request, Response } from "express";
import { prisma } from "../server";
import { Rol } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: Rol;
  };
}

export const insertCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { nrCamera, nrPersoane, pretNoapte, descriere, idCabana } = req.body;

    if (!nrCamera || !nrPersoane || !pretNoapte || !idCabana) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const camera = await prisma.camera.create({
      data: { nrCamera, nrPersoane, pretNoapte, descriere, idCabana },
    });

    return res.status(201).json(camera);
  } catch (error: any) {
    console.error("Insert camera error:", error);
    return res.status(500).json({ error: "Server error" });
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
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getCameraById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const camera = await prisma.camera.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!camera) {
      return res.status(404).json({ error: "Camera not found" });
    }
    return res.status(200).json(camera);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { nrCamera, nrPersoane, pretNoapte, descriere, idCabana } = req.body;

    const updatedCamera = await prisma.camera.update({
      where: { id: Number(req.params.id) },
      data: { nrCamera, nrPersoane, pretNoapte, descriere, idCabana },
    });

    return res.status(200).json(updatedCamera);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteCamera = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    await prisma.camera.delete({
      where: { id: Number(req.params.id) },
    });
    return res.status(200).json({ message: "Camera deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllCamereByCabanaId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { idCabana } = req.params;
    if (!idCabana) {
      return res.status(400).json({ error: "Missing idCabana parameter" });
    }
    const camere = await prisma.camera.findMany({
      where: { idCabana: Number(idCabana) },
    });
    if (camere.length === 0) {
      return res.status(404).json({ error: "No camere found for this cabana" });
    }
    return res.status(200).json(camere);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
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

    const camereDisponibile = await prisma.camera.findMany({
      where: {
        id: {
          notIn: Array.from(camereIndisponibile),
        },
      },
    });

    return res.status(200).json(camereDisponibile);
  } catch (error) {
    console.error("Get available camere error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAvailableCamereByCabana = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { idCabana } = req.params;
    const { dataSosire, dataPlecare, nrPersoane } = req.query;

    if (!idCabana || !dataSosire || !dataPlecare) {
      return res.status(400).json({ error: "Missing parameters" });
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

    const camereDisponibile = await prisma.camera.findMany({
      where: {
        idCabana: Number(idCabana),
        id: {
          notIn: Array.from(camereIndisponibile),
        },
        ...(nrPersoane
          ? { nrPersoane: { gte: Number(nrPersoane) } }
          : {}),
      },
    });

    return res.status(200).json(camereDisponibile);
  } catch (error) {
    console.error("getAvailableCamereByCabana error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
