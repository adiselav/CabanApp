import { Rol } from "./roles";

export interface User {
  id: number;
  email: string;
  nume: string;
  prenume: string;
  telefon: string;
  rol: Rol;
  created_at: string;
  updated_at: string;
  google_id?: string;
}
