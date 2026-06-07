export type QuestionStatus =
  | "PENDING_AI"
  | "ANSWERED_BY_AI"
  | "REQUESTED_TEACHER"
  | "ASSIGNED_TO_TEACHER"
  | "ANSWERED_BY_TEACHER"
  | "CLOSED";

export type Question = {
  id: string;
  title?: string | null;
  question_text?: string | null;
  question_image_url?: string | null;
  image_url?: string | null;
  subject_id?: string | null;
  level_id?: string | null;
  student_id?: string | null;
  teacher_id?: string | null;
  assigned_teacher_id?: string | null;
  status?: QuestionStatus | string;
  teacher_requested?: boolean;
  language?: string;
  sync_status?: string;
  answered_at?: string | null;
  created_at?: string;
  updated_at?: string;
  subject?: QuestionSubject | null;
  level?: QuestionLevel | null;
  student?: QuestionUser | null;
  assigned_teacher?: QuestionUser | null;
  ai_answer?: AIAnswer | null;
  ai_answers?: AIAnswer[];
  teacher_answer?: TeacherAnswer | null;
  teacher_answers?: TeacherAnswer[];
  has_ai_answer?: boolean;
  has_teacher_answer?: boolean;
};

export type QuestionSubject = {
  id: string;
  name_fr?: string | null;
  name_en?: string | null;
};

export type QuestionLevel = {
  id: string;
  name_fr?: string | null;
  name_en?: string | null;
};

export type QuestionUser = {
  id: string;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  profile_url?: string | null;
};

export type AIAnswer = {
  id: string;
  question_id?: string;
  answer_text?: string | null;
  answer?: string | null;
  status?: string | null;
  model?: string | null;
  language?: string | null;
  created_at?: string;
};

export type TeacherAnswer = {
  id: string;
  question_id?: string;
  teacher_id?: string;
  answer_text?: string | null;
  attachment_url?: string | null;
  status?: string | null;
  language?: string | null;
  created_at?: string;
  updated_at?: string;
  teacher?: QuestionUser | null;
};

export type CreateQuestionPayload = {
  title?: string;
  student_id?: string;
  question_text: string;
  subject_id?: string;
  level_id?: string;
  question_image_url?: string;
  image_url?: string;
  language?: string;
  answer_mode?: "AI" | "TEACHER";
  requested_teacher_id?: string | null;
};
