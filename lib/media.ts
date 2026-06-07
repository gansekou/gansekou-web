import { getAuthToken } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

const DEFAULT_BACKEND_URL = "http://127.0.0.1:8000";

export const BACKEND_URL = (
  process.env.NEXT_PUBLIC_BACKEND_URL || DEFAULT_BACKEND_URL
).replace(/\/+$/, "");

export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;

  const normalized = path.trim().replace(/\\/g, "/");
  if (!normalized) return null;

  if (/^https?:\/\//i.test(normalized)) return encodeURI(normalized);
  if (normalized.startsWith("blob:") || normalized.startsWith("data:")) {
    return normalized;
  }

  const uploadPath = normalizeUploadPath(normalized);
  if (!uploadPath) return null;

  return `${ENDPOINTS.uploads.file}?file_url=${encodeURIComponent(uploadPath)}`;
}

export function normalizeUploadUrl(path?: string | null): string | null {
  if (!path) return null;
  return normalizeUploadPath(path);
}

export function getProfileImageUrl(path?: string | null): string | null {
  return resolveMediaUrl(path);
}

export function normalizeUploadPath(path: string): string | null {
  let normalized = path.trim().replace(/\\/g, "/");

  try {
    normalized = decodeURIComponent(normalized);
  } catch {
    // Keep the original value if it is not percent-encoded correctly.
  }

  normalized = normalized
    .replace(/^https?:\/\/[^/]+\/api\/v1\/uploads\/(?:file|stream|download)\?file_url=/i, "")
    .replace(/^\/?api\/v1\/uploads\/(?:file|stream|download)\?file_url=/i, "")
    .replace(/^https?:\/\/[^/]+\/admin\/uploads\//i, "uploads/")
    .replace(/^https?:\/\/[^/]+\/uploads\//i, "uploads/")
    .replace(/^\/?admin\/uploads\//i, "uploads/")
    .replace(/^\/?uploads\//i, "uploads/")
    .replace(/^\/+/, "");

  if (!normalized) return null;
  if (!normalized.startsWith("uploads/")) normalized = `uploads/${normalized}`;

  return normalized;
}

export function isProtectedBackendMediaUrl(url: string) {
  return url.startsWith(`${BACKEND_URL}/api/v1/uploads/`);
}

export async function fetchAuthenticatedMediaBlobUrl(
  path?: string | null
): Promise<string | null> {
  const url = resolveMediaUrl(path);
  if (!url) return null;

  if (!isProtectedBackendMediaUrl(url)) return url;

  const token = getAuthToken();
  if (!token) return url;

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) return null;

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
