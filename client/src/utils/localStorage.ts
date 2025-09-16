import { User } from "../constants/user";
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};
export const setToken = (token: string): void => {
  localStorage.setItem("token", token);
};
export const getUser = (): User | null => {
  const raw = localStorage.getItem("user");
  try {
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};
export const setUser = (user: User): void => {
  localStorage.setItem("user", JSON.stringify(user));
};
export const clearAuth = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
