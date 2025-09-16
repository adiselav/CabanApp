import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { differenceInCalendarDays } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  const parolaHash = await bcrypt.hash("1234", 10);

  const utilizator1 = await prisma.utilizator.create({
    data: {
      email: "adi@gmail.com",
      parolaHash,
      rol: "ADMIN",
      nume: "Sela",
      prenume: "Adi",
      telefon: "0740345678",
    },
  });

  const utilizator2 = await prisma.utilizator.create({
    data: {
      email: "tudor@gmail.com",
      parolaHash,
      rol: "PROPRIETAR",
      nume: "Spantu",
      prenume: "Tudor",
      telefon: "0712345592",
    },
  });

  const utilizator3 = await prisma.utilizator.create({
    data: {
      email: "cata@gmail.com",
      parolaHash,
      rol: "TURIST",
      nume: "Condrat",
      prenume: "Cata",
      telefon: "0712487678",
    },
  });

  const utilizator4 = await prisma.utilizator.create({
    data: {
      email: "andrei@gmail.com",
      parolaHash,
      nume: "Stanciu",
      prenume: "Andrei",
      telefon: "0740123678",
    },
  });

  const utilizator5 = await prisma.utilizator.create({
    data: {
      email: "adrian@gmail.com",
      parolaHash,
      nume: "Spulber",
      prenume: "Adrian",
      telefon: "0712220202",
    },
  });

  const utilizator6 = await prisma.utilizator.create({
    data: {
      email: "dragos@gmail.com",
      parolaHash,
      rol: "PROPRIETAR",
      nume: "Paduraru",
      prenume: "Dragos",
      telefon: "0712345678",
    },
  });

  const utilizator7 = await prisma.utilizator.create({
    data: {
      email: "andreea@gmail.com",
      parolaHash,
      nume: "Scutaru",
      prenume: "Andreea",
      telefon: "0740402599",
    },
  });

  const utilizator8 = await prisma.utilizator.create({
    data: {
      email: "mircea@gmail.com",
      parolaHash,
      nume: "Sandulescu",
      prenume: "Mircea",
      telefon: "0753506789",
    },
  });
  const cabana1 = await prisma.cabana.create({
    data: {
      denumire: "Cabana Podragu",
      locatie: "Muntii Fagaras",
      altitudine: 2136,
      contactEmail: "cabanapodragu@gmail.com",
      contactTelefon: "0761878175",
      descriere:
        "Cabana Podragu este cabana din Muntii Fagaras situata la cea mai mare altitudine, pe o vale glaciara, valea Podragului.",
      scorRecenzii: 0,
      idUtilizator: utilizator6.id,
    },
  });

  const cabana2 = await prisma.cabana.create({
    data: {
      denumire: "Cabana Curmatura",
      locatie: "Muntii Piatra Craiului",
      altitudine: 1470,
      contactEmail: "cabanacurmatura@gmail.com",
      contactTelefon: "0745454184",
      descriere:
        "Cabana Curmatura se afla in Muntii Piatra Craiului si este deschisa tot timpul anului, dispune de bar si de restaurat.",
      scorRecenzii: 0,
      idUtilizator: utilizator2.id,
    },
  });

  const cabana3 = await prisma.cabana.create({
    data: {
      denumire: "Cabana Omu",
      locatie: "Muntii Bucegi",
      altitudine: 2507,
      contactEmail: "cabanaomu@gmail.com",
      contactTelefon: "0744567290",
      descriere:
        "Cabana Omu este cabana plasata la cea mai mare altitudine din Carpati.",
      scorRecenzii: 0,
      idUtilizator: utilizator8.id,
    },
  });
  const camera1 = await prisma.camera.create({
    data: {
      nrCamera: 101,
      nrPersoane: 2,
      pretNoapte: 100,
      descriere: "Camera dubla",
      idCabana: cabana2.id,
    },
  });

  const camera2 = await prisma.camera.create({
    data: {
      nrCamera: 102,
      nrPersoane: 3,
      pretNoapte: 150,
      descriere: "Camera tripla",
      idCabana: cabana2.id,
    },
  });

  const camera3 = await prisma.camera.create({
    data: {
      nrCamera: 103,
      nrPersoane: 11,
      pretNoapte: 330,
      descriere: "Camera parter",
      idCabana: cabana2.id,
    },
  });

  const camera4 = await prisma.camera.create({
    data: {
      nrCamera: 104,
      nrPersoane: 12,
      pretNoapte: 360,
      descriere: "Camera anexa",
      idCabana: cabana2.id,
    },
  });

  const camera5 = await prisma.camera.create({
    data: {
      nrCamera: 1,
      nrPersoane: 11,
      pretNoapte: 495,
      descriere: "Camera mansarda",
      idCabana: cabana1.id,
    },
  });

  const camera6 = await prisma.camera.create({
    data: {
      nrCamera: 2,
      nrPersoane: 18,
      pretNoapte: 900,
      descriere: "Camera anexa",
      idCabana: cabana1.id,
    },
  });

  const camera7 = await prisma.camera.create({
    data: {
      nrCamera: 3,
      nrPersoane: 16,
      pretNoapte: 560,
      descriere: "Camera parter",
      idCabana: cabana1.id,
    },
  });
  await prisma.media.create({
    data: {
      url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhFn8TS7ry7KIPp9VmFaanPG84dDgnTSOfw2LOcX-geDPP1P9D3VlqRsXvKqgPB1qHTgi8Fw6bu-xaGigmTC1DpBZiF4hHUnrKC5jo-4ChkrX2QMXtGbWhvWIJzuIY-78Ikrk_qu1l5O1yhJId8YG80qoroo1hCTiZozYOz0NXU8yktcQsR2KuOExJ66g/s4000/Cabana%20Curm%C4%83tura.jpeg",
      descriere: "Cabana Curmatura",
      idCabana: cabana2.id,
    },
  });
  await prisma.recenzie.create({
    data: {
      scor: 5,
      descriere: "Excelenta!",
      idCabana: cabana2.id,
      idUtilizator: utilizator3.id,
    },
  });

  await prisma.recenzie.create({
    data: {
      scor: 1,
      descriere: "Oribila!",
      idCabana: cabana1.id,
      idUtilizator: utilizator7.id,
    },
  });

  await prisma.recenzie.create({
    data: {
      scor: 4,
      descriere: "M-am simtit foarte bine!",
      idCabana: cabana1.id,
      idUtilizator: utilizator4.id,
    },
  });

  await prisma.recenzie.create({
    data: {
      scor: 3,
      descriere: "Patul era cam tare.",
      idCabana: cabana2.id,
      idUtilizator: utilizator5.id,
    },
  });
  const dataSosire = new Date("2025-05-01");
  const dataPlecare = new Date("2025-05-05");
  const zile = differenceInCalendarDays(dataPlecare, dataSosire);

  await prisma.rezervare.create({
    data: {
      dataSosire: dataSosire,
      dataPlecare: dataPlecare,
      nrPersoane: 5,
      pretTotal:
        camera1.pretNoapte.toNumber() * zile +
        camera2.pretNoapte.toNumber() * zile,
      idUtilizator: utilizator3.id,
      camere: {
        connect: [{ id: camera1.id }, { id: camera2.id }],
      },
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
