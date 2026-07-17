import type { User } from "@/types/user";
import type { Content } from "@/types/content";
import type { Question } from "@/types/question";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";

export type UUID = string;

export type EducationCycle = {
  id: UUID;
  name_fr: string;
  name_en: string;
  created_at?: string;
};

export type Level = {
  id: UUID;
  cycle_id?: UUID | null;
  name_fr: string;
  name_en: string;
  order_index: number;
  created_at?: string;
};

export type Specialty = {
  id: UUID;
  name_fr: string;
  name_en: string;
  description_fr?: string | null;
  description_en?: string | null;
  created_at?: string;
};

export type Subject = {
  id: UUID;
  level_id: UUID;
  specialty_id?: UUID | null;
  code?: string | null;
  name_fr: string;
  name_en: string;
  description_fr?: string | null;
  description_en?: string | null;
  icon?: string | null;
  color?: string | null;
  is_active?: boolean;
  coefficient: number;
  created_at?: string;
  updated_at?: string;
};

export type TeacherSubject = {
  id: UUID;
  teacher_id: UUID;
  subject_id: UUID;
  created_at?: string;
  subject?: Subject;
};

export type Address = {
  id: UUID;
  country: string;
  region?: string | null;
  city?: string | null;
  quarter?: string | null;
  details?: string | null;
  created_at?: string;
};

export type School = {
  id: UUID;
  name: string;
  type?: string | null;
  address_id?: UUID | null;
  created_at?: string;
};

export type Notification = {
  id: UUID;
  user_id: UUID;
  title: string;
  message: string;
  language: string;
  type?: string | null;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  sync_status?: string;
  created_at: string;
};

export type StudyPlan = {
  id: UUID;
  student_id: UUID;
  title: string;
  description?: string | null;
  language: string;
  status: string;
  plan_type: string;
  duration_days: number;
  total_items: number;
  completed_items: number;
  is_ai_generated: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string;
};

export type StudyPlanItem = {
  id: UUID;
  study_plan_id: UUID;
  subject_id?: UUID | null;
  level_id?: UUID | null;
  content_id?: UUID | null;
  quiz_id?: UUID | null;
  title: string;
  description?: string | null;
  item_type: string;
  skill_name?: string | null;
  priority: string;
  estimated_minutes: number;
  order_index: number;
  is_completed: boolean;
  completed_at?: string | null;
  scheduled_for?: string | null;
};

export type Quiz = {
  id: UUID;
  author_id?: UUID;
  title: string;
  description?: string | null;
  subject_id: UUID;
  level_id: UUID;
  language: string;
  difficulty_level?: string | null;
  quiz_type: string;
  is_premium: boolean;
  is_randomized: boolean;
  allow_retry: boolean;
  passing_score: number;
  estimated_duration_minutes?: number | null;
  status?: string;
  total_attempts?: number;
  total_questions?: number;
  created_at?: string;
};

export type SubscriptionPlan = {
  id: UUID;
  code: string;
  name: string;
  price_xaf: number;
  duration_days: number;
  period?: "month" | "year" | string | null;
  description?: string | null;
  is_active?: boolean;
  is_premium?: boolean;
};

export type SubscriptionStatus = {
  is_premium: boolean;
  subscription: {
    id?: UUID;
    status?: string | null;
    period?: string | null;
    starts_at?: string | null;
    expires_at?: string | null;
    auto_renew?: boolean | null;
    plan?: {
      duration_days?: number | null;
      code?: string | null;
      name?: string | null;
      period?: string | null;
    } | null;
    plan_code?: string | null;
    plan_name?: string | null;
    duration_days?: number | null;
    [key: string]: unknown;
  } | null;
};

export type AdminGlobalStats = {
  users?: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
  };
  questions?: Record<string, number>;
  answers?: Record<string, number>;
  rates?: Record<string, number>;
  system?: Record<string, number>;
};

export type PageData = {
  profile?: User;
  contents?: Content[];
  content?: Content;
  questions?: Question[];
  question?: Question;
  quizzes?: Quiz[];
  quiz?: Quiz;
  notifications?: Notification[];
  subjects?: Subject[];
  levels?: Level[];
  cycles?: EducationCycle[];
  specialties?: Specialty[];
  studyItems?: StudyPlanItem[];
  studyPlan?: StudyPlan;
  plans?: SubscriptionPlan[];
  subscription?: SubscriptionStatus;
  stats?: unknown;
  gamificationProfile?: StudentGamificationProfile;
  badges?: StudentBadge[];
  quizHistory?: unknown;
  adaptiveProfile?: unknown;
  adaptiveWeaknesses?: unknown;
  adaptiveRecommendations?: unknown;
  users?: User[];
  schools?: School[];
  addresses?: Address[];
  [key: string]: unknown;
};
