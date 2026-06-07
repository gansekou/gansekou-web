import { LearningContentDetailPage } from "@/components/content/LearningContentPages";

export default async function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LearningContentDetailPage kind="subjects" id={id} />;
}
