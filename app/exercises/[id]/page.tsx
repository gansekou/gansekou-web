import { LearningContentDetailPage } from "@/components/content/LearningContentPages";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LearningContentDetailPage kind="exercises" id={id} />;
}
