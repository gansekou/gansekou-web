import { QuizResultRouteClient } from "@/components/quiz/QuizRoutes";

export default async function QuizResultRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = await params;
  return <QuizResultRouteClient quizId={quizId} />;
}
