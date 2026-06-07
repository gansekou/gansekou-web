import type { GansekouRole, User } from "./user";

export type { GansekouRole };

export type PreferredLanguage = "FR" | "EN";
export type RegisterEmailPayload = {
  firebase_uid?: string;
  nom: string;
  prenom: string;
  email: string;
  phone: string;
  genre: string;
  age: number;
  password?: string;
  preferred_language: PreferredLanguage;
  role: "ELEVE";
};

export type FirebaseLoginPayload = {
  id_token: string;
  preferred_language: PreferredLanguage;
  role: GansekouRole;
};

export type AuthResponse = {
  access_type: "firebase" | string;
  is_new_user: boolean;
  user: User;
};
