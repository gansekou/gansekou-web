"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Wifi } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import type { User } from "@/types/user";

export function RealtimeNotificationBell({
  user,
  labels,
}: {
  user: User;
  labels: { title: string; empty: string; open: string };
}) {
  const { notifications, unreadCount, markAsRead } = useNotifications(Boolean(user), 45000);
  const [open, setOpen] = useState(false);
  const { connected, lastEvent } = useRealtimeEvents(user?.id, {
    disconnected: labels.empty,
    reconnecting: labels.open,
  });

  const count = unreadCount + (lastEvent ? 1 : 0);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f6c445]"
        aria-label={labels.open}
      >
        <Bell size={20} />
        {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[#c62828] px-2 py-0.5 text-xs font-black text-white">{count}</span>}
        <span className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white ${connected ? "bg-[#0f5f3a]" : "bg-slate-300"} p-1`}>
          <Wifi size={10} className="text-white" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-14 z-50 w-[min(92vw,360px)] rounded-[1.5rem] border border-slate-100 bg-white p-3 shadow-2xl"
          >
            <div className="flex items-center justify-between px-2 py-2">
              <p className="font-black text-[#071d3a]">{labels.title}</p>
              <Link href="/notifications" className="text-sm font-black text-[#0f5f3a]">Gansekou</Link>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markAsRead(item.id)}
                  className={`mb-2 block w-full rounded-2xl p-3 text-left ${item.is_read ? "bg-slate-50" : "bg-[#fff7df]"}`}
                >
                  <span className="block font-black text-[#071d3a]">{item.title}</span>
                  <span className="mt-1 block text-sm font-bold leading-5 text-slate-500">{item.message}</span>
                </button>
              ))}
              {!notifications.length && <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{labels.empty}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
