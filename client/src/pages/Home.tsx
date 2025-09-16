import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import StarRating from "../components/StarRating";
import TopNavbar from "../components/TopNavbar";
import { getToken } from "../utils/localStorage";

interface Camera {
  id: number;
  nrCamera: string;
  pretNoapte: number;
  nrPersoane: number;
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
  camere: Camera[] | "occupied";
  imagineUrl?: string;
}

interface Media {
  id: number;
  url: string;
  tip: "IMAGINE" | "VIDEO";
  descriere?: string;
  idCabana?: number;
}

const Home = () => {
  const [locatie, setLocatie] = useState("");
  const [dataSosire, setDataSosire] = useState("");
  const [dataPlecare, setDataPlecare] = useState("");
  const [nrPersoane, setNrPersoane] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cabane, setCabane] = useState<Cabana[]>([]);
  const navigate = useNavigate();

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    setError("");

    if (!dataSosire || !dataPlecare) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (new Date(dataSosire) >= new Date(dataPlecare)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("You must be logged in to search cabins.");
      return;
    }

    const params = new URLSearchParams();
    params.append("dataSosire", dataSosire);
    params.append("dataPlecare", dataPlecare);
    if (locatie.trim()) params.append("locatie", locatie);
    if (nrPersoane) params.append("nrPersoane", nrPersoane.toString());

    setLoading(true);
    try {
      const response = await axios.get<Cabana[]>(
        `http://localhost:5000/cabane/disponibilitate?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const cabaneData = response.data;

      const mediaRes = await axios.get<Media[]>("http://localhost:5000/media", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const media = mediaRes.data;

      const cabaneCuPoze = cabaneData.map((cabana) => {
        const imagine = media.find(
          (m) =>
            m.idCabana === cabana.id && m.descriere?.toLowerCase() === "cabana"
        );
        return {
          ...cabana,
          imagineUrl: imagine
            ? `http://localhost:5000${imagine.url}`
            : undefined,
        };
      });

      setCabane(cabaneCuPoze);
    } catch (err) {
      console.error(err);
      setError("An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center text-white px-4 py-10"
      style={{
        backgroundImage:
          'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
      }}
    >
      <TopNavbar />

      <div className="max-w-4xl mx-auto bg-[#161b22]/90 p-8 rounded-lg shadow-lg border border-[#30363d] mt-24">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Găsește-ți cabana montană de pe traseul tău preferat
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300">Locație</label>
            <input
              type="text"
              placeholder="Locație"
              value={locatie}
              onChange={(e) => setLocatie(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300">Dată de sosire</label>
            <input
              type="date"
              min={getTodayDate()}
              value={dataSosire}
              onChange={(e) => setDataSosire(e.target.value)}
              className="px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm mb-1 text-gray-300">Dată de plecare</label>
            <input
              type="date"
              min={getTodayDate()}
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
        </div>

        <button
          onClick={handleSearch}
          disabled={!dataSosire || !dataPlecare || loading}
          className={`w-full ${
            !dataSosire || !dataPlecare || loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } mt-6 py-2 rounded font-medium transition`}
        >
          {loading ? "Searching..." : "Caută cabane"}
        </button>

        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}

        <div className="mt-8">
          {cabane.length > 0 ? (
            <div className="flex flex-col space-y-6">
              {cabane.map((cabana) => (
                <div
                  key={cabana.id}
                  onClick={() =>
                    navigate(`/cabana/${cabana.id}`, {
                      state: { dataSosire, dataPlecare, nrPersoane },
                    })
                  }
                  className="cursor-pointer flex flex-col md:flex-row bg-[#0d1117] p-4 rounded border border-[#30363d] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-transform duration-150 ease-in-out"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {cabana.denumire}
                        </h2>
                        <StarRating
                          score={Number(cabana.scorRecenzii ?? 0)}
                          reviewCount={cabana.nrRecenzii}
                        />
                      </div>
                      {Array.isArray(cabana.camere) &&
                      cabana.camere.length > 0 ? (
                        <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                          Disponibilă
                        </span>
                      ) : (
                        <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                          Ocupată
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      Locație: {cabana.locatie}
                    </p>
                    <p className="text-sm text-gray-300">
                      Altitudine: {cabana.altitudine} m
                    </p>
                    {cabana.descriere && (
                      <p className="mt-2 text-gray-400">{cabana.descriere}</p>
                    )}
                    <p className="mt-3 text-sm text-gray-400">
                      {cabana.contactEmail} | {cabana.contactTelefon}
                    </p>
                  </div>

                  {cabana.imagineUrl && (
                    <div className="md:w-[300px] md:h-[200px] w-full h-64 mb-4 md:mb-0 md:ml-6 flex-shrink-0">
                      <img
                        src={cabana.imagineUrl}
                        alt={cabana.denumire}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-center text-gray-400 mt-6">
                Nu au fost găsite cabane montane conform criteriilor tale. Mai încearcă odată.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
