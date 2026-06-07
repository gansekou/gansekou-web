import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type {
  Badge,
  BadgeCheckResult,
  StudentBadge,
  StudentGamificationProfile,
} from "@/types/gamification";

export const gamificationService = {
  profile: () =>
    apiFetch<StudentGamificationProfile>(ENDPOINTS.gamification.profile),
  myBadges: () => apiFetch<StudentBadge[]>(ENDPOINTS.gamification.myBadges),
  badges: () => apiFetch<Badge[]>(ENDPOINTS.gamification.badges),
  checkBadges: () =>
    apiFetch<BadgeCheckResult>(ENDPOINTS.gamification.checkBadges, {
      method: "POST",
    }),
};
