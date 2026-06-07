"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/hooks/useI18n";
import { DashboardShell } from "@/components/layouts/DashboardShell";
import { LoadingState } from "@/components/app/StateViews";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { StudentLevelStep } from "@/components/onboarding/StudentLevelStep";
import { TeacherApplicationStep } from "@/components/onboarding/TeacherApplicationStep";
import { onboardingService } from "@/services/onboarding.service";
import { useAuthStore } from "@/store/auth.store";
import type { Level, Subject } from "@/types/education";

type Mode = "student" | "teacher" | null;

export function ProfileCompletionWizard() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useCurrentUser();
  const updateUser = useAuthStore((state) => state.updateUser);
  const { language, t } = useI18n(user);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [mode, setMode] = useState<Mode>(null);
  const [levelId, setLevelId] = useState("");
  const [subjectIds, setSubjectIds] = useState<string[]>([]);
  const [proof, setProof] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    let active = true;
    Promise.all([onboardingService.getLevels(), onboardingService.getSubjects()])
      .then(([nextLevels, nextSubjects]) => {
        if (!active) return;
        setLevels(nextLevels);
        setSubjects(nextSubjects);
      })
      .catch((error) => {
        if (!active) return;
        setStatus(error instanceof ApiError ? error.message : "Chargement impossible.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveStudentLevel() {
    if (!levelId) return setStatus(t("onboarding.chooseLevel"));
    setSaving(true);
    try {
      const updated = await onboardingService.updateMyProfile({ level_id: levelId });
      updateUser(updated);
      setStatus(t("onboarding.studentLevelSaved"));
      router.replace("/dashboard");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function submitTeacherApplication() {
    if (!subjectIds.length) return setStatus(t("onboarding.chooseSubjects"));
    if (!proof) return setStatus(t("onboarding.uploadProof"));
    setSaving(true);
    try {
      const upload = await onboardingService.uploadProofDocument(proof);
      const response = await onboardingService.submitTeacherApplication({
        subject_ids: subjectIds,
        proof_url: upload.file_url,
        message: message || null,
      });
      updateUser(response.user);
      setStatus(t("onboarding.teacherPendingSuccess"));
      router.replace("/teacher/dashboard");
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : "Demande impossible.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <DashboardShell user={user}>
        <LoadingState label={t("state.loading")} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user}>
      <section className="mx-auto grid max-w-4xl gap-5">
        <section className="premium-surface rounded-[2rem] p-7 text-white">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t("onboarding.title")}</p>
          <h1 className="mt-3 text-3xl font-black md:text-5xl">{t("onboarding.chooseProfile")}</h1>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-white/75">{t("onboarding.subtitle")}</p>
        </section>

        <section className="ds-card rounded-[2rem] p-7">
          <OnboardingProgress step={mode ? 2 : 1} />
          {!mode ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setMode("student")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#0f5f3a]">
                <GraduationCap className="text-[#0f5f3a]" />
                <span className="mt-4 block text-xl font-black text-[#071d3a]">{t("onboarding.studentOption")}</span>
              </button>
              <button type="button" onClick={() => setMode("teacher")} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-[#0f5f3a]">
                <BookOpen className="text-[#0f5f3a]" />
                <span className="mt-4 block text-xl font-black text-[#071d3a]">{t("onboarding.teacherOption")}</span>
              </button>
            </div>
          ) : mode === "student" ? (
            <div className="mt-6">
              <StudentLevelStep levels={levels} language={language} value={levelId} label={t("onboarding.chooseLevel")} onChange={setLevelId} />
              <button type="button" disabled={saving} onClick={saveStudentLevel} className="mt-5 rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white disabled:opacity-60">
                {t("action.save")}
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <TeacherApplicationStep
                subjects={subjects}
                language={language}
                selectedSubjectIds={subjectIds}
                file={proof}
                message={message}
                labels={{
                  subjects: t("onboarding.chooseSubjects"),
                  proof: t("onboarding.uploadProof"),
                  notice: t("onboarding.teacherApplicationNotice"),
                  message: language === "EN" ? "Optional message" : "Message optionnel",
                }}
                onSubjectsChange={setSubjectIds}
                onFileChange={setProof}
                onMessageChange={setMessage}
              />
              <button type="button" disabled={saving} onClick={submitTeacherApplication} className="mt-5 rounded-full bg-[#0f5f3a] px-6 py-3 font-black text-white disabled:opacity-60">
                {saving ? (language === "EN" ? "Sending..." : "Envoi...") : t("onboarding.teacherOption")}
              </button>
            </div>
          )}
          {mode && (
            <button type="button" onClick={() => setMode(null)} className="mt-4 text-sm font-black text-slate-500">
              {language === "EN" ? "Change choice" : "Changer de choix"}
            </button>
          )}
          {status && <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">{status}</p>}
        </section>
      </section>
    </DashboardShell>
  );
}
