export type EducationCycle = {
  id: string;
  name_fr: string;
  name_en: string;
  created_at?: string;
};

export type Level = {
  id: string;
  cycle_id?: string | null;
  name_fr: string;
  name_en: string;
  order_index: number;
  created_at?: string;
};

export type Specialty = {
  id: string;
  name_fr: string;
  name_en: string;
  description_fr?: string | null;
  description_en?: string | null;
  created_at?: string;
};

export type Subject = {
  id: string;
  level_id: string;
  specialty_id?: string | null;
  name_fr: string;
  name_en: string;
  coefficient: number;
  created_at?: string;
};
