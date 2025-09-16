import { useEffect, useState, useContext, useMemo, ChangeEvent } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import BusinessNavbar from "../components/BusinessNavbar";
import StarRating from "../components/StarRating";
import { mapImagesToCamere } from "../utils/mapImagesToCamere";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
  Brush,
} from "recharts";

interface Camera {
  id: number;
  nrCamera: number;
  pretNoapte: number;
  nrPersoane: number;
  idCabana: number;
  descriere?: string;
  imageUrl?: string;
}

interface Rezervare {
  id: number;
  dataSosire: string;
  dataPlecare: string;
  nrPersoane: number;
  pretTotal: number | string;
  camere?: Camera[];
  created_at: string;
  utilizator?: {
    id: number;
    email?: string;
    nume?: string;
    prenume?: string;
  };
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
  idUtilizator?: number;
}

type CabanaFormState = Omit<
  Cabana,
  "id" | "camere" | "scorRecenzii" | "nrRecenzii" | "idUtilizator"
> & { descriere?: string };
type CameraFormState = Omit<Camera, "id" | "idCabana" | "imageUrl"> & {
  descriere?: string;
};

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const { user, token, loading } = authContext ?? {};
  const [cabane, setCabane] = useState<Cabana[]>([]);
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [error, setError] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [editCabana, setEditCabana] = useState<Cabana | null>(null);
  const [editCamera, setEditCamera] = useState<{
    camera: Camera;
    cabanaId: number;
  } | null>(null);
  const [formCabana, setFormCabana] = useState<CabanaFormState>({
    denumire: "",
    locatie: "",
    altitudine: 0,
    contactEmail: "",
    contactTelefon: "",
    descriere: "",
  });
  const [formCamera, setFormCamera] = useState<CameraFormState>({
    nrCamera: 0,
    pretNoapte: 0,
    nrPersoane: 0,
    descriere: "",
  });

  function getAxiosErrorMsg(err: unknown, fallback: string) {
    if (axios.isAxiosError(err)) {
      return err.response?.data?.message || fallback;
    }
    return fallback;
  }

  const refetchAllData = async () => {
    if (!user || !token) return;
    try {
      setLoadingData(true);
      setError("");
      const cabaneRes = await axios.get<Cabana[]>(
        `http://localhost:5000/cabane`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const myCabane = cabaneRes.data.filter(
        (c) => c.idUtilizator === user?.id
      );
      const mediaRes = await axios.get(`http://localhost:5000/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allMedia = mediaRes.data;
      const cabaneWithRooms: Cabana[] = await Promise.all(
        myCabane.map(async (cab) => {
          const res = await axios.get<Cabana>(
            `http://localhost:5000/cabane/${cab.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const camere = (res.data.camere ?? []).map((cam) => ({
            ...cam,
            pretNoapte: Number(cam.pretNoapte),
            idCabana: cab.id,
          }));
          const camereWithImages = mapImagesToCamere(
            camere,
            allMedia,
            cab.id
          ).map((cam) => ({ ...cam, idCabana: cab.id }));
          return {
            ...cab,
            camere: camereWithImages,
            scorRecenzii: res.data.scorRecenzii,
            nrRecenzii: res.data.nrRecenzii,
          };
        })
      );
      setCabane(cabaneWithRooms);
      const rezervariRes = await axios.get<Rezervare[]>(
        `http://localhost:5000/rezervare`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const allRezervari = rezervariRes.data.filter((rez) =>
        (rez.camere ?? []).some((cam) =>
          myCabane.some((cab) => cab.id === cam.idCabana)
        )
      );
      setRezervari(allRezervari);
    } catch (err: unknown) {
      setError(getAxiosErrorMsg(err, "Could not load dashboard data."));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user || !token) return;
    refetchAllData();
    // eslint-disable-next-line
  }, [user, token]);

  const numarRezervari = rezervari.length;
  const venitTotal = rezervari.reduce(
    (acc, r) => acc + Number(r.pretTotal || 0),
    0
  );
  const turistiUnici = useMemo(() => {
    const ids = new Set<number>();
    rezervari.forEach((r) => {
      if (r.utilizator?.id) ids.add(r.utilizator.id);
    });
    return ids.size;
  }, [rezervari]);
  const azi = new Date();
  const camereTotale = cabane.reduce(
    (acc, c) => acc + (c.camere?.length ?? 0),
    0
  );
  const camereOcupateAstazi = rezervari.reduce((acc, rez) => {
    const start = new Date(rez.dataSosire);
    const end = new Date(rez.dataPlecare);
    if (azi >= start && azi <= end) {
      acc += rez.camere?.length ?? 0;
    }
    return acc;
  }, 0);
  const gradOcupare = camereTotale
    ? Math.round((camereOcupateAstazi / camereTotale) * 100)
    : 0;
  const venitPeLuna = useMemo(() => {
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const luna = d.getMonth() + 1;
      const an = d.getFullYear();
      const venit = rezervari
        .filter((rez) => {
          const ds = new Date(rez.dataSosire);
          return ds.getFullYear() === an && ds.getMonth() + 1 === luna;
        })
        .reduce((acc, rez) => acc + Number(rez.pretTotal || 0), 0);
      return {
        luna: `${an}-${luna.toString().padStart(2, "0")}`,
        venit,
      };
    });
    return months;
  }, [rezervari]);
  const camereVenit = useMemo(() => {
    const venitPeCamera: { nrCamera: string; venit: number }[] = [];
    cabane.forEach((cabana) => {
      (cabana.camere || []).forEach((cam) => {
        let venit = 0;
        rezervari.forEach((rez) => {
          if (rez.camere?.some((c) => c.id === cam.id)) {
            const zile = Math.max(
              1,
              (new Date(rez.dataPlecare).getTime() -
                new Date(rez.dataSosire).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            venit += Number(cam.pretNoapte || 0) * zile;
          }
        });
        venitPeCamera.push({
          nrCamera: `#${cam.nrCamera} ${cabana.denumire}`,
          venit,
        });
      });
    });
    return venitPeCamera.sort((a, b) => b.venit - a.venit).slice(0, 8);
  }, [cabane, rezervari]);
  const rezervariPeCamera = useMemo(() => {
    const map = new Map<string, number>();
    cabane.forEach((cab) => {
      cab.camere?.forEach((cam) => {
        const label = `Camera #${cam.nrCamera} (${cab.denumire})`;
        map.set(label, 0);
      });
    });
    rezervari.forEach((rez) => {
      rez.camere?.forEach((cam) => {
        const cab = cabane.find((c) => c.id === cam.idCabana);
        const label = cab
          ? `Camera #${cam.nrCamera} (${cab.denumire})`
          : `Camera #${cam.nrCamera}`;
        map.set(label, (map.get(label) || 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [cabane, rezervari]);

  const colors = [
    "#36d399",
    "#2563eb",
    "#facc15",
    "#dc2626",
    "#a21caf",
    "#0ea5e9",
    "#f472b6",
  ];
  const scoruri = cabane
    .map((c) => Number(c.scorRecenzii) || 0)
    .filter(Boolean);
  const scorMediuRecenzii = scoruri.length
    ? (scoruri.reduce((a, b) => a + b, 0) / scoruri.length).toFixed(2)
    : "0.00";
  const handleOpenEditCabana = (cabana: Cabana) => {
    setEditCabana(cabana);
    setFormCabana({
      denumire: cabana.denumire || "",
      locatie: cabana.locatie || "",
      altitudine: cabana.altitudine || 0,
      contactEmail: cabana.contactEmail || "",
      contactTelefon: cabana.contactTelefon || "",
      descriere: cabana.descriere || "",
    });
    setError("");
  };

  const handleEditCabanaInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormCabana((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleEditCabanaSave = async () => {
    if (!editCabana || !token) return;
    setError("");
    try {
      await axios.put(
        `http://localhost:5000/cabane/${editCabana.id}`,
        formCabana,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditCabana(null);
      setFormCabana({
        denumire: "",
        locatie: "",
        altitudine: 0,
        contactEmail: "",
        contactTelefon: "",
        descriere: "",
      });
      await refetchAllData();
    } catch (err: unknown) {
      setError(getAxiosErrorMsg(err, "Eroare la editarea cabanei."));
    }
  };

  const handleOpenEditCamera = (camera: Camera, cabanaId: number) => {
    setEditCamera({ camera, cabanaId });
    setFormCamera({
      nrCamera: camera.nrCamera,
      pretNoapte: camera.pretNoapte,
      nrPersoane: camera.nrPersoane,
      descriere: camera.descriere || "",
    });
    setError("");
  };

  const handleEditCameraInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormCamera((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleEditCameraSave = async () => {
    if (!editCamera || !token) return;
    setError("");
    try {
      await axios.put(
        `http://localhost:5000/camere/${editCamera.camera.id}`,
        { ...formCamera, idCabana: editCamera.cabanaId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditCamera(null);
      setFormCamera({
        nrCamera: 0,
        pretNoapte: 0,
        nrPersoane: 0,
        descriere: "",
      });
      await refetchAllData();
    } catch (err: unknown) {
      setError(getAxiosErrorMsg(err, "Eroare la editarea camerei."));
    }
  };

  if (loading || loadingData)
    return (
      <div className="w-screen h-screen flex items-center justify-center text-white text-xl">
        Loading dashboard...
      </div>
    );
  if (!user || !token)
    return (
      <div className="w-screen h-screen flex items-center justify-center text-red-500 text-xl">
        Not authenticated.
      </div>
    );

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center text-white px-4 py-10 pt-28"
      style={{
        backgroundImage:
          'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
      }}
    >
      <BusinessNavbar />

      <div className="max-w-6xl mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#21262d]/90 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-[#31363c]">
            <div className="text-3xl font-extrabold">{numarRezervari}</div>
            <div className="text-gray-300 mt-3 text-base">Total rezervări</div>
          </div>
          <div className="bg-[#21262d]/90 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-[#31363c]">
            <div className="text-3xl font-extrabold">{venitTotal} RON</div>
            <div className="text-gray-300 mt-3 text-base">Venit total</div>
          </div>
          <div className="bg-[#21262d]/90 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-[#31363c]">
            <div className="text-3xl font-extrabold">{turistiUnici}</div>
            <div className="text-gray-300 mt-3 text-base">Clienți unici</div>
          </div>
          <div className="bg-[#21262d]/90 rounded-2xl p-8 flex flex-col items-center shadow-lg border border-[#31363c]">
            <div className="text-3xl font-extrabold">{gradOcupare}%</div>
            <div className="text-gray-300 mt-3 text-base">Grad ocupare azi</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#11141a]/90 rounded-2xl p-7 border border-[#23282f] shadow-md">
            <div className="font-bold text-lg mb-5 text-white">
              Evoluție venituri pe lună (ultimele 6 luni)
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={venitPeLuna}>
                <CartesianGrid strokeDasharray="4 4" stroke="#293040" />
                <XAxis dataKey="luna" stroke="#b5b8c3" fontSize={13} />
                <YAxis stroke="#b5b8c3" fontSize={13} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="venit"
                  stroke="#36d399"
                  strokeWidth={3}
                  dot={{
                    r: 6,
                    fill: "#36d399",
                    stroke: "#11141a",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 8,
                    fill: "#2563eb",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
                <Brush dataKey="luna" height={20} stroke="#36d399" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#11141a]/90 rounded-2xl p-7 border border-[#23282f] shadow-md">
            <div className="font-bold text-lg mb-5 text-white">
              Top camere după venit generat
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={camereVenit} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nrCamera" type="category" width={180} />
                <Tooltip />
                <Bar dataKey="venit" fill="#2563eb">
                  <LabelList dataKey="venit" position="right" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#11141a]/90 rounded-2xl p-7 border border-[#23282f] shadow-md">
            <div className="font-bold text-lg mb-5 text-white">
              Distribuție rezervări pe camere
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart
                margin={{
                  top: 20,
                  right: 40,
                  bottom: 50,
                  left: 40,
                }}
              >
                <Pie
                  data={rezervariPeCamera}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  dataKey="value"
                  labelLine={true}
                  label={({ value }) => (value > 0 ? `${value}` : "")}
                >
                  {rezervariPeCamera.map((_, idx) => (
                    <Cell key={idx} fill={colors[idx % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  layout="horizontal"
                  iconSize={18}
                  wrapperStyle={{
                    marginTop: 24,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 600,
                    textAlign: "center",
                    width: "100%",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#11141a]/90 rounded-2xl p-7 border border-[#23282f] shadow-md flex flex-col items-center justify-center">
            <div className="font-bold text-lg mb-5 text-white">
              Scor mediu recenzii
            </div>
            <StarRating score={Number(scorMediuRecenzii)} />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-[#161b22]/90 p-8 rounded-lg shadow-lg border border-[#30363d] mt-6">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Dashboard: Cabane & Rezervări
        </h1>
        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {cabane.length === 0 ? (
          <p className="text-center text-gray-400">
            Nu ai cabane înregistrate.
          </p>
        ) : (
          cabane.map((cabana) => (
            <div
              key={cabana.id}
              className="mb-12 bg-[#0d1117] p-6 rounded-lg border border-[#30363d] shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">{cabana.denumire}</h2>
                <button
                  className="text-sm px-4 py-1 bg-blue-700 rounded hover:bg-blue-800"
                  onClick={() => handleOpenEditCabana(cabana)}
                >
                  Editează cabana
                </button>
              </div>
              <p className="text-gray-300">
                Locație: {cabana.locatie} | Altitudine: {cabana.altitudine} m
              </p>
              <p className="text-gray-300">
                Contact: {cabana.contactEmail} | {cabana.contactTelefon}
              </p>
              <p className="text-gray-400 mb-2">{cabana.descriere}</p>
              <div className="flex items-center gap-3 mb-4">
                <StarRating score={Number(cabana.scorRecenzii ?? 0)} />
                <span className="text-gray-400 text-sm">
                  {cabana.nrRecenzii || 0} recenzii
                </span>
              </div>

              <div>
                <h3 className="text-xl font-semibold mt-4 mb-2">Camere</h3>
                {(cabana.camere ?? []).length === 0 ? (
                  <p className="text-gray-400">No rooms found.</p>
                ) : (
                  <ul className="space-y-2">
                    {(cabana.camere ?? []).map((camera) => (
                      <li
                        key={camera.id}
                        className="flex gap-4 items-center border border-[#30363d] rounded px-4 py-2 bg-[#1a1f24]"
                      >
                        <div className="w-28 h-20 flex-shrink-0">
                          {camera.imageUrl ? (
                            <img
                              src={camera.imageUrl}
                              alt={`Room ${camera.nrCamera}`}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300 rounded text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold">
                            Camera #{camera.nrCamera}
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            Capacitate: {camera.nrPersoane} pers.
                          </span>
                          <span className="text-sm text-gray-400 ml-2">
                            Preț: {camera.pretNoapte} RON/noapte
                          </span>
                          {camera.descriere && (
                            <span className="block text-xs text-gray-500">
                              {camera.descriere}
                            </span>
                          )}
                        </div>
                        <button
                          className="ml-auto text-xs bg-yellow-600 hover:bg-yellow-700 rounded px-3 py-1"
                          onClick={() =>
                            handleOpenEditCamera(camera, cabana.id)
                          }
                        >
                          Editează camera
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Rezervări</h3>
                {rezervari.filter((rez) =>
                  (rez.camere ?? []).some((c) => c.idCabana === cabana.id)
                ).length === 0 ? (
                  <p className="text-gray-400">No reservations found.</p>
                ) : (
                  <div className="space-y-3">
                    {rezervari
                      .filter((rez) =>
                        (rez.camere ?? []).some((c) => c.idCabana === cabana.id)
                      )
                      .map((rez) => (
                        <div
                          key={rez.id}
                          className="border border-[#30363d] bg-[#1a1f24] rounded px-4 py-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              Rezervarea #{rez.id}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(rez.dataSosire).toLocaleDateString()} →{" "}
                              {new Date(rez.dataPlecare).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-300 mt-1">
                            Număr de persoane: {rez.nrPersoane} | Total: {rez.pretTotal}{" "}
                            RON
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Camere rezervate:{" "}
                            {(rez.camere ?? [])
                              .map((c) => c.nrCamera)
                              .join(", ")}
                          </div>
                          {rez.utilizator &&
                            (rez.utilizator.nume ||
                              rez.utilizator.prenume ||
                              rez.utilizator.email) && (
                              <div className="text-xs text-gray-500 mt-1">
                                Rezervat de:{" "}
                                {[rez.utilizator.nume, rez.utilizator.prenume]
                                  .filter(Boolean)
                                  .join(" ")}
                                {rez.utilizator.email
                                  ? ` (${rez.utilizator.email})`
                                  : ""}
                              </div>
                            )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {editCabana && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#161b22] p-8 rounded-lg shadow-lg border border-[#30363d] w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Editează Cabana</h3>
            <input
              name="denumire"
              value={formCabana.denumire || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Denumire"
            />
            <input
              name="locatie"
              value={formCabana.locatie || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Locație"
            />
            <input
              name="altitudine"
              type="number"
              value={formCabana.altitudine || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Altitudine"
            />
            <input
              name="contactEmail"
              value={formCabana.contactEmail || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Contact email"
            />
            <input
              name="contactTelefon"
              value={formCabana.contactTelefon || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Contact telefon"
            />
            <textarea
              name="descriere"
              value={formCabana.descriere || ""}
              onChange={handleEditCabanaInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Descriere"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditCabana(null)}
                className="bg-gray-700 px-4 py-1 rounded"
              >
                Renunță
              </button>
              <button
                onClick={handleEditCabanaSave}
                className="bg-blue-700 px-4 py-1 rounded"
              >
                Salvează
              </button>
            </div>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      )}

      {editCamera && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#161b22] p-8 rounded-lg shadow-lg border border-[#30363d] w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Editează Camera #{formCamera.nrCamera}
            </h3>
            <input
              name="nrCamera"
              type="number"
              value={formCamera.nrCamera || ""}
              onChange={handleEditCameraInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Număr camera"
            />
            <input
              name="pretNoapte"
              type="number"
              value={formCamera.pretNoapte || ""}
              onChange={handleEditCameraInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Preț/noapte"
            />
            <input
              name="nrPersoane"
              type="number"
              value={formCamera.nrPersoane || ""}
              onChange={handleEditCameraInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Capacitate"
            />
            <textarea
              name="descriere"
              value={formCamera.descriere || ""}
              onChange={handleEditCameraInput}
              className="mb-2 w-full px-2 py-1 rounded bg-[#23282f]"
              placeholder="Descriere"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditCamera(null)}
                className="bg-gray-700 px-4 py-1 rounded"
              >
                Renunță
              </button>
              <button
                onClick={handleEditCameraSave}
                className="bg-blue-700 px-4 py-1 rounded"
              >
                Salvează
              </button>
            </div>
            {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
