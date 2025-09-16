import { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import TopNavbar from "../components/TopNavbar";
import { getToken } from "../utils/localStorage";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import roLocale from "@fullcalendar/core/locales/ro";
import { EventClickArg } from "@fullcalendar/core";
import { AuthContext } from "../context/AuthContext";
import { generateProforma } from "../utils/generateProforma";

interface Cabana {
  id: number;
  denumire: string;
  locatie: string;
}

interface Camera {
  id: number;
  nrCamera: number;
  pretNoapte: number | string;
  nrPersoane: number;
  descriere?: string;
  idCabana: number;
  cabana: Cabana;
}

interface Rezervare {
  id: number;
  dataSosire: string;
  dataPlecare: string;
  nrPersoane: number;
  pretTotal: number | string;
  camere: Camera[];
  created_at: string;
}

const MyReservations = () => {
  const [rezervari, setRezervari] = useState<Rezervare[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reservationRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  const furnizor = {
    numeFirma: "SC CabanaApp SRL",
    cif: "RO12345678",
    email: "contact@cabanapp.ro",
  };

  useEffect(() => {
    const fetchReservations = async () => {
      const token = getToken();
      if (!token) {
        setError("You must be logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/rezervare/utilizator",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRezervari(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setRezervari([]);
          } else {
            setError("Could not load reservations.");
          }
        } else {
          setError("Unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleDelete = async (id: number) => {
    const token = getToken();
    try {
      await axios.delete(`http://localhost:5000/rezervare/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRezervari((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Could not cancel reservation.");
    }
  };

  const handleEventClick = (info: EventClickArg) => {
    const id = parseInt(info.event.title.match(/#(\d+)/)?.[1] || "");
    const target = reservationRefs.current[id];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("ring", "ring-blue-500");
      setTimeout(() => target.classList.remove("ring", "ring-blue-500"), 2000);
    }
  };

  const getCabanaFromRezervare = (rez: Rezervare): Cabana => {
    const firstCabana = rez.camere[0]?.cabana;
    return (
      firstCabana || { id: 0, denumire: "Necunoscut", locatie: "Necunoscut" }
    );
  };

  const events = rezervari.map((rez) => ({
    title: `Res. #${rez.id} - ${rez.nrPersoane} pers.`,
    start: rez.dataSosire,
    end: rez.dataPlecare,
    backgroundColor: "#3B82F6",
    borderColor: "#1D4ED8",
    textColor: "#ffffff",
  }));

  return (
    <div
      className="w-screen min-h-screen bg-cover bg-center text-white px-4 py-10"
      style={{
        backgroundImage:
          'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
      }}
    >
      <TopNavbar />

      <div className="max-w-4xl mx-auto bg-[#161b22]/90 p-8 rounded-lg shadow-lg border border-[#30363d] mt-24 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Rezervările mele</h1>

        <div className="mb-10 p-4 rounded shadow border border-[#30363d] bg-[#0d1117] text-white">
          <h2 className="text-xl font-semibold mb-4 text-white">
            Calendarul Rezervărilor
          </h2>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            locale={roLocale}
            firstDay={1}
            events={events}
            displayEventTime={false}
            height="auto"
            eventClick={handleEventClick}
            headerToolbar={{
              left: "title",
              center: "",
              right: "today prev,next",
            }}
            buttonText={{ today: "Azi" }}
            dayHeaderClassNames="!text-white !bg-[#161b22] !border-[#30363d]"
            dayCellClassNames={(arg) => {
              const base = "bg-[#0d1117] text-white border border-[#30363d]";
              return arg.isToday ? `${base} !bg-[#1e293b] !font-bold` : base;
            }}
            eventClassNames="bg-blue-600 text-white border border-blue-700 px-1 text-sm rounded"
          />
        </div>

        {loading ? (
          <p className="text-gray-400 text-center">Se incarca...</p>
        ) : error ? (
          <div className="bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded text-center">
            {error}
          </div>
        ) : rezervari.length === 0 ? (
          <p className="text-gray-400 text-center">
            Nu ai facut nicio rezervare pana acum.
          </p>
        ) : (
          <div className="space-y-6">
            {rezervari.map((rez) => (
              <div
                key={rez.id}
                ref={(el) => {
                  reservationRefs.current[rez.id] = el;
                }}
                className="bg-[#0d1117] p-6 rounded border border-[#30363d] hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    Rezervarea #{rez.id}
                  </h2>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                    Confirmată
                  </span>
                </div>
                <p className="text-sm text-gray-300 mb-1">
                  Perioadă: {new Date(rez.dataSosire).toLocaleDateString()} →{" "}
                  {new Date(rez.dataPlecare).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  Număr persoane: {rez.nrPersoane}
                </p>
                <p className="text-sm text-gray-300 mb-1">
                  Preț Total: {Number(rez.pretTotal).toFixed(2)} RON
                </p>
                <p className="text-sm text-gray-300">
                  Camere: {rez.camere.map((c) => c.nrCamera).join(", ")}
                </p>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleDelete(rez.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Anulează rezervarea
                  </button>

                  <button
                    onClick={() =>
                      generateProforma({
                        user: {
                          nume: user?.nume || "Nume",
                          prenume: user?.prenume || "Prenume",
                          email: user?.email || "email@example.com",
                          telefon: user?.telefon || "0000000000",
                        },
                        rezervare: {
                          id: rez.id,
                          dataSosire: rez.dataSosire,
                          dataPlecare: rez.dataPlecare,
                          nrPersoane: rez.nrPersoane,
                          pretTotal: Number(rez.pretTotal),
                          created_at: rez.created_at,
                        },
                        camere: rez.camere.map((c) => ({
                          nrCamera: c.nrCamera,
                          pretNoapte: Number(c.pretNoapte),
                        })),
                        cabana: getCabanaFromRezervare(rez),
                        furnizor: furnizor,
                      })
                    }
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-semibold"
                  >
                    Generare Proformă
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservations;
