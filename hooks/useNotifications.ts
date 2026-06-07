"use client";

import { useEffect, useMemo, useState } from "react";
import { platformService } from "@/services/platform.service";
import type { Notification } from "@/types/platform";

export function useNotifications(enabled: boolean, intervalMs = 60000) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await platformService.notifications.mine();
        if (!cancelled) setNotifications(result);
      } catch (error) {
        console.error("[notifications] polling failed", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, intervalMs);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [enabled, intervalMs]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.is_read).length,
    [notifications]
  );

  async function markAsRead(id: string) {
    const updated = await platformService.notifications.read(id);
    setNotifications((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );
  }

  return { notifications, unreadCount, loading, markAsRead };
}
