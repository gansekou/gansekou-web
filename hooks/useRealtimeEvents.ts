"use client";

import { useEffect, useState } from "react";
import { realtimeSocketManager } from "@/lib/websocket-manager";
import { notifyGansekou } from "@/components/ui/ToastProvider";

export type RealtimeEvent = {
  type?: string;
  title?: string;
  message?: string;
  xp?: number;
  [key: string]: unknown;
};

export function useRealtimeEvents(
  userId?: string | null,
  labels?: {
    connected?: string;
    disconnected?: string;
    reconnecting?: string;
  }
) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    if (!userId) return;
    const activeUserId = userId;

    realtimeSocketManager.connect(activeUserId);
    const unsubscribe = realtimeSocketManager.subscribe(
      (event) => {
        const parsed = event as RealtimeEvent;
        setLastEvent(parsed);
        notifyGansekou({
          kind: parsed.type?.includes("BADGE") || parsed.type?.includes("XP") ? "reward" : "info",
          title: parsed.title || labels?.connected || "Gansekou",
          message: parsed.message,
        });
      },
      setConnected
    );

    function onOnline() {
      notifyGansekou({ kind: "info", title: labels?.reconnecting || "Reconnexion Gansekou" });
      realtimeSocketManager.connect(activeUserId);
    }

    function onOffline() {
      notifyGansekou({ kind: "info", title: labels?.disconnected || "Mode hors ligne" });
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [labels?.connected, labels?.disconnected, labels?.reconnecting, userId]);

  return { connected, lastEvent };
}
