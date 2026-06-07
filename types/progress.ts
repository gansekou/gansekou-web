export type ContentProgress = {
  id: string;
  student_id: string;
  content_id: string;
  progress_percent: number;
  time_spent_minutes?: number;
  is_completed?: boolean;
  started_at?: string;
  completed_at?: string | null;
  updated_at?: string;
};
