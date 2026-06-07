import { ENDPOINTS } from "@/lib/endpoints";
import { getAuthToken } from "@/lib/api";
import type { Content } from "@/types/content";

export type ContentKind = "pdf" | "image" | "audio" | "video" | "html" | "text" | "file" | "none";

const imageExtensions = ["jpg", "jpeg", "png", "webp", "gif", "avif"];
const audioExtensions = ["mp3", "wav", "m4a", "aac", "ogg"];
const videoExtensions = ["mp4", "mov", "webm", "mkv"];

export function getContentMainUrl(content?: Partial<Content> | null) {
  if (!content) return null;
  const candidate =
    readContentUrl(content, "content_path") ||
    content.file_url ||
    readContentUrl(content, "url") ||
    readContentUrl(content, "content_url") ||
    readContentUrl(content, "attachment_url") ||
    readContentUrl(content, "media_url") ||
    content.video_url ||
    content.audio_url ||
    null;

  return normalizeMediaPath(candidate);
}

export function getContentThumbnailUrl(content?: Partial<Content> | null) {
  return normalizeMediaPath(content?.thumbnail_url || null);
}

export function getContentStreamUrl(content?: Partial<Content> | null) {
  const mainUrl = getContentMainUrl(content);
  if (!mainUrl) return null;
  if (/^https?:\/\//i.test(mainUrl)) return mainUrl;
  return `${ENDPOINTS.uploads.stream}?file_url=${encodeURIComponent(mainUrl)}`;
}

export function getContentDownloadUrl(content?: Partial<Content> | null) {
  const mainUrl = getContentMainUrl(content);
  if (!mainUrl) return null;
  if (/^https?:\/\//i.test(mainUrl)) return mainUrl;
  return `${ENDPOINTS.uploads.download}?file_url=${encodeURIComponent(mainUrl)}`;
}

export function getContentFileUrl(content?: Partial<Content> | null) {
  const mainUrl = getContentMainUrl(content);
  if (!mainUrl) return null;
  if (/^https?:\/\//i.test(mainUrl)) return mainUrl;
  return `${ENDPOINTS.uploads.file}?file_url=${encodeURIComponent(mainUrl)}`;
}

export function getContentMimeType(content?: Partial<Content> | null) {
  const url = getContentMainUrl(content);
  const extension = getExtension(url);
  if (!extension) return "application/octet-stream";
  if (extension === "pdf") return "application/pdf";
  if (imageExtensions.includes(extension)) return `image/${extension === "jpg" ? "jpeg" : extension}`;
  if (audioExtensions.includes(extension)) return `audio/${extension}`;
  if (videoExtensions.includes(extension)) return `video/${extension}`;
  if (extension === "html" || extension === "htm") return "text/html";
  if (extension === "txt" || extension === "md") return "text/plain";
  return "application/octet-stream";
}

export function getContentKindFromMimeType(mimeType?: string | null, content?: Partial<Content> | null): ContentKind {
  const normalized = mimeType?.toLowerCase() || "";
  if (normalized.includes("application/pdf")) return "pdf";
  if (normalized.startsWith("image/")) return "image";
  if (normalized.startsWith("audio/")) return "audio";
  if (normalized.startsWith("video/")) return "video";
  if (normalized.includes("text/html")) return "html";
  if (normalized.startsWith("text/")) return "text";
  return getContentKind(content);
}

export function getContentKind(content?: Partial<Content> | null): ContentKind {
  const url = getContentMainUrl(content);
  if (!url) return "none";
  const type = content?.content_type?.toUpperCase() || "";
  const extension = getExtension(url);
  if (type === "PDF" || extension === "pdf") return "pdf";
  if (type === "AUDIO" || (extension && audioExtensions.includes(extension))) return "audio";
  if (type === "VIDEO" || (extension && videoExtensions.includes(extension))) return "video";
  if (extension && imageExtensions.includes(extension)) return "image";
  if (extension === "html" || extension === "htm") return "html";
  if (extension === "txt" || extension === "md") return "text";
  return "file";
}

export async function fetchAuthenticatedContentBlob({
  content,
  url,
}: {
  content: Partial<Content>;
  url: string;
}) {
  const token = getAuthToken();
  const isBackendUpload = isBackendUploadUrl(url);
  const response = await fetch(url, {
    cache: "no-store",
    headers: token && isBackendUpload ? { Authorization: `Bearer ${token}` } : {},
  });
  const responseContentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let detail = response.statusText;
    if (responseContentType.includes("application/json")) {
      const data = await response.json().catch(() => null);
      detail = data && typeof data === "object" && "detail" in data ? String((data as { detail: unknown }).detail) : detail;
    }
    console.log("[content-reader]", {
      contentId: content.id,
      rawPath: getContentMainUrl(content),
      streamUrl: url,
      downloadUrl: getContentDownloadUrl(content),
      hasToken: Boolean(token),
      responseStatus: response.status,
      responseContentType,
      blobSize: 0,
      detectedKind: getContentKind(content),
    });
    throw new Error(detail || `HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const detectedKind = getContentKindFromMimeType(blob.type || responseContentType, content);
  console.log("[content-reader]", {
    contentId: content.id,
    rawPath: getContentMainUrl(content),
    streamUrl: url,
    downloadUrl: getContentDownloadUrl(content),
    hasToken: Boolean(token),
    responseStatus: response.status,
    responseContentType: blob.type || responseContentType,
    blobSize: blob.size,
    detectedKind,
  });

  return {
    blob,
    blobUrl: URL.createObjectURL(blob),
    contentType: blob.type || responseContentType,
    kind: detectedKind,
  };
}

export async function downloadAuthenticatedFile(content: Partial<Content>) {
  const url = getContentDownloadUrl(content) || getContentStreamUrl(content);
  if (!url) throw new Error("No file URL");
  const result = await fetchAuthenticatedContentBlob({ content, url });
  const link = document.createElement("a");
  link.href = result.blobUrl;
  link.download = getContentFilename(content) || "gansekou-content";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(result.blobUrl), 1000);
}

function readContentUrl(content: Partial<Content>, key: string) {
  const record = content as Record<string, unknown>;
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function normalizeMediaPath(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim().replaceAll("\\", "/");
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withoutAdminPrefix = trimmed.replace(/^\/?admin\/uploads\//, "uploads/");
  return withoutAdminPrefix.startsWith("/") ? withoutAdminPrefix.slice(1) : withoutAdminPrefix;
}

function isBackendUploadUrl(url: string) {
  return /^https?:\/\/[^/]+\/api\/v1\/uploads\//i.test(url) || url.includes("/api/v1/uploads/");
}

function getContentFilename(content: Partial<Content>) {
  const url = getContentMainUrl(content);
  if (!url) return null;
  const clean = url.split("?")[0].split("#")[0];
  return clean.split("/").pop() || null;
}

function getExtension(url?: string | null) {
  if (!url) return "";
  const clean = url.split("?")[0].split("#")[0];
  const name = clean.split("/").pop() || "";
  return name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : "";
}
