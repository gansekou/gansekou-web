export type GansekouRole =
  | "ELEVE"
  | "ENSEIGNANT_EN_ATTENTE"
  | "ENSEIGNANT"
  | "ADMIN"
  | "PROMOTEUR"
  | "ADMINISTRATEUR";

export type User = {
  id: string;
  firebase_uid: string;
  nom: string;
  prenom: string;
  genre?: string | null;
  email?: string | null;
  phone?: string | null;
  age?: number | null;
  role: GansekouRole;
  address_id?: string | null;
  school_id?: string | null;
  level_id?: string | null;
  preferred_language: string;
  status: string;
  is_premium?: boolean;
  profile_url?: string | null;
  proof_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
