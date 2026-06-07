"use client";

import type { User } from "@/types/user";
import { AdminAnalyticsDashboard } from "@/components/analytics/AdminAnalyticsDashboard";
import { StudentAnalyticsDashboard } from "@/components/analytics/StudentAnalyticsDashboard";
import { TeacherAnalyticsDashboard } from "@/components/analytics/TeacherAnalyticsDashboard";

export function RoleAnalyticsDashboard({ role }: { role: User["role"] }) {
  if (role === "ELEVE") return <StudentAnalyticsDashboard progress={[]} quizHistory={[]} badges={[]} labels={fallbackLabels} />;
  if (role === "ENSEIGNANT") return <TeacherAnalyticsDashboard contents={[]} quizzes={[]} pending={[]} assigned={[]} labels={fallbackLabels} />;
  return <AdminAnalyticsDashboard contents={[]} quizzes={[]} labels={fallbackLabels} />;
}

const fallbackLabels = {
  overview: "Overview",
  engagement: "Engagement",
  passRate: "Pass rate",
  averageScore: "Average score",
  progressTrend: "Progress trend",
  contentPerformance: "Content performance",
  quizPerformance: "Quiz performance",
  teacherPerformance: "Teaching performance",
  actionableInsights: "Actionable insights",
  noData: "No data yet",
  users: "Users",
  learners: "Learners",
  teachers: "Teachers",
  questions: "Questions",
  contents: "Content",
  quizzes: "Quizzes",
  aiActivity: "AI activity",
  projection: "Projection",
  roleDistribution: "Role distribution",
  questionActivity: "Question activity",
  contentTypes: "Content types",
  contentStatus: "Content status",
  attempts: "Attempts",
  projectionHelp: "Projection based on learners, not collected revenue.",
  views: "Views",
  downloads: "Downloads",
  likes: "Likes",
  pendingQuestions: "Pending questions",
  assignedQuestions: "Assigned questions",
  topContent: "Most viewed content",
  questionStatus: "Question status",
  coursesCompleted: "Courses completed",
  quizzesCompleted: "Quizzes completed",
  streak: "Streak",
  xp: "XP",
  badges: "Badges",
  learningTime: "Learning time",
  platformGrowing: "The platform shows positive momentum.",
  quizzesHighlyUsed: "Quizzes are highly used this week.",
  aiMomentum: "AI is supporting more learners.",
  contentEngaging: "Your content is generating strong engagement.",
  urgentQuestions: "Some questions deserve priority answers.",
  quizNeedsReview: "Some quizzes could be adjusted.",
  fasterProgress: "You are progressing faster than last week.",
  mathStrength: "Your success rhythm is getting stronger.",
  reviewWeaknesses: "Review fragile concepts before the next quiz.",
};
