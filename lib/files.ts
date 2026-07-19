import { platformService } from "@/services/platform.service";

export function getThumbnailUrl(
  thumbnailUrl?: string | null
) {
  if (!thumbnailUrl) {
    return "/images/course-placeholder.png";
  }

  return platformService.uploads.publicFileUrl(thumbnailUrl);
}
