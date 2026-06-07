import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { TeacherSubject } from "@/types/teacher-subject";

export const teacherSubjectService = {
  getMyTeacherSubjects: () => apiFetch<TeacherSubject[]>(ENDPOINTS.teacherSubjects.me),
  updateMyTeacherSubjects: (subjectIds: string[]) =>
    apiFetch<TeacherSubject[]>(ENDPOINTS.teacherSubjects.updateMe, {
      method: "PUT",
      body: { subject_ids: subjectIds },
    }),
  remove: (teacherSubjectId: string) =>
    apiFetch(ENDPOINTS.teacherSubjects.remove(teacherSubjectId), {
      method: "DELETE",
    }),
  teachersBySubject: (subjectId: string) =>
    apiFetch(ENDPOINTS.teacherSubjects.teachersBySubject(subjectId)),
  getByTeacher: (teacherId: string) =>
    apiFetch<TeacherSubject[]>(ENDPOINTS.teacherSubjects.byTeacher(teacherId)),
};
