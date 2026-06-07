"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineStatus({ label }: { label: string }) {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const task = window.setTimeout(() => {
      setMounted(true);
      update();
    }, 0);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.clearTimeout(task);
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!mounted) return null;
  if (online) return null;

  return (
    <div className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-amber-200 bg-[#fff7df] px-4 py-3 text-sm font-black text-[#071d3a] shadow-2xl shadow-[#071d3a]/15" role="status">
      <WifiOff size={18} />
      {label}
    </div>
  );
}
