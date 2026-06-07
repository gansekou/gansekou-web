export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  language: string;
  type?: string | null;
  data?: Record<string, unknown> | null;
  is_read: boolean;
  sync_status?: string;
  created_at: string;
};
