interface Camera {
  id: number;
  nrCamera: number;
  pretNoapte: number;
  nrPersoane: number;
  descriere?: string;
}

interface Media {
  id: number;
  url: string;
  tip: string;
  descriere: string;
  idCabana: number | null;
}

interface CameraWithImage extends Camera {
  imageUrl?: string;
}

export const mapImagesToCamere = (
  camere: Camera[],
  media: Media[],
  cabanaId: number
): CameraWithImage[] => {
  const fallback = media.find(
    (img) =>
      img.idCabana === cabanaId &&
      img.descriere?.trim().toLowerCase() === "cabana"
  );

  return camere.map((camera) => {
    const match = media.find((img) => {
      const descriere = img.descriere?.trim();
      return (
        img.idCabana === cabanaId &&
        descriere &&
        !isNaN(Number(descriere)) &&
        Number(descriere) === camera.nrCamera
      );
    });

    return {
      ...camera,
      imageUrl: match
        ? `http://localhost:5000${match.url}`
        : fallback
        ? `http://localhost:5000${fallback.url}`
        : undefined,
    };
  });
};
