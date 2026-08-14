export type ContentType = "COURS" | "EXERCICE" | "SUJET";

export type ContentStatus =
  | "PENDING"
  | "APPROVED"
  | "ARCHIVED"
  | "DRAFT"
  | "PUBLISHED"
  | string;

export type Content = {
  id: string;
  author_id: string;
  subject_id: string;

  // Plusieurs niveaux
  levels?: LevelRef[];
  level_ids?: string[];

  // Plusieurs spécialités
  specialties?: SpecialtyRef[];
  specialty_ids?: string[];

  title?: string | null;
  description?: string | null;

  translations?: ContentTranslation[];

  content_type: ContentType | string;

  file_url?: string | null;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  external_url?: string | null;

  estimated_duration_minutes?: number | null;
  difficulty_level?: string | null;
  tags?: string | null;

  status: ContentStatus;

  is_premium: boolean;
  is_featured?: boolean;
  is_downloadable?: boolean;
  is_available_offline?: boolean;
  allow_comments?: boolean;
  allow_ai_summary?: boolean;

  version?: number;

  total_views?: number;
  total_downloads?: number;
  total_likes?: number;
  total_shares?: number;

  average_rating?: number | null;

  published_at?: string | null;
  created_at?: string;
  updated_at?: string;

  related_contents?: RelatedContent[];
};

export type ContentCreatePayload = {
  author_id: string;

  subject_id: string;

  // Plusieurs niveaux obligatoires
  level_ids: string[];

  // Plusieurs spécialités possibles
  specialty_ids?: string[];

  related_content_ids?: string[];

  content_type: string;

  file_url?: string | null;
  thumbnail_url?: string | null;

  status?: string;

  is_premium?: boolean;
  is_available_offline?: boolean;

  version?: number;

  title?: string | null;
  description?: string | null;

  difficulty_level?: string | null;

  estimated_duration_minutes?: number | null;

  tags?: string | null;
};

export type ContentTranslation = {
  id: string;
  content_id: string;
  language: string;
  title: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ContentAnalytics = {
  content_id: string;
  views: number;
  downloads: number;
  likes: number;
  shares: number;
  rating: number | null;
};

export type ContentRelation = {
  id: string;
  parent_content_id: string;
  child_content_id: string;
  relation_type: string;
  created_at?: string;
};

export type RelatedContent = {
  id: string;
  title?: string | null;
  content_type: ContentType | string;
};

export type LevelRef = {
  id: string;
  name_fr?: string;
  name_en?: string;
};

export type SpecialtyRef = {
  id: string;
  name_fr?: string;
  name_en?: string;
};
