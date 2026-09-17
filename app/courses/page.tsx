import { LearningContentListPage } from "@/components/content/LearningContentPages";

export const revalidate = 60;

export default function CoursesPage() {
  return (
    <LearningContentListPage kind="courses" />
  );
}
