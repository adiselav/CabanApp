import { Request, Response } from "express";
import { prisma } from "../server";
import type { Prisma } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
  };
}

const updateScorRecenzii = async (idCabana: number): Promise<void> => {
  const recenzii = await prisma.recenzie.findMany({
    where: { idCabana },
    select: { scor: true },
  });

  const total = recenzii.reduce(
    (acc: number, recenzie: { scor: number }) => acc + (recenzie?.scor ?? 0),
    0
  );
  const media = recenzii.length > 0 ? total / recenzii.length : 0;

  await prisma.cabana.update({
    where: { id: idCabana },
    data: { scorRecenzii: media },
  });
};

export const insertRecenzie = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { scor, descriere, idCabana, idUtilizator } = req.body as {
      scor: number;
      descriere?: string;
      idCabana: number;
      idUtilizator: number;
    };

    if (
      scor === undefined ||
      scor === null ||
      Number.isNaN(Number(scor)) ||
      idCabana === undefined ||
      idUtilizator === undefined
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const recenzie = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newRecenzie = await tx.recenzie.create({
        data: {
          scor: Number(scor),
          descriere: descriere ?? null,
          idCabana: Number(idCabana),
          idUtilizator: Number(idUtilizator),
        },
      });

      const result = await tx.recenzie.aggregate({
        where: { idCabana: Number(idCabana) },
        _avg: { scor: true },
      });

      const media = result._avg.scor ?? 0;

      await tx.cabana.update({
        where: { id: Number(idCabana) },
        data: { scorRecenzii: media },
      });

      return newRecenzie;
    });

    return res.status(201).json(recenzie);
  } catch (error: any) {
    console.error("Insert recenzie error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllRecenzii = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const recenzii = await prisma.recenzie.findMany();
    if (recenzii.length === 0) {
      return res.status(404).json({ error: "No recenzii found" });
    }

    return res.status(200).json(recenzii);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRecenzieById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid recenzie ID" });
    }

    const recenzie = await prisma.recenzie.findUnique({
      where: { id },
    });
    if (!recenzie) {
      return res.status(404).json({ error: "Recenzie not found" });
    }

    return res.status(200).json(recenzie);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateRecenzie = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const idRecenzie = Number(req.params.id);
    if (Number.isNaN(idRecenzie)) {
      return res.status(400).json({ error: "Invalid recenzie ID" });
    }

    const { scor, descriere, idCabana, idUtilizator } = req.body as {
      scor?: number;
      descriere?: string;
      idCabana: number;
      idUtilizator?: number;
    };

    if (idCabana === undefined) {
      return res.status(400).json({ error: "Missing idCabana" });
    }

    const recenzie = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updated = await tx.recenzie.update({
        where: { id: idRecenzie },
        data: {
          ...(scor !== undefined ? { scor: Number(scor) } : {}),
          ...(descriere !== undefined ? { descriere } : {}),
          ...(idCabana !== undefined ? { idCabana: Number(idCabana) } : {}),
          ...(idUtilizator !== undefined ? { idUtilizator: Number(idUtilizator) } : {}),
        },
      });

      const result = await tx.recenzie.aggregate({
        where: { idCabana: Number(idCabana) },
        _avg: { scor: true },
      });

      const media = result._avg.scor ?? 0;

      await tx.cabana.update({
        where: { id: Number(idCabana) },
        data: { scorRecenzii: media },
      });

      return updated;
    });

    return res.status(200).json(recenzie);
  } catch (error) {
    console.error("Update recenzie error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteRecenzie = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const idRecenzie = Number(req.params.id);
    if (Number.isNaN(idRecenzie)) {
      return res.status(400).json({ error: "Invalid recenzie ID" });
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const recenzie = await tx.recenzie.findUnique({
        where: { id: idRecenzie },
      });

      if (!recenzie) {
        throw new Error("Recenzie not found");
      }

      await tx.recenzie.delete({
        where: { id: idRecenzie },
      });

      const aggregate = await tx.recenzie.aggregate({
        where: { idCabana: recenzie.idCabana },
        _avg: { scor: true },
      });

      const media = aggregate._avg.scor ?? 0;

      await tx.cabana.update({
        where: { id: recenzie.idCabana },
        data: { scorRecenzii: media },
      });

      return recenzie;
    });

    return res
      .status(200)
      .json({ message: "Recenzie deleted successfully", recenzie: result });
  } catch (error: any) {
    console.error("Delete recenzie error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};

export const getRecenziiByCabanaId = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const idCabana = Number(req.params.idCabana);
    if (Number.isNaN(idCabana)) {
      return res.status(400).json({ error: "Invalid cabana ID" });
    }

    const recenzii = await prisma.recenzie.findMany({
      where: { idCabana },
      orderBy: { createdAt: "desc" },
      include: {
        Utilizator: {
          select: { id: true, email: true },
        },
      },
    });

    if (recenzii.length === 0) {
      return res
        .status(404)
        .json({ message: "Nu există recenzii pentru această cabană." });
    }

    return res.status(200).json(recenzii);
  } catch (error) {
    console.error("Get recenzii by cabana error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
