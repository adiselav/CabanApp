import { Request, Response } from "express";
import { prisma } from "../server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/auth";
import { isValidEmail, isValidTelefon } from "../config/utils";

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, parola, googleId, nume, prenume, telefon } = req.body;

    if (!email || !parola || !nume || !prenume || !telefon) {
      return res.status(400).json({ error: "Există câmpuri necompletate." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Formatul adresei de e-mail este greșit." });
    }

    if (!isValidTelefon(telefon)) {
      return res.status(400).json({ error: "Formatul numărului de telefon este greșit." });
    }

    const existingUser = await prisma.utilizator.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Această adresă de e-mail este deja utilizată de un alt utilizator. " });
    }

    const parolaHash = await bcrypt.hash(parola, 10);

    const user = await prisma.utilizator.create({
      data: {
        email,
        parolaHash,
        googleId: googleId || null,
        nume,
        prenume,
        telefon,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { parolaHash: _removed, ...safeUser } = user;

    return res.status(201).json({
      message: "Utilizator înregistrat și conectat cu succes.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Eroare de server în timpul înregistrării." });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, parola } = req.body;

    if (!email || !parola) {
      return res.status(400).json({ error: "Lipsește parola sau e-mail-ul." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Formatul e-mail-ului este greșit." });
    }

    const user = await prisma.utilizator.findUnique({ where: { email } });

    if (!user || !user.parolaHash) {
      return res.status(401).json({ error: "Utilizator inexistent." });
    }

    const isValid = await bcrypt.compare(parola, user.parolaHash);
    if (!isValid) {
      return res.status(401).json({ error: "Utilizator inexistent." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const { parolaHash: _removed, ...safeUser } = user;

    return res.status(200).json({
      message: "Conectare cu succes.",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error("Eroare la conectare:", error);
    return res.status(500).json({ error: "Eroare de server în timpul conectării." });
  }
};
