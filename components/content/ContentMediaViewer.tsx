"use client";

import { Bookmark, ExternalLink, Highlighter, Maximize2, Minus, Plus, RefreshCcw, StickyNote } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/app/StateViews";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import {
  getContentKind,
  getContentStreamUrl,
  fetchAuthenticatedContentBlob,
  downloadAuthenticatedFile,
} from "@/lib/content-media";
import type { Content } from "@/types/content";

export function ContentMediaViewer({
  content,
  t,
}: {
  content: Content;
  t: (key: string) => string;
}) {
  const fallbackKind = getContentKind(content);
  const streamUrl = getContentStreamUrl(content);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const [kind, setKind] = useState(fallbackKind);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [highlightColor, setHighlightColor] = useState("#fff7b8");
  const [bookmarks, setBookmarks] = useState<number[]>(() => readStoredBookmarks(content.id));
  const [note, setNote] = useState(() => readStoredNote(content.id));
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const progressKey = `gansekou_content_position_${content.id}`;
  const bookmarksKey = `gansekou_content_bookmarks_${content.id}`;
  const noteKey = `gansekou_content_note_${content.id}`;

  const load = useCallback(async () => {
    if (!streamUrl) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAuthenticatedContentBlob({ content, url: streamUrl });
      setBlobUrl((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        blobUrlRef.current = result.blobUrl;
        return result.blobUrl;
      });
      setKind(result.kind);
    } catch {
      setError(t("content.readerAuthError"));
      if (blobUrlRef.current?.startsWith("blob:")) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setBlobUrl(null);
    } finally {
      setLoading(false);
    }
  }, [content, streamUrl, t]);

  useEffect(() => {
    const task = window.setTimeout(() => void load(), 0);
    return () => {
      window.clearTimeout(task);
      if (blobUrlRef.current?.startsWith("blob:")) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    };
  }, [load]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    media.playbackRate = playbackRate;
  }, [playbackRate, blobUrl, kind]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || !["video", "audio"].includes(kind)) return;
    const saved = window.localStorage.getItem(progressKey);
    if (saved) {
      const seconds = Number(saved);
      if (!Number.isNaN(seconds) && seconds > 0) media.currentTime = seconds;
    }
    const onTimeUpdate = () => {
      window.localStorage.setItem(progressKey, String(Math.floor(media.currentTime)));
    };
    media.addEventListener("timeupdate", onTimeUpdate);
    return () => media.removeEventListener("timeupdate", onTimeUpdate);
  }, [blobUrl, kind, progressKey]);

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      await downloadAuthenticatedFile(content);
    } catch {
      setError(t("content.readerAuthError"));
    } finally {
      setDownloading(false);
    }
  }

  function addBookmark() {
    const current = mediaRef.current ? Math.floor(mediaRef.current.currentTime) : 0;
    const next = Array.from(new Set([...bookmarks, current])).sort((a, b) => a - b).slice(-8);
    setBookmarks(next);
    window.localStorage.setItem(bookmarksKey, JSON.stringify(next));
  }

  function saveNote(value: string) {
    setNote(value);
    window.localStorage.setItem(noteKey, value);
  }

  if (kind === "none" || !streamUrl) {
    return <EmptyState title={t("content.noMainFile")} message={t("content.noMainFile")} />;
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div>
          <p className="font-black text-[#071d3a]">{t("content.reader")}</p>
          <p className="text-sm font-bold text-slate-500">{kind.toUpperCase()} - {content.content_type}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["pdf", "image"].includes(kind) && (
            <div className="inline-flex items-center rounded-full bg-white p-1">
              <button type="button" onClick={() => setZoom((value) => Math.max(60, value - 10))} className="flex h-8 w-8 items-center justify-center rounded-full text-[#071d3a]" aria-label={t("content.zoomOut")}>
                <Minus size={15} />
              </button>
              <span className="min-w-12 text-center text-xs font-black text-[#071d3a]">{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(180, value + 10))} className="flex h-8 w-8 items-center justify-center rounded-full text-[#071d3a]" aria-label={t("content.zoomIn")}>
                <Plus size={15} />
              </button>
            </div>
          )}
          {["video", "audio"].includes(kind) && (
            <select value={playbackRate} onChange={(event) => setPlaybackRate(Number(event.target.value))} className="rounded-full bg-white px-3 py-2 text-sm font-black text-[#071d3a]" aria-label={t("content.playbackSpeed")}>
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => <option key={rate} value={rate}>{rate}x</option>)}
            </select>
          )}
          {["pdf", "image", "video", "audio"].includes(kind) && (
            <button type="button" onClick={addBookmark} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a]">
              <Bookmark size={16} />
              {t("content.bookmark")}
            </button>
          )}
          {["pdf", "image"].includes(kind) && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-[#071d3a]">
              <Highlighter size={16} />
              {["#fff7b8", "#dff7ec", "#e8f1ff"].map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setHighlightColor(color)}
                  className={`h-5 w-5 rounded-full border ${highlightColor === color ? "border-[#071d3a]" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  aria-label={t("content.highlightColor")}
                />
              ))}
            </div>
          )}
          <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a]">
            <Maximize2 size={16} />
            {t("content.fullscreen")}
          </button>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a] disabled:opacity-60">
            <RefreshCcw size={16} />
            {t("content.retry")}
          </button>
          {blobUrl && (
            <a href={blobUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#071d3a]">
              <ExternalLink size={16} />
              {t("content.open")}
            </a>
          )}
          <button type="button" onClick={download} disabled={downloading} className="rounded-full bg-[#071d3a] px-4 py-2 text-sm font-black text-white disabled:opacity-60">
            {downloading ? t("common.loading") : t("content.download")}
          </button>
        </div>
      </div>
      {loading ? (
        <div className="grid min-h-72 place-items-center p-6">
          <div className="w-full max-w-xl">
            <PremiumSkeleton rows={4} />
          </div>
        </div>
      ) : error ? (
        <div className="p-6">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="font-black text-red-700">{error}</p>
            <button type="button" onClick={load} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-black text-red-700">
              {t("content.retry")}
            </button>
          </div>
        </div>
      ) : !blobUrl ? (
        <div className="p-6">
          <EmptyState title={t("content.noMainFile")} message={t("content.noMainFile")} />
        </div>
      ) : kind === "pdf" ? (
        <div className="bg-slate-100">
          <div className="overflow-auto p-3" style={{ backgroundColor: highlightColor }}>
            <iframe title={t("content.pdfReader")} src={blobUrl} className="h-[75vh] origin-top-left rounded-2xl bg-slate-50 transition-transform" style={{ width: `${zoom}%` }} />
          </div>
          <ReaderCompanionPanel
            bookmarks={bookmarks}
            note={note}
            labels={{
              bookmarks: t("content.bookmarks"),
              emptyBookmarks: t("content.emptyBookmarks"),
              personalNotes: t("content.personalNotes"),
              notePlaceholder: t("content.notePlaceholder"),
            }}
            onNoteChange={saveNote}
          />
        </div>
      ) : kind === "image" ? (
        <div className="bg-slate-100">
          <div className="overflow-auto p-3" style={{ backgroundColor: highlightColor }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={blobUrl} alt={t("content.image")} className="mx-auto max-h-[75vh] bg-slate-50 object-contain transition-transform" style={{ width: `${zoom}%` }} />
          </div>
          <ReaderCompanionPanel
            bookmarks={bookmarks}
            note={note}
            labels={{
              bookmarks: t("content.bookmarks"),
              emptyBookmarks: t("content.emptyBookmarks"),
              personalNotes: t("content.personalNotes"),
              notePlaceholder: t("content.notePlaceholder"),
            }}
            onNoteChange={saveNote}
          />
        </div>
      ) : kind === "video" ? (
        <MediaWithNotes bookmarks={bookmarks} note={note} onNoteChange={saveNote} onSeek={(second) => { if (mediaRef.current) mediaRef.current.currentTime = second; }}>
          <video ref={(node) => { mediaRef.current = node; }} controls playsInline className="aspect-video w-full bg-black">
            <source src={blobUrl} />
          </video>
        </MediaWithNotes>
      ) : kind === "audio" ? (
        <MediaWithNotes bookmarks={bookmarks} note={note} onNoteChange={saveNote} onSeek={(second) => { if (mediaRef.current) mediaRef.current.currentTime = second; }}>
          <div className="sticky bottom-3 z-20 p-6">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{t("content.audioPlayer")}</p>
            <audio ref={(node) => { mediaRef.current = node; }} controls src={blobUrl} className="w-full rounded-2xl" />
          </div>
        </MediaWithNotes>
      ) : (
        <div className="p-6">
          <p className="font-black text-[#071d3a]">{content.file_url}</p>
          <p className="mt-2 text-sm font-bold text-slate-500">{t("content.download")}</p>
        </div>
      )}
    </section>
  );
}

function ReaderCompanionPanel({
  bookmarks,
  note,
  labels,
  onNoteChange,
}: {
  bookmarks: number[];
  note: string;
  labels: {
    bookmarks: string;
    emptyBookmarks: string;
    personalNotes: string;
    notePlaceholder: string;
  };
  onNoteChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-4 border-t border-slate-100 bg-white p-5 md:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl bg-slate-50 p-4">
        <p className="flex items-center gap-2 font-black text-[#071d3a]"><Bookmark size={18} />{labels.bookmarks}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {bookmarks.map((second, index) => (
            <span key={`${second}-${index}`} className="rounded-full bg-white px-3 py-2 text-sm font-black text-[#0f5f3a]">
              #{index + 1}
            </span>
          ))}
          {!bookmarks.length && <span className="text-sm font-bold text-slate-500">{labels.emptyBookmarks}</span>}
        </div>
      </section>
      <section className="rounded-2xl bg-slate-50 p-4">
        <p className="flex items-center gap-2 font-black text-[#071d3a]"><StickyNote size={18} />{labels.personalNotes}</p>
        <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm font-bold outline-none" placeholder={labels.notePlaceholder} />
      </section>
    </div>
  );
}

function MediaWithNotes({
  children,
  bookmarks,
  note,
  onNoteChange,
  onSeek,
}: {
  children: ReactNode;
  bookmarks: number[];
  note: string;
  onNoteChange: (value: string) => void;
  onSeek: (second: number) => void;
}) {
  return (
    <div>
      {children}
      <div className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="flex items-center gap-2 font-black text-[#071d3a]"><Bookmark size={18} />Bookmarks</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {bookmarks.map((second) => (
              <button key={second} type="button" onClick={() => onSeek(second)} className="rounded-full bg-white px-3 py-2 text-sm font-black text-[#0f5f3a]">
                {formatMediaTime(second)}
              </button>
            ))}
            {!bookmarks.length && <span className="text-sm font-bold text-slate-500">Aucun bookmark</span>}
          </div>
        </section>
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="flex items-center gap-2 font-black text-[#071d3a]"><StickyNote size={18} />Notes</p>
          <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 p-3 text-sm font-bold outline-none" placeholder="Notes personnelles..." />
        </section>
      </div>
    </div>
  );
}

function formatMediaTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function readStoredBookmarks(contentId: string) {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(`gansekou_content_bookmarks_${contentId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as number[];
  } catch {
    return [];
  }
}

function readStoredNote(contentId: string) {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(`gansekou_content_note_${contentId}`) || "";
}
