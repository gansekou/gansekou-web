import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { EducationCycle, Level, Specialty, Subject } from "@/types/education";

export const educationService = {
  cycles: () => apiFetch<EducationCycle[]>(ENDPOINTS.education.cycles),
  createCycle: (payload: Omit<EducationCycle, "id" | "created_at">) =>
    apiFetch<EducationCycle>(ENDPOINTS.education.cycles, { method: "POST", body: payload }),
  updateCycle: (id: string, payload: Omit<EducationCycle, "id" | "created_at">) =>
    apiFetch<EducationCycle>(ENDPOINTS.education.cycleById(id), { method: "PUT", body: payload }),
  deleteCycle: (id: string) =>
    apiFetch<EducationCycle>(ENDPOINTS.education.cycleById(id), { method: "DELETE" }),
  levels: () => apiFetch<Level[]>(ENDPOINTS.education.levels),
  createLevel: (payload: Omit<Level, "id" | "created_at">) =>
    apiFetch<Level>(ENDPOINTS.education.levels, { method: "POST", body: payload }),
  updateLevel: (id: string, payload: Omit<Level, "id" | "created_at">) =>
    apiFetch<Level>(ENDPOINTS.education.levelById(id), { method: "PUT", body: payload }),
  deleteLevel: (id: string) =>
    apiFetch<Level>(ENDPOINTS.education.levelById(id), { method: "DELETE" }),
  specialties: () => apiFetch<Specialty[]>(ENDPOINTS.education.specialties),
  createSpecialty: (payload: Omit<Specialty, "id" | "created_at">) =>
    apiFetch<Specialty>(ENDPOINTS.education.specialties, { method: "POST", body: payload }),
  updateSpecialty: (id: string, payload: Omit<Specialty, "id" | "created_at">) =>
    apiFetch<Specialty>(ENDPOINTS.education.specialtyById(id), { method: "PUT", body: payload }),
  deleteSpecialty: (id: string) =>
    apiFetch<Specialty>(ENDPOINTS.education.specialtyById(id), { method: "DELETE" }),
  subjects: () => apiFetch<Subject[]>(ENDPOINTS.education.subjects),
  createSubject: (payload: Omit<Subject, "id" | "created_at">) =>
    apiFetch<Subject>(ENDPOINTS.education.subjects, { method: "POST", body: payload }),
  updateSubject: (id: string, payload: Omit<Subject, "id" | "created_at">) =>
    apiFetch<Subject>(ENDPOINTS.education.subjectById(id), { method: "PUT", body: payload }),
  deleteSubject: (id: string) =>
    apiFetch<Subject>(ENDPOINTS.education.subjectById(id), { method: "DELETE" }),
};
