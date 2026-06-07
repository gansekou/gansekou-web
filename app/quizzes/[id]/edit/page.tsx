import { QuizEditRouteClient } from "@/components/quiz/QuizRoutes";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = await params;
  return <QuizEditRouteClient quizId={quizId} />;
}
