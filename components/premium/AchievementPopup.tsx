"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Award, X } from "lucide-react";

export function AchievementPopup({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed bottom-5 right-5 z-50 w-[min(92vw,360px)] rounded-[1.5rem] bg-[#071d3a] p-5 text-white shadow-2xl"
          role="status"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f6c445] text-[#071d3a]">
                <Award size={24} />
              </span>
              <div>
                <p className="font-black">{title}</p>
                <p className="mt-1 text-sm font-bold leading-6 text-white/70">{message}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl bg-white/10 p-2" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
