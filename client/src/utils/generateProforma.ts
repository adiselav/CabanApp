import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import { differenceInCalendarDays } from "date-fns";

interface ProformaData {
  user: { nume: string; prenume: string; email: string; telefon: string };
  rezervare: {
    id: number;
    dataSosire: string;
    dataPlecare: string;
    pretTotal: number;
    nrPersoane: number;
    created_at: string | Date;
  };
  camere: {
    nrCamera: number;
    pretNoapte: number | string;
    nrPersoane?: number;
    unitateMasura?: string;
    cantitate?: number;
  }[];
  cabana: { denumire: string; locatie: string };
  furnizor: { numeFirma: string; cif: string; email: string };
}

interface CustomJsPDF extends jsPDF {
  lastAutoTable: { finalY: number };
}

export const generateProforma = (data: ProformaData): void => {
  const doc = new jsPDF() as CustomJsPDF;
  const { user, rezervare, camere, cabana, furnizor } = data;
  const tvaRate = 5;

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;

  const formatTime = (date: Date) =>
    `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

  const parsedDate =
    typeof rezervare.created_at === "string"
      ? new Date(rezervare.created_at)
      : rezervare.created_at;

  const dataRezervare = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const dataCheckIn = rezervare.dataSosire
    ? formatDate(new Date(rezervare.dataSosire))
    : "";
  const outerX = 10;
  const outerY = 10;
  const outerW = 190;
  const innerBoxH = 25;
  const furnizorStartY = outerY + innerBoxH + 15;
  const outerH = furnizorStartY + 30 - outerY;

  doc.setDrawColor(60, 110, 140);
  doc.setLineWidth(0.5);
  doc.rect(outerX, outerY, outerW, outerH);
  const boxX = outerX + 60;
  const boxY = outerY + 5;
  const boxW = 70;
  doc.setDrawColor(60, 110, 140);
  doc.rect(boxX, boxY, boxW, innerBoxH);

  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text("PROFORMA", boxX + boxW / 2, boxY + 8, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("courier", "normal");
  doc.text(
    `Seria nr. ${rezervare.id.toString().padStart(4, "0")}`,
    boxX + boxW / 2,
    boxY + 14,
    { align: "center" }
  );
  doc.text(
    `Data (zi/luna/an): ${formatDate(dataRezervare)}`,
    boxX + boxW / 2,
    boxY + 19,
    { align: "center" }
  );
  doc.text(`Cota TVA: ${tvaRate}%`, boxX + boxW / 2, boxY + 24, {
    align: "center",
  });
  const labelFont = () => {
    doc.setFont("courier", "bold");
    doc.setTextColor(0);
  };
  const valueFont = () => {
    doc.setFont("courier", "normal");
    doc.setTextColor(40, 80, 110);
  };

  const fX = outerX + 5;
  const cX = outerX + 105;

  doc.setFontSize(10);
  labelFont();
  doc.text("Furnizor:", fX, furnizorStartY);
  doc.text("Client:", cX, furnizorStartY);

  valueFont();
  doc.text(furnizor.numeFirma || "SC CABANAAPP SRL", fX, furnizorStartY + 5);
  doc.text(
    `${(user.nume || "").toUpperCase()} ${(user.prenume || "").toUpperCase()}`,
    cX,
    furnizorStartY + 5
  );

  labelFont();
  doc.text("CIF:", fX, furnizorStartY + 10);
  doc.text("Telefon:", cX, furnizorStartY + 10);

  valueFont();
  doc.text(furnizor.cif || "-", fX + 15, furnizorStartY + 10);
  doc.text(user.telefon || "-", cX + 22, furnizorStartY + 10);

  labelFont();
  doc.text("Email:", fX, furnizorStartY + 15);
  doc.text("Email:", cX, furnizorStartY + 15);

  valueFont();
  doc.text(furnizor.email || "-", fX + 15, furnizorStartY + 15);
  doc.text(user.email || "-", cX + 15, furnizorStartY + 15);

  labelFont();
  doc.text("Cabana:", fX, furnizorStartY + 20);
  doc.text("Locatie:", fX, furnizorStartY + 25);

  valueFont();
  doc.text(cabana.denumire || "-", fX + 20, furnizorStartY + 20);
  doc.text(cabana.locatie || "-", fX + 20, furnizorStartY + 25);
  let totalFaraTVA = 0;
  let totalTVA = 0;
  let totalCuTVA = 0;

  const tableBody: RowInput[] = camere.map((cam, idx) => {
    const pretCuTVA =
      typeof cam.pretNoapte === "string"
        ? parseFloat(cam.pretNoapte)
        : cam.pretNoapte;
    const um = cam.unitateMasura || "N";
    const cantitate =
      cam.cantitate ||
      differenceInCalendarDays(
        new Date(rezervare.dataPlecare),
        new Date(rezervare.dataSosire)
      );

    const pretFaraTVA = pretCuTVA / (1 + tvaRate / 100);
    const tvaUnit = pretCuTVA - pretFaraTVA;

    const valoareFaraTVA = pretFaraTVA * cantitate;
    const tvaVal = tvaUnit * cantitate;
    const valoareCuTVA = pretCuTVA * cantitate;

    totalFaraTVA += valoareFaraTVA;
    totalTVA += tvaVal;
    totalCuTVA += valoareCuTVA;

    const perioada = `${formatDate(
      new Date(rezervare.dataSosire)
    )} - ${formatDate(new Date(rezervare.dataPlecare))}`;

    return [
      (idx + 1).toString(),
      `CAZARE\nCAMERA ${cam.nrCamera} ${perioada}`,
      um.toUpperCase(),
      cantitate.toString(),
      pretFaraTVA.toFixed(2),
      valoareFaraTVA.toFixed(2),
      tvaVal.toFixed(2),
    ];
  });

  const totalsRows: RowInput[] = [
    [
      "",
      {
        content: "TOTAL:",
        colSpan: 4,
        styles: { halign: "right", fontStyle: "bold" as const },
      },
      totalFaraTVA.toFixed(2),
      totalTVA.toFixed(2),
    ],
    [
      "",
      {
        content: "  TOTAL PLATA:",
        colSpan: 5,
        styles: {
          halign: "right",
          fontStyle: "bold" as const,
          textColor: [60, 110, 140] as [number, number, number],
        },
      },
      {
        content: totalCuTVA.toFixed(2),
        styles: {
          fontStyle: "bold" as const,
          textColor: [60, 110, 140] as [number, number, number],
        },
      },
    ],
  ];

  autoTable(doc, {
    head: [
      [
        "Nr. crt",
        "Denumirea produselor sau a serviciilor",
        "U.M.",
        "Cant.",
        "Pret unitar (fara TVA)\n-Lei-",
        "Valoarea -Lei-",
        "Valoare TVA -Lei-",
      ],
      ["0", "1", "2", "3", "4", "5(3x4)", "6"],
    ],
    body: [...tableBody, ...totalsRows],
    startY: furnizorStartY + 35,
    styles: {
      font: "courier",
      fontSize: 10,
      halign: "center",
      valign: "middle",
      cellPadding: { top: 4, bottom: 4 },
    },
    headStyles: {
      fillColor: [60, 110, 140],
      textColor: 255,
      fontStyle: "bold",
    },
    didParseCell: (data) => {
      if (
        data.section === "body" &&
        typeof data.cell.raw === "string" &&
        data.cell.raw.includes("\n")
      ) {
        data.cell.styles.minCellHeight = 20;
        data.cell.styles.cellPadding = { top: 5, bottom: 5 };
        data.cell.styles.halign = "left";
      }
    },
  });
  const finalY = doc.lastAutoTable.finalY;
  const marginX = 15;
  const blocY = finalY + 8;
  const blocW = 180;
  const blocH = 48;
  const colW = blocW / 3;
  doc.setDrawColor(60, 110, 140);
  doc.setLineWidth(0.5);
  doc.rect(marginX, blocY, blocW, blocH);
  doc.line(marginX + colW, blocY, marginX + colW, blocY + blocH);
  doc.line(marginX + 2 * colW, blocY, marginX + 2 * colW, blocY + blocH);
  doc.setFontSize(10);
  const leftX = marginX + 3;
  let ly = blocY + 8;

  doc.setFont("courier", "bold");
  const firstLabel = doc.splitTextToSize("Data expeditie:", colW - 6);
  doc.text(firstLabel, leftX, ly);
  ly += 6 * firstLabel.length;

  doc.setFont("courier", "normal");
  const left2 = doc.splitTextToSize(
    `Expediere la data de ${formatDate(dataRezervare)} ora ${formatTime(
      dataRezervare
    )}`,
    colW - 6
  );
  doc.text(left2, leftX, ly);
  ly += 6 * left2.length;

  const left3 = doc.splitTextToSize(`Intocmit de: SC CabanaApp SRL`, colW - 6);
  doc.text(left3, leftX, ly);
  ly += 6 * left3.length;

  const left4 = doc.splitTextToSize(`Termen plata: ${dataCheckIn}`, colW - 6);
  doc.text(left4, leftX, ly);
  ly += 6 * left4.length;
  const centerX = marginX + colW + 3;
  const centerY = blocY + 8;
  const centerText = "Semnatura si stampila furnizorului:";
  doc.setFont("courier", "bold");
  const centerLines = doc.splitTextToSize(centerText, colW - 6);
  doc.text(centerLines, centerX, centerY);
  const rightX = marginX + 2 * colW + 3;
  const rightY = blocY + 8;
  const rightText = "Semnatura de primire:";
  doc.setFont("courier", "bold");
  const rightLines = doc.splitTextToSize(rightText, colW - 6);
  doc.text(rightLines, rightX, rightY);
  doc.setFont("courier", "normal");
  doc.setTextColor(0);
  doc.save(`Proforma_${rezervare.id}.pdf`);
};
