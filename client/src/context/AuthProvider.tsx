import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext} from "./AuthContext";
import { getToken, getUser } from "../utils/localStorage";
import { User } from "../constants/user";

interface JwtPayload {
  exp: number;
  [key: string]: unknown;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate("/signin", { replace: true });
  }, [navigate]);

  const login = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }, []);

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getToken();
    let timeout: ReturnType<typeof setTimeout>;

    const tryInitialize = () => {
      if (!storedUser || !storedToken) {
        setLoading(false);
        return;
      }

      let payload: JwtPayload;
      try {
        payload = JSON.parse(atob(storedToken.split(".")[1]));
      } catch {
        console.warn("Invalid or malformed token. Logging out.");
        logout();
        setLoading(false);
        return;
      }

      if (!payload?.exp || typeof payload.exp !== "number") {
        console.warn("Token missing 'exp'. Logging out.");
        logout();
        setLoading(false);
        return;
      }

      const expTime = payload.exp * 1000;
      const now = Date.now();

      if (now >= expTime) {
        console.warn("Token expired on load. Logging out.");
        logout();
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setToken(storedToken);

      const delay = expTime - now;
      timeout = setTimeout(() => {
        console.warn("Token expired. Auto-logout triggered.");
        logout();
      }, delay);

      setLoading(false);
    };

    tryInitialize();

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [logout]);

  const contextValue = useMemo(
    () => ({ user, token, loading, login, logout, setUser }), // ADĂUGAT setUser
    [user, token, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
