import { Request, Response } from "express";
import { prisma } from "../server";
import bcrypt from "bcryptjs";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    rol: string;
  };
}

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const users = await prisma.utilizator.findMany();
    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const user = await prisma.utilizator.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = Number(req.params.id);
    const { email, parola, googleId, nume, prenume, telefon } = req.body;

    const dataToUpdate: any = {};

    if (email) dataToUpdate.email = email;
    if (googleId) dataToUpdate.googleId = googleId;
    if (nume) dataToUpdate.nume = nume;
    if (prenume) dataToUpdate.prenume = prenume;
    if (telefon) dataToUpdate.telefon = telefon;
    if (parola) {
      const parolaHash = await bcrypt.hash(parola, 10);
      dataToUpdate.parolaHash = parolaHash;
    }

    const updatedUser = await prisma.utilizator.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.utilizator.delete({
      where: { id: Number(req.params.id) },
    });
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};
