import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "../utils/localStorage";
import { format } from "date-fns";
import TopNavbar from "../components/TopNavbar";

interface Camera {
  id: number;
  nrCamera: number;
  pretNoapte: number;
  nrPersoane: number;
  descriere?: string;
  imageUrl?: string;
}

export default function ReservationForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    dataSosire,
    dataPlecare,
    nrPersoane,
    camereDisponibile = [],
    cabanaId,
  } = location.state || {};

  const [selectedCameraIds, setSelectedCameraIds] = useState<number[]>([]);
  const [pretTotal, setPretTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numarNopti = Math.max(
    1,
    (new Date(dataPlecare).getTime() - new Date(dataSosire).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  const camereSelectate = camereDisponibile.filter((camera: Camera) =>
    selectedCameraIds.includes(camera.id)
  );

  const capacitateTotala = camereSelectate.reduce(
    (acc: number, camera: Camera) => acc + camera.nrPersoane,
    0
  );

  const isCapacitateOk = capacitateTotala >= nrPersoane;
  const isDisabled = selectedCameraIds.length === 0 || !isCapacitateOk || loading;

  useEffect(() => {
    if (
      !dataSosire ||
      !dataPlecare ||
      !cabanaId ||
      camereDisponibile.length === 0
    ) {
      navigate("/home");
    }
  }, [dataSosire, dataPlecare, cabanaId, camereDisponibile, navigate]);

  useEffect(() => {
    const total = camereSelectate.reduce(
      (acc: number, camera: Camera) => acc + camera.pretNoapte * numarNopti,
      0
    );
    setPretTotal(total);
  }, [selectedCameraIds, camereDisponibile, numarNopti, camereSelectate]);

  const toggleCamera = (id: number) => {
    setSelectedCameraIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirmReservation = async () => {
    if (isDisabled) return;

    setLoading(true);
    setError("");

    try {
      const token = getToken();
      await axios.post(
        "http://localhost:5000/rezervare",
        {
          dataSosire,
          dataPlecare,
          nrPersoane,
          idCamere: selectedCameraIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/reservations", {
        state: { message: "Reservation successful" },
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "A apărut o eroare.");
      } else {
        setError("A apărut o eroare necunoscută.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center text-white px-4 pt-24 pb-10"
      style={{
        backgroundImage:
          'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
      }}
    >
      <TopNavbar />
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 bg-[#161b22]/90 p-6 rounded-lg border border-[#30363d] shadow">
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-2">Selectează camerele</h1>
          {camereDisponibile.map((camera: Camera) => (
            <div
              key={camera.id}
              className={`p-4 rounded border shadow-sm transition ${
                selectedCameraIds.includes(camera.id)
                  ? "border-green-500 bg-[#1a1f24]"
                  : "border-[#30363d] bg-[#0d1117]"
              }`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-[180px] md:h-[120px] w-full h-36 flex-shrink-0">
                  {camera.imageUrl ? (
                    <img
                      src={camera.imageUrl}
                      alt={`Camera ${camera.nrCamera}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 rounded">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">
                    Camera #{camera.nrCamera}
                  </h2>
                  {camera.descriere && (
                    <p className="text-sm text-gray-400">{camera.descriere}</p>
                  )}
                  <p className="text-sm text-gray-400">
                    Capacitate: {camera.nrPersoane} persoane
                  </p>
                  <p className="text-sm text-gray-400">
                    Preț: {camera.pretNoapte} RON / noapte
                  </p>
                  <button
                    onClick={() => toggleCamera(camera.id)}
                    className={`px-4 py-2 mt-3 text-sm rounded font-medium transition ${
                      selectedCameraIds.includes(camera.id)
                        ? "bg-green-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-white`}
                  >
                    {selectedCameraIds.includes(camera.id)
                      ? "Selectată"
                      : "Alege camera"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0d1117] border border-[#30363d] p-6 rounded h-fit shadow">
          <h2 className="text-xl font-semibold mb-4">Detalii rezervare</h2>
          <div className="text-sm space-y-1 text-gray-300">
            <p>
              <strong>Data sosire:</strong>{" "}
              {format(new Date(dataSosire), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Data plecare:</strong>{" "}
              {format(new Date(dataPlecare), "dd MMM yyyy")}
            </p>
            <p>
              <strong>Număr nopți:</strong> {numarNopti}
            </p>
            <p>
              <strong>Pentru:</strong> {nrPersoane} persoane
            </p>
            <p>
              <strong>Capacitate selectată:</strong> {capacitateTotala}
            </p>
            <p>
              <strong>Total:</strong> {pretTotal.toFixed(2)} RON
            </p>
          </div>

          {!isCapacitateOk && selectedCameraIds.length > 0 && (
            <p className="text-yellow-500 text-sm mt-3 border border-yellow-600 bg-yellow-600/10 px-3 py-2 rounded">
              Capacitatea selectată ({capacitateTotala}) este insuficientă pentru{" "}
              {nrPersoane} persoane.
            </p>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-3 border border-red-600 bg-red-600/10 px-3 py-2 rounded">
              {error}
            </p>
          )}

          <button
            className={`w-full mt-6 py-2 rounded font-semibold transition ${
              isDisabled
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
            disabled={isDisabled}
            onClick={handleConfirmReservation}
          >
            {loading ? "Se procesează..." : "Confirmă rezervarea"}
          </button>
        </div>
      </div>
    </div>
  );
}
