import { QuizDetailRouteClient } from "@/components/quiz/QuizRoutes";

export default async function QuizDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: quizId } = await params;
  return <QuizDetailRouteClient quizId={quizId} />;
}
