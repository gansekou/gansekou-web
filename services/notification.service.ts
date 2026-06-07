import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { Notification } from "@/types/notification";

export const notificationService = {
  mine: () => apiFetch<Notification[]>(ENDPOINTS.notifications.me),
  all: () => apiFetch<Notification[]>(ENDPOINTS.notifications.all),
  read: (id: string) =>
    apiFetch<Notification>(ENDPOINTS.notifications.read(id), { method: "POST" }),
};
