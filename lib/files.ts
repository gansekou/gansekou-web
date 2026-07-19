const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";


export function getThumbnailUrl(
  thumbnailUrl?: string | null
) {
  if (!thumbnailUrl) {
    return "/images/course-placeholder.png";
  }

  return `${API_BASE_URL}/uploads/public-file?file_url=${encodeURIComponent(thumbnailUrl)}`;
}
