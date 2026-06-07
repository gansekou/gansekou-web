import { AdminLearningContentEditorPage } from "@/components/content/LearningContentPages";

export default async function AdminEditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminLearningContentEditorPage kind="subjects" id={id} />;
}
