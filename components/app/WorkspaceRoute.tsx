"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/app/StateViews";

type WorkspaceKind =
  | "dashboard"
  | "courses"
  | "course-new"
  | "course-edit"
  | "subjects"
  | "subject-new"
  | "subject-detail"
  | "subject-edit"
  | "course-detail"
  | "questions"
  | "question-new"
  | "question-detail"
  | "ai"
  | "quizzes"
  | "quiz-new"
  | "quiz-detail"
  | "quiz-edit"
  | "quiz-play"
  | "study-planner"
  | "notifications"
  | "profile"
  | "settings"
  | "subscription"
  | "teacher-dashboard"
  | "teacher-pending"
  | "teacher-assigned"
  | "teacher-question"
  | "teacher-subjects"
  | "teacher-contents"
  | "teacher-content-new"
  | "teacher-content-detail"
  | "teacher-content-edit"
  | "teacher-answers"
  | "admin-dashboard"
  | "admin-users"
  | "admin-user-detail"
  | "admin-schools"
  | "admin-education"
  | "admin-contents"
  | "admin-contents-review"
  | "admin-content-new"
  | "admin-content-detail"
  | "admin-content-edit"
  | "admin-questions"
  | "admin-teachers"
  | "admin-payments"
  | "admin-notifications"
  | "admin-settings";

const WorkspacePage = dynamic(
  () => import("@/components/app/WorkspacePage").then((mod) => mod.WorkspacePage),
  {
    loading: () => <LoadingState label="Chargement de votre espace Gansekou..." />,
  }
);

export function WorkspaceRoute({ kind }: { kind: WorkspaceKind }) {
  return <WorkspacePage kind={kind} />;
}
