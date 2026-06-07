"use client";

import { QuizDetailPage } from "@/components/quiz/QuizDetailPage";
import { QuizEditorRouteLoader } from "@/components/quiz/QuizEditorRouteLoader";
import { QuizHistoryPage } from "@/components/quiz/QuizHistoryPage";
import { QuizListPage } from "@/components/quiz/QuizListPage";
import { QuizPageShell } from "@/components/quiz/QuizPageShell";
import { QuizPlayPage } from "@/components/quiz/QuizPlayPage";
import { QuizResultPage } from "@/components/quiz/QuizResultPage";

export function QuizListRouteClient() {
  return <QuizPageShell>{(user) => <QuizListPage user={user} />}</QuizPageShell>;
}

export function QuizHistoryRouteClient() {
  return <QuizPageShell>{(user) => <QuizHistoryPage user={user} />}</QuizPageShell>;
}

export function QuizDetailRouteClient({ quizId }: { quizId: string }) {
  return <QuizPageShell>{(user) => <QuizDetailPage user={user} quizId={quizId} />}</QuizPageShell>;
}

export function QuizPlayRouteClient({ quizId }: { quizId: string }) {
  return <QuizPageShell>{(user) => <QuizPlayPage user={user} quizId={quizId} />}</QuizPageShell>;
}

export function QuizResultRouteClient({ quizId }: { quizId: string }) {
  return <QuizPageShell>{(user) => <QuizResultPage user={user} quizId={quizId} />}</QuizPageShell>;
}

export function QuizNewRouteClient() {
  return <QuizPageShell>{(user) => <QuizEditorRouteLoader user={user} />}</QuizPageShell>;
}

export function QuizEditRouteClient({ quizId }: { quizId: string }) {
  return <QuizPageShell>{(user) => <QuizEditorRouteLoader user={user} quizId={quizId} />}</QuizPageShell>;
}
