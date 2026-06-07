export type ID = number | string;

export type UserRole =
  | "ELEVE"
  | "ENSEIGNANT"
  | "ADMIN"
  | "ADMINISTRATEUR"
  | "PROMOTEUR";

export type Loadable<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

export type ApiMessage = {
  message: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total?: number;
  page?: number;
  size?: number;
};
