import { QuizPlayRouteClient } from "@/components/quiz/QuizRoutes";

export default async function PlayQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = await params;
  return <QuizPlayRouteClient quizId={quizId} />;
}
