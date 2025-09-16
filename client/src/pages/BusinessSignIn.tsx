import { useState, FormEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const BusinessSignIn = () => {
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!agree) {
      setError("You must agree with the GDPR policy.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/auth/login",
        { email, parola },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      authContext?.login(res.data.user, res.data.token);
      authContext?.setUser(res.data.user);

      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Login failed");
      } else {
        setError("Something went wrong.");
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
          Autentificare Profil pentru afaceri
        </h1>

        {error && (
          <div className="bg-red-600/10 border border-red-600 text-red-500 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium"
            >
              Parolă
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

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
            {loading ? "Signing in..." : "Conectare"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessSignIn;
