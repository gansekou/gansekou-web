"use client";

import { CalendarCheck, Crown, Flame, Medal, Sparkles, Trophy, Zap } from "lucide-react";
import type { StudentBadge, StudentGamificationProfile } from "@/types/gamification";

type JourneyLabels = {
  title: string;
  subtitle: string;
  dailyMission: string;
  weeklyGoal: string;
  badgeHistory: string;
  rareBadge: string;
  legendaryBadge: string;
  levelUp: string;
  nextReward: string;
  keepGoing: string;
};

export function GamificationJourney({
  profile,
  badges,
  labels,
}: {
  profile?: StudentGamificationProfile | null;
  badges: StudentBadge[];
  labels: JourneyLabels;
}) {
  const points = profile?.points ?? 0;
  const level = profile?.level ?? Math.max(1, Math.floor(points / 250) + 1);
  const nextLevelPoints = level * 250;
  const levelProgress = Math.min(100, Math.round((points / Math.max(nextLevelPoints, 1)) * 100));
  const missions = [
    { icon: Flame, label: labels.dailyMission, value: `${profile?.current_streak_days ?? 0}/7`, progress: Math.min(100, ((profile?.current_streak_days ?? 0) / 7) * 100) },
    { icon: Trophy, label: labels.weeklyGoal, value: `${profile?.quizzes_passed ?? 0}/5`, progress: Math.min(100, ((profile?.quizzes_passed ?? 0) / 5) * 100) },
    { icon: Zap, label: labels.nextReward, value: `${points}/${nextLevelPoints}`, progress: levelProgress },
  ];

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
      <div className="relative overflow-hidden rounded-[2rem] bg-[#071d3a] p-6 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="absolute right-6 top-6 h-28 w-28 rounded-full border border-[#f6c445]/30" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f6c445]">{labels.title}</p>
            <h2 className="mt-2 text-3xl font-black">{labels.subtitle}</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f6c445] px-4 py-2 text-sm font-black text-[#071d3a]">
            <Crown size={17} />
            {labels.levelUp} {level}
          </span>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {missions.map((mission, index) => {
            const Icon = mission.icon;
            return (
              <div key={`mission-${index}-${mission.label}`} className="rounded-3xl bg-white/10 p-4">
                <Icon className="text-[#f6c445]" size={22} />
                <p className="mt-4 text-sm font-black text-white/70">{mission.label}</p>
                <p className="mt-1 text-2xl font-black">{mission.value}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div className="analytics-progress h-full rounded-full bg-[#f6c445]" style={{ width: `${mission.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ds-card rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b88a00]">{labels.badgeHistory}</p>
            <h3 className="mt-1 text-2xl font-black text-[#071d3a]">{badges.length}</h3>
          </div>
          <Medal className="text-[#f6c445]" size={34} />
        </div>
        <div className="mt-5 space-y-3">
          {badges.slice(0, 4).map((item, index) => {
            const legendary = index === 0 && badges.length >= 3;
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${legendary ? "bg-[#071d3a] text-[#f6c445]" : "bg-[#fff7df] text-[#b88a00]"}`}>
                  {legendary ? <Sparkles size={18} /> : <CalendarCheck size={18} />}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#071d3a]">{item.badge?.name_fr || item.badge?.name_en || item.badge_id.slice(0, 8)}</p>
                  <p className="text-xs font-bold text-slate-500">{legendary ? labels.legendaryBadge : labels.rareBadge}</p>
                </div>
              </div>
            );
          })}
          {!badges.length ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{labels.keepGoing}</p> : null}
        </div>
      </div>
    </section>
  );
}
