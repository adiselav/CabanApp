import { useState, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const SignUp = () => {
  const [form, setForm] = useState({
    email: "",
    parola: "",
    nume: "",
    prenume: "",
    telefon: "",
  });
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("You must agree with the GDPR policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      authContext?.login(data.user, data.token);
      authContext?.setUser(data.user);

      navigate("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-screen min-h-screen flex items-center justify-center bg-cover bg-center text-white px-4"
      style={{
        backgroundImage:
          'url("/Creasta-Muntilor-Piatra-Craiului-Fotografii-aeriene-1.jpg")',
      }}
    >
      <div className="w-full max-w-md bg-[#161b22]/90 p-8 rounded-lg shadow-lg border border-[#30363d]">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Creare cont
        </h1>

        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="parola"
            placeholder="Parola"
            value={form.parola}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="nume"
            placeholder="Nume"
            value={form.nume}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="prenume"
            placeholder="Prenume"
            value={form.prenume}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="telefon"
            placeholder="Telefon"
            value={form.telefon}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              id="gdpr"
            />
            <label htmlFor="gdpr" className="text-sm">
              Sunt de acord cu politica{" "}
              <a
                href="https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                GDPR
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={!agree || loading}
            className={`w-full ${
              agree
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed"
            } transition text-white py-2 rounded font-medium`}
          >
            {loading ? "Înregistrare..." : "Înregistrare"}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-sm">
          <a href="/signin" className="text-blue-500 hover:underline">
            Aveți deja un cont?
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
