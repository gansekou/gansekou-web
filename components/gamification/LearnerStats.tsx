"use client";

import { Flame, Medal, Star, Trophy, Zap } from "lucide-react";
import { CircularProgress } from "@/components/ui/CircularProgress";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";

type Labels = {
  xp: string;
  level: string;
  streak: string;
  bestStreak: string;
  badges: string;
  completed: string;
  passed: string;
  weeklyGoal: string;
  weeklyGoalDetail: string;
};

export function LearnerStats({
  profile,
  badges,
  labels,
}: {
  profile?: StudentGamificationProfile | null;
  badges: StudentBadge[];
  labels: Labels;
}) {
  const points = profile?.points ?? 0;
  const level = profile?.level ?? Math.max(1, Math.floor(points / 250) + 1);
  const progress = points % 250 ? Math.round(((points % 250) / 250) * 100) : points > 0 ? 100 : 18;

  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="ds-card rounded-[1.5rem] p-5">
        <CircularProgress value={progress} label={`${labels.level} ${level}`} detail={labels.weeklyGoalDetail} />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Stat icon={Zap} label={labels.xp} value={points} />
          <Stat icon={Flame} label={labels.streak} value={profile?.current_streak_days ?? 0} />
          <Stat icon={Trophy} label={labels.passed} value={profile?.quizzes_passed ?? 0} />
        </div>
      </div>
      <div className="ds-card rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{labels.badges}</p>
            <h2 className="mt-1 text-2xl font-black text-[#071d3a]">{badges.length}</h2>
          </div>
          <Medal className="text-[#f6c445]" size={34} />
        </div>
        <div className="mt-5 space-y-2">
          {badges.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7df] text-[#b88a00]">
                <Star size={18} />
              </span>
              <div>
                <p className="text-sm font-black text-[#071d3a]">{item.badge?.name_fr || item.badge_id.slice(0, 8)}</p>
                <p className="text-xs font-bold text-slate-500">{new Date(item.earned_at).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          ))}
          {!badges.length ? (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{labels.weeklyGoal}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <Icon className="text-[#0f5f3a]" size={19} />
      <p className="mt-2 text-xl font-black text-[#071d3a]">{value}</p>
      <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
  );
}
