import { Request, Response } from "express";
import { prisma } from "../server";
import { Decimal } from "@prisma/client/runtime/library";
import { differenceInCalendarDays } from "date-fns";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
  };
}

export const insertRezervare = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { dataSosire, dataPlecare, nrPersoane, idCamere = [] } = req.body;
    const userId = req.user?.id;
    if (
      !userId ||
      !dataSosire ||
      !dataPlecare ||
      !nrPersoane ||
      idCamere.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const camere = await prisma.camera.findMany({
      where: { id: { in: idCamere } },
    });
    if (camere.length !== idCamere.length) {
      return res.status(404).json({ error: "One or more camere not found" });
    }
    const idCabaneUnice = new Set(camere.map((camera) => camera.idCabana));
    if (idCabaneUnice.size > 1) {
      return res
        .status(400)
        .json({ error: "All rooms must be from the same cabana" });
    }
    const zile = differenceInCalendarDays(
      new Date(dataPlecare),
      new Date(dataSosire)
    );
    if (zile <= 0) {
      return res.status(400).json({ error: "Invalid stay interval" });
    }
    const rezervariConflict = await prisma.rezervare.findMany({
      where: {
        camere: {
          some: {
            id: { in: idCamere },
          },
        },
        AND: [
          { dataSosire: { lt: new Date(dataPlecare) } },
          { dataPlecare: { gt: new Date(dataSosire) } },
        ],
      },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
    });
    if (rezervariConflict.length > 0) {
      return res.status(409).json({
        error:
          "Conflict: una sau mai multe camere sunt deja rezervate în acest interval",
        conflicte: rezervariConflict.map((r) => ({
          idRezervare: r.id,
          dataSosire: r.dataSosire,
          dataPlecare: r.dataPlecare,
          camere: r.camere.map((c) => c.id),
        })),
      });
    }
    let pretTotal = new Decimal(0);
    camere.forEach((camera) => {
      const pret =
        camera.pretNoapte instanceof Decimal
          ? camera.pretNoapte
          : new Decimal(camera.pretNoapte);
      pretTotal = pretTotal.plus(pret.mul(zile));
    });
    const rezervare = await prisma.rezervare.create({
      data: {
        dataSosire: new Date(dataSosire),
        dataPlecare: new Date(dataPlecare),
        nrPersoane,
        pretTotal,
        idUtilizator: userId,
      },
    });
    await prisma.rezervare.update({
      where: { id: rezervare.id },
      data: {
        camere: {
          connect: idCamere.map((id: number) => ({ id })),
        },
      },
    });
    const rezervareCompleta = await prisma.rezervare.findUnique({
      where: { id: rezervare.id },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
    });
    return res.status(201).json({
      message: "Rezervare creată cu succes",
      rezervare: rezervareCompleta,
    });
  } catch (error: any) {
    console.error("Insert rezervare error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllRezervari = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const rezervari = await prisma.rezervare.findMany({
      include: {
        camere: {
          include: { cabana: true }
        },
        utilizator: {
          select: {
            id: true,
            nume: true,
            prenume: true,
            email: true
          }
        }
      },
    });
    if (rezervari.length === 0) {
      return res.status(404).json({ error: "No Rezervari found" });
    }
    return res.status(200).json(rezervari);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRezervareById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;
    const rezervare = await prisma.rezervare.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
    });

    if (!rezervare) {
      return res.status(404).json({ error: "Rezervare not found" });
    }

    if (rezervare.idUtilizator !== userId) {
      return res.status(403).json({ error: "Forbidden: Not your rezervare" });
    }

    return res.status(200).json(rezervare);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateRezervare = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const rezervareId = Number(req.params.id);
    const { dataSosire, dataPlecare, nrPersoane, idCamere = [] } = req.body;
    const userId = req.user?.id;

    if (
      !userId ||
      !dataSosire ||
      !dataPlecare ||
      !nrPersoane ||
      idCamere.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingRezervare = await prisma.rezervare.findUnique({
      where: { id: rezervareId },
    });
    if (!existingRezervare) {
      return res.status(404).json({ error: "Rezervare not found" });
    }
    if (existingRezervare.idUtilizator !== userId) {
      return res.status(403).json({ error: "Forbidden: Not your rezervare" });
    }

    const camere = await prisma.camera.findMany({
      where: { id: { in: idCamere } },
    });

    if (camere.length !== idCamere.length) {
      return res.status(404).json({ error: "One or more camere not found" });
    }

    const idCabaneUnice = new Set(camere.map((camera) => camera.idCabana));
    if (idCabaneUnice.size > 1) {
      return res
        .status(400)
        .json({ error: "All rooms must be from the same cabana" });
    }

    const zile = differenceInCalendarDays(
      new Date(dataPlecare),
      new Date(dataSosire)
    );
    if (zile <= 0) {
      return res.status(400).json({ error: "Invalid stay interval" });
    }

    const rezervariConflict = await prisma.rezervare.findMany({
      where: {
        id: { not: rezervareId },
        camere: {
          some: {
            id: { in: idCamere },
          },
        },
        AND: [
          { dataSosire: { lt: new Date(dataPlecare) } },
          { dataPlecare: { gt: new Date(dataSosire) } },
        ],
      },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
    });

    if (rezervariConflict.length > 0) {
      return res.status(409).json({
        error:
          "Conflict: camerele selectate sunt deja rezervate în acest interval",
        conflicte: rezervariConflict.map((r) => ({
          idRezervare: r.id,
          dataSosire: r.dataSosire,
          dataPlecare: r.dataPlecare,
          camere: r.camere.map((c) => c.id),
        })),
      });
    }

    let pretTotal = new Decimal(0);
    camere.forEach((camera) => {
      pretTotal = pretTotal.plus(camera.pretNoapte.mul(zile));
    });

    const updatedRezervare = await prisma.rezervare.update({
      where: { id: rezervareId },
      data: {
        dataSosire: new Date(dataSosire),
        dataPlecare: new Date(dataPlecare),
        nrPersoane,
        pretTotal,
        idUtilizator: userId,
        camere: {
          set: idCamere.map((id: number) => ({ id })),
        },
      },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
    });

    return res.status(200).json(updatedRezervare);
  } catch (error) {
    console.error("Update rezervare error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteRezervare = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const rezervareId = Number(req.params.id);
    const userId = req.user?.id;

    const rezervare = await prisma.rezervare.findUnique({
      where: { id: rezervareId },
    });

    if (!rezervare) {
      return res.status(404).json({ error: "Rezervare not found" });
    }

    if (rezervare.idUtilizator !== userId) {
      return res.status(403).json({ error: "Forbidden: Not your rezervare" });
    }

    await prisma.rezervare.delete({
      where: { id: rezervareId },
    });

    return res.status(200).json({ message: "Rezervare deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRezervareByUtilizatorId = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rezervari = await prisma.rezervare.findMany({
      where: { idUtilizator: userId },
      include: {
        camere: {
          include: { cabana: true },
        },
      },
      orderBy: { dataSosire: "asc" },
    });

    const serializedRezervari = rezervari.map((rez) => ({
      ...rez,
      created_at: rez.createdAt.toISOString(),
    }));

    return res.status(200).json(serializedRezervari);
  } catch (error) {
    console.error("getRezervareByUtilizatorId error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
