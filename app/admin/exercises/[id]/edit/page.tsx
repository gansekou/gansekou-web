import { AdminLearningContentEditorPage } from "@/components/content/LearningContentPages";

export default async function AdminEditExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminLearningContentEditorPage kind="exercises" id={id} />;
}
