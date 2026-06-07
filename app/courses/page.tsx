import { CoursesPage as CoursesPageClient } from "@/components/pages/courses/CoursesPage";

export const revalidate = 60;

export default function CoursesPage() {
  return <CoursesPageClient />;
}
