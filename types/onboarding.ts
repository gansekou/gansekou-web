import type { TeacherSubject, UUID } from "@/types/platform";
import type { User } from "@/types/user";

export type UpdateMyProfilePayload = {
  level_id?: UUID | null;
  school_id?: UUID | null;
  preferred_language?: string | null;
  profile_url?: string | null;
};

export type TeacherApplicationPayload = {
  subject_ids: UUID[];
  proof_url: string;
  message?: string | null;
};

export type TeacherApplicationResponse = {
  user: User;
  teacher_subjects: TeacherSubject[];
};
