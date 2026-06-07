import { educationService } from "@/services/education.service";
import { uploadService } from "@/services/upload.service";
import { userService } from "@/services/user.service";

export const onboardingService = {
  updateMyProfile: userService.updateMyProfile,
  submitTeacherApplication: userService.submitTeacherApplication,
  uploadProofDocument: uploadService.proof,
  getLevels: educationService.levels,
  getSubjects: educationService.subjects,
};
