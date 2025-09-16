import { useContext, useState } from "react";
import BusinessNavbar from "../components/BusinessNavbar";
import axios from "axios";
import {
  getToken,
  setUser as setUserInLocalStorage,
} from "../utils/localStorage";
import { AuthContext } from "../context/AuthContext";
import { User } from "../constants/user";

const BusinessProfile = () => {
  const authContext = useContext(AuthContext);
  const { user, setUser } = authContext ?? {};

  const [nume, setNume] = useState(user?.nume || "");
  const [prenume, setPrenume] = useState(user?.prenume || "");
  const [telefon, setTelefon] = useState(user?.telefon || "");
  const [email, setEmail] = useState(user?.email || "");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      const token = getToken();
      const res = await axios.put(
        `http://localhost:5000/utilizatori/${user?.id}`,
        { nume, prenume, telefon, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedUser: User = {
        ...user!,
        ...res.data,
        nume: res.data.nume ?? nume,
        prenume: res.data.prenume ?? prenume,
        email: res.data.email ?? email,
        telefon: res.data.telefon ?? telefon,
        created_at: res.data.created_at ?? user!.created_at,
        updated_at: res.data.updated_at ?? new Date().toISOString(),
      };
      setUser?.(updatedUser);
      setUserInLocalStorage(updatedUser);
      setSuccess("Profilul de proprietar a fost actualizat cu succes.");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Eroare la actualizarea profilului business.");
      setSuccess("");
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
      <BusinessNavbar />
      <div className="max-w-xl mx-auto bg-[#161b22]/90 p-8 rounded-lg shadow-lg border border-[#30363d] mt-24 text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Cont de proprietar
        </h1>

        {!user ? (
          <p className="text-center text-gray-400">
            Niciun proprietar conectat.
          </p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nume
              </label>
              <input
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Prenume
              </label>
              <input
                value={prenume}
                onChange={(e) => setPrenume(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Telefon
              </label>
              <input
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Rol</label>
              <input
                value={user.rol}
                disabled
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white"
              />
            </div>

            {success && (
              <p className="text-green-400 text-sm text-center">{success}</p>
            )}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 mt-4 rounded font-semibold"
            >
              Salvează schimbările
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfile;
