
import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { User, GansekouRole } from "@/types/user";
import type {
  TeacherApplicationPayload,
  TeacherApplicationResponse,
  UpdateMyProfilePayload,
} from "@/types/onboarding";

type AdminSubscriptionActivationResponse = {
  user_id: string;
  period: "month" | "year";
  duration_days: number;
  starts_at: string;
  expires_at: string;
  is_premium: boolean;
};

export const userService = {
  me: () => apiFetch<User>(ENDPOINTS.users.meProfile),

  updateMe: (payload: Partial<User>) =>
    apiFetch<User>(ENDPOINTS.users.updateMe, {
      method: "PATCH",
      body: payload,
    }),

  updateMyProfile: (payload: UpdateMyProfilePayload) =>
    apiFetch<User>(ENDPOINTS.users.updateMyProfile, {
      method: "PATCH",
      body: payload,
    }),

  submitTeacherApplication: (payload: TeacherApplicationPayload) =>
    apiFetch<TeacherApplicationResponse>(
      ENDPOINTS.users.teacherApplication,
      {
        method: "POST",
        body: payload,
      },
    ),

  all: () => apiFetch<User[]>(ENDPOINTS.users.all),

  byId: (id: string) =>
    apiFetch<User>(ENDPOINTS.users.byId(id)),

  adminUpdateUserRole: (userId: string, role: GansekouRole) =>
    apiFetch<User>(ENDPOINTS.admin.updateUserRole(userId), {
      method: "PATCH",
      body: { role },
    }),

  adminApproveTeacher: (userId: string) =>
    apiFetch<User>(ENDPOINTS.admin.updateUserRole(userId), {
      method: "PATCH",
      body: { role: "ENSEIGNANT" },
    }),

  adminRejectTeacher: (userId: string) =>
    apiFetch<User>(ENDPOINTS.admin.updateUserRole(userId), {
      method: "PATCH",
      body: { role: "ELEVE" },
    }),

  adminActivateSubscription: (
    userId: string,
    period: "month" | "year",
  ) =>
    apiFetch<AdminSubscriptionActivationResponse>(
      ENDPOINTS.payments.adminActivateSubscription(userId),
      {
        method: "POST",
        body: { period },
      },
    ),
};
