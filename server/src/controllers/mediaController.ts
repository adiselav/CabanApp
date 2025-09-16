import { Request, Response } from "express";
import { prisma } from "../server";
import { TipFisier } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
  };
}
export const insertMedia = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file;
    const { descriere, idCabana } = req.body;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const tip: TipFisier = file.mimetype.startsWith("video") ? "VIDEO" : "IMAGINE";

    const media = await prisma.media.create({
      data: {
        url: `/uploads/${file.filename}`,
        tip,
        descriere,
        idCabana: idCabana ? Number(idCabana) : null,
      },
    });

    return res.status(201).json(media);
  } catch (error: any) {
    console.error("Insert media error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getAllMedia = async (req: Request, res: Response): Promise<any> => {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        tip: true,
        descriere: true,
        idCabana: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(media);
  } catch (error) {
    console.error("Get all media error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const getMediaById = async (req: Request, res: Response): Promise<any> => {
  try {
    const media = await prisma.media.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    return res.status(200).json(media);
  } catch (error) {
    console.error("Get media by ID error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const updateMedia = async (req: Request, res: Response): Promise<any> => {
  try {
    const { url, descriere, idCabana } = req.body;

    const updatedMedia = await prisma.media.update({
      where: { id: Number(req.params.id) },
      data: {
        url,
        descriere,
        idCabana: idCabana ? Number(idCabana) : null,
      },
    });

    return res.status(200).json(updatedMedia);
  } catch (error) {
    console.error("Update media error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
export const deleteMedia = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.media.delete({
      where: { id: Number(req.params.id) },
    });

    return res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};
