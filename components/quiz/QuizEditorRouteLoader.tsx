"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/app/StateViews";
import { QuizEditor } from "@/components/quiz/QuizEditor";
import { educationService } from "@/services/education.service";
import { quizService } from "@/services/quiz.service";
import { contentService } from "@/services/content.service";
import type { Content } from "@/types/content";
import type { Level, Subject } from "@/types/education";
import type { Quiz } from "@/types/quiz";
import type { User } from "@/types/user";

export function QuizEditorRouteLoader({ user, quizId }: { user: User; quizId?: string }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [courses, setCourses] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("course_id");

  useEffect(() => {
    let cancelled = false;
    const quizPromise = quizId ? quizService.getManageById(quizId) : Promise.resolve(null);

    Promise.all([quizPromise, educationService.subjects(), educationService.levels(), contentService.getCoursesForCurrentUser()])
      .then(([quizData, subjectData, levelData, courseData]) => {
        if (!cancelled) {
          const selectedCourse = courseData.find((course) => course.id === initialCourseId);
          setQuiz(quizData || (selectedCourse ? {
            id: "",
            title: `Quiz - ${selectedCourse.title || selectedCourse.id.slice(0, 8)}`,
            description: "",
            course_id: selectedCourse.id,
            content_id: selectedCourse.id,
            subject_id: selectedCourse.subject_id,
            level_id: selectedCourse.level_id,
            language: user.preferred_language || "FR",
            quiz_type: "QCM",
            is_premium: false,
            is_randomized: false,
            allow_retry: true,
            passing_score: 50,
            estimated_duration_minutes: 10,
            questions: [],
          } as Quiz : null));
          setSubjects(subjectData);
          setLevels(levelData);
          setCourses(courseData);
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [quizId, initialCourseId, user.preferred_language]);

  if (loading) return <LoadingState label="Chargement..." />;
  if (error) return <ErrorState message={error} />;
  return <QuizEditor user={user} quiz={quiz} subjects={subjects} levels={levels} courses={courses} />;
}
