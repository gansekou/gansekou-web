export type Badge = {
  id: string;
  code: string;
  name_fr: string;
  name_en: string;
  description_fr?: string | null;
  description_en?: string | null;
  icon_url?: string | null;
  required_points: number;
  required_quizzes_completed: number;
  is_active: boolean;
  created_at?: string;
};

export type StudentBadge = {
  id: string;
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
};

export type StudentGamificationProfile = {
  id: string;
  student_id: string;
  points: number;
  level: number;
  quizzes_completed: number;
  quizzes_passed: number;
  current_streak_days: number;
  best_streak_days: number;
  last_activity_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BadgeCheckResult = {
  message: string;
  new_badges: StudentBadge[];
};
