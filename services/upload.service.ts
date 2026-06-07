import { apiFetch } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { UploadResponse } from "@/types/upload";

function upload(url: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<UploadResponse>(url, { method: "POST", body: formData });
}

export const uploadService = {
  profile: (file: File) => upload(ENDPOINTS.uploads.profile, file),
  proof: (file: File) => upload(ENDPOINTS.uploads.proof, file),
  contentFile: (file: File) => upload(ENDPOINTS.uploads.contentFile, file),
  contentThumbnail: (file: File) => upload(ENDPOINTS.uploads.contentThumbnail, file),
  questionImage: (file: File) => upload(ENDPOINTS.uploads.questionImage, file),
  teacherAnswer: (file: File) => upload(ENDPOINTS.uploads.teacherAnswer, file),
};
