import { useCallback, useContext, useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import StarRating from "../components/StarRating";
import { AuthContext } from "../context/AuthContext";
import { getToken } from "../utils/localStorage";
import PrimaryButton from "../components/PrimaryButton";
import { mapImagesToCamere } from "../utils/mapImagesToCamere";

interface Camera {
  id: number;
  nrCamera: number;
  pretNoapte: number;
  nrPersoane: number;
  descriere?: string;
  imageUrl?: string;
}

interface Cabana {
  id: number;
  denumire: string;
  locatie: string;
  altitudine: number;
  contactEmail: string;
  contactTelefon: string;
  descriere?: string;
  scorRecenzii?: number | null;
  nrRecenzii?: number;
  camere?: Camera[];
}

interface Media {
  id: number;
  url: string;
  tip: string;
  descriere: string;
  idCabana: number | null;
}

const CabanaInfo = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("You must be authenticated");

  const {
    dataSosire: initSosire,
    dataPlecare: initPlecare,
    nrPersoane: initPersoane,
  } = location.state || {};

  const [cabana, setCabana] = useState<Cabana | null>(null);
  const [availableCamere, setAvailableCamere] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [dataSosire, setDataSosire] = useState(initSosire || "");
  const [dataPlecare, setDataPlecare] = useState(initPlecare || "");
  const [nrPersoane, setNrPersoane] = useState(initPersoane || 1);
  const [filterApplied, setFilterApplied] = useState(false);

  const isFormValid =
    dataSosire && dataPlecare && new Date(dataSosire) < new Date(dataPlecare);

  const fetchCabana = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`http://localhost:5000/cabane/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const camere = res.data.camere ?? [];

      const mediaRes = await axios.get<Media[]>(`http://localhost:5000/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const images = mediaRes.data.filter((m) => m.idCabana === res.data.id);
      const camereWithImages = mapImagesToCamere(camere, images, res.data.id);
      setCabana({ ...res.data, camere: camereWithImages });
    } catch (err) {
      console.error("Failed to fetch cabana or images:", err);
      setError("Could not load cabana info.");
    }
  }, [id]);

  const fetchAvailableRooms = useCallback(async () => {
    setError("");
    setFilterApplied(false);

    if (!isFormValid) {
      setError("Please select valid check-in and check-out dates.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You must be logged in to check availability.");
      return;
    }

    try {
      const res = await axios.get<Camera[]>(
        `http://localhost:5000/camere/available/cabana/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { dataSosire, dataPlecare, nrPersoane },
        }
      );
      const availableIds = res.data.map((c) => c.id);
      setAvailableCamere(availableIds);
      setFilterApplied(true);
    } catch (err) {
      console.error("Filter failed:", err);
      setError("An error occurred while checking availability.");
    }
  }, [dataSosire, dataPlecare, nrPersoane, id, isFormValid]);

  useEffect(() => {
    fetchCabana();
  }, [fetchCabana]);

  useEffect(() => {
    if (isFormValid) fetchAvailableRooms();
  }, [fetchAvailableRooms, isFormValid]);

  const handleGoToReviews = () => {
    if (cabana?.id) navigate(`/cabana/${cabana.id}/reviews`);
  };

  const handleBookNow = () => {
    navigate("/reservation", {
      state: {
        dataSosire,
        dataPlecare,
        nrPersoane,
        camereDisponibile: cabana?.camere?.filter((c) =>
          availableCamere.includes(c.id)
        ),
        cabanaId: cabana?.id,
      },
    });
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
      <div className="max-w-5xl mx-auto bg-[#161b22]/90 p-8 rounded-lg border border-[#30363d] shadow">
        {!cabana ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Dată de sosire</label>
                <input
                  type="date"
                  value={dataSosire}
                  onChange={(e) => setDataSosire(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">Dată de plecare</label>
                <input
                  type="date"
                  value={dataPlecare}
                  onChange={(e) => setDataPlecare(e.target.value)}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm mb-1 text-gray-300">
                  Numărul de persoane
                </label>
                <input
                  type="number"
                  min={1}
                  value={nrPersoane}
                  onChange={(e) => setNrPersoane(Number(e.target.value))}
                  className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded"
                />
              </div>
              <button
                onClick={handleBookNow}
                className="md:col-span-3 bg-green-600 hover:bg-green-700 py-2 rounded font-medium transition"
                disabled={!isFormValid}
              >
                Rezervă acum
              </button>
              {error && (
                <div className="md:col-span-3 bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold">{cabana.denumire}</h1>
              <StarRating
                score={Number(cabana.scorRecenzii ?? 0)}
                reviewCount={cabana.nrRecenzii}
              />
              <PrimaryButton onClick={handleGoToReviews} className="mt-2">
                Vezi toate recenziile →
              </PrimaryButton>
              <p className="text-gray-300 mt-1">
                {cabana.locatie} · Altitudine: {cabana.altitudine} m
              </p>
              {cabana.descriere && (
                <p className="text-gray-400 mt-2">{cabana.descriere}</p>
              )}
              <p className="text-sm text-gray-500 mt-3">
                Contact: {cabana.contactEmail} | {cabana.contactTelefon}
              </p>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Camere disponibile</h2>
            {!cabana.camere || cabana.camere.length === 0 ? (
              <p className="text-gray-400">Nu au fost găsite camere.</p>
            ) : (
              <div className="flex flex-col space-y-6">
                {cabana.camere.map((camera) => {
                  const isAvailable = availableCamere.includes(camera.id);
                  return (
                    <div
                      key={camera.id}
                      className="flex flex-col md:flex-row bg-[#0d1117] p-4 rounded border border-[#30363d] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 ease-in-out"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-2xl font-bold">
                            Camera #{camera.nrCamera}
                          </h3>
                          {filterApplied && (
                            <span
                              className={`px-3 py-1 rounded text-sm font-semibold ${
                                isAvailable
                                  ? "bg-green-600 text-white"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {isAvailable ? "Disponibilă" : "Ocupată"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">
                          Capacitate: {camera.nrPersoane} persoane
                        </p>
                        <p className="text-sm text-gray-300">
                          Preț {camera.pretNoapte} RON / noapte
                        </p>
                        {camera.descriere && (
                          <p className="mt-2 text-gray-400">
                            {camera.descriere}
                          </p>
                        )}
                      </div>
                      <div className="md:w-[300px] md:h-[200px] w-full h-64 mb-4 md:mb-0 md:ml-6 flex-shrink-0">
                        {camera.imageUrl ? (
                          <img
                            src={camera.imageUrl}
                            alt={`Room ${camera.nrCamera}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 rounded">
                            Nu există imagine
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CabanaInfo;
