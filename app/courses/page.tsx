import { LearningContentDetailPage } from "@/components/content/LearningContentPages";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <LearningContentDetailPage
      kind="courses"
      id={id}
    />
  );
}
