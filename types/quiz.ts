export type Quiz = {
  id: string;
  content_id?: string | null;
  course_id?: string | null;
  author_id?: string;
  title: string;
  description?: string | null;
  subject_id: string;
  level_id: string;
  language: string;
  difficulty_level?: string | null;
  quiz_type: string;
  status?: string;
  is_premium: boolean;
  is_randomized: boolean;
  allow_retry: boolean;
  passing_score: number;
  estimated_duration_minutes?: number | null;
  total_attempts?: number;
  total_questions?: number;
  created_at?: string;
  updated_at?: string;
  questions?: QuizQuestion[];
};

export type QuizCreatePayload = {
  title: string;
  description?: string | null;
  course_id?: string | null;
  subject_id: string;
  level_id: string;
  language?: string;
  difficulty_level?: string | null;
  quiz_type?: string;
  is_premium?: boolean;
  is_randomized?: boolean;
  allow_retry?: boolean;
  passing_score?: number;
  estimated_duration_minutes?: number | null;
};

export type QuizQuestionCreatePayload = {
  question_text: string;
  explanation?: string | null;
  question_type?: QuizQuestionType;
  points?: number;
  order_index?: number;
  question_image_url?: string | null;
  is_required?: boolean;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_image_url?: string | null;
  explanation?: string | null;
  question_type: QuizQuestionType;
  points: number;
  order_index?: number;
  is_required?: boolean;
  choices?: QuizChoice[];
};

export type QuizChoiceCreatePayload = {
  choice_text: string;
  is_correct?: boolean;
};

export type QuizChoice = {
  id: string;
  question_id: string;
  choice_text: string;
  is_correct?: boolean;
  created_at?: string;
};

export type QuizQuestionType =
  | "MULTIPLE_CHOICE"
  | "SINGLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export type QuizAttemptStart = {
  attempt_id: string;
  quiz_id: string;
  started_at: string;
  resumed?: boolean;
};

export type QuizSubmitResult = {
  quiz_id: string;
  attempt_id: string;
  score: number;
  passed: boolean;
  correct_answers: number;
  total_questions: number;
  results: Array<{
    question_id: string;
    selected_choice_ids: string[];
    correct_choice_ids: string[];
    is_correct: boolean;
    points: number;
    earned_points: number;
    explanation?: string | null;
  }>;
};

export type QuizAttempt = {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  is_passed: boolean;
  started_at: string;
  completed_at?: string | null;
};

export type QuizAnalytics = {
  quiz_id: string;
  total_attempts: number;
  average_score: number;
  pass_rate: number;
};

export type QuizAIGeneratePayload = {
  subject_id: string;
  level_id: string;
  title: string;
  language?: string;
  difficulty_level?: string;
  number_of_questions?: number;
  topic?: string | null;
};

export type QuizAIGenerateResult = {
  message: string;
  quiz_id: string;
  total_questions: number;
};

export type LocalQuizQuestion = QuizQuestion & {
  choices: QuizChoice[];
};
