"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import type { Notification, PageData } from "@/types/platform";

export function NotificationsPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const notifications = await platformService.notifications.mine().catch(() => [] as Notification[]);
    return { notifications };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des notifications..." load={load}>
      {({ data, reload }) => <NotificationList notifications={(data.notifications as Notification[]) || []} reload={reload} />}
    </AuthenticatedPage>
  );
}

function NotificationList({ notifications, reload }: { notifications: Notification[]; reload: () => Promise<void> }) {
  const router = useRouter();

  async function openNotification(notification: Notification) {
    if (!notification.is_read) {
      await platformService.notifications.read(notification.id).catch(() => null);
      await reload();
    }
    router.push(resolveNotificationHref(notification));
  }

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f7ef] text-[#0f5f3a]">
          <Bell size={21} />
        </div>
        <h3 className="text-2xl font-black text-[#082f1f]">Centre de notifications</h3>
      </div>
      {!notifications.length ? (
        <EmptyState title="Aucune notification" message="Les alertes importantes apparaitront ici." />
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((item) => (
            <button
              key={item.id}
              onClick={() => void openNotification(item)}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition hover:bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-[#082f1f]">{item.title}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-500">{item.message}</p>
                </div>
                {!item.is_read ? <span className="rounded-full bg-[#0f5f3a] px-3 py-1 text-xs font-black text-white">Nouveau</span> : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function resolveNotificationHref(notification: Notification) {
  const questionId = readPayloadString(notification.data, "question_id");
  if (notification.type === "TEACHER_ANSWERED_QUESTION" && questionId) return `/questions/${questionId}`;
  if (notification.type === "QUESTION_ASSIGNED_TO_TEACHER" && questionId) return `/teacher/questions/${questionId}`;
  if (notification.type === "QUESTION_AVAILABLE_FOR_SUBJECT_TEACHERS") return "/teacher/questions/pending";
  return "/notifications";
}

function readPayloadString(data: Record<string, unknown> | null | undefined, key: string) {
  const value = data?.[key];
  return typeof value === "string" ? value : "";
}
