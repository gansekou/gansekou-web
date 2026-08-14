"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Document, Page, pdfjs } from "react-pdf";

import {
  Maximize2,
  Minimize2,
  Minus,
  Plus,
} from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import type { DocumentProps } from "react-pdf";

// -----------------------------------------------------------------------------
// PDF.js worker
// -----------------------------------------------------------------------------

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// -----------------------------------------------------------------------------
// PDF.js resources
// -----------------------------------------------------------------------------

const pdfOptions = {
  wasmUrl: "/pdfjs/wasm/",
  standardFontDataUrl: "/pdfjs/standard_fonts/",
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type PdfFile = NonNullable<DocumentProps["file"]>;

type PdfViewerProps = {
  file: PdfFile;
  zoom?: number;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function PdfViewer({
  file,
  zoom: initialZoom = 1,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [numPages, setNumPages] = useState(0);

  const [pageWidth, setPageWidth] = useState(900);

  const [visiblePages, setVisiblePages] = useState<Set<number>>(
    new Set([1])
  );

  const [zoom, setZoom] = useState(initialZoom);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // ---------------------------------------------------------------------------
  // Responsive width
  // ---------------------------------------------------------------------------

  useEffect(() => {
    function updateWidth() {
      const width = window.innerWidth;

      if (width < 640) {
        // Android / petits écrans
        setPageWidth(width - 12);
      } else if (width < 1024) {
        setPageWidth(width - 40);
      } else {
        setPageWidth(1000);
      }
    }

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fullscreen state
  // ---------------------------------------------------------------------------

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Fullscreen toggle
  // ---------------------------------------------------------------------------

  async function toggleFullscreen() {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (error) {
      console.error(
        "❌ Impossible de gérer le plein écran :",
        error
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Zoom
  // ---------------------------------------------------------------------------

  function decreaseZoom() {
    setZoom((current) => {
      return Math.max(0.7, Number((current - 0.1).toFixed(1)));
    });
  }

  function increaseZoom() {
    setZoom((current) => {
      return Math.min(2, Number((current + 0.1).toFixed(1)));
    });
  }

  // ---------------------------------------------------------------------------
  // Reset document
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setNumPages(0);
    setVisiblePages(new Set([1]));
    setZoom(initialZoom);
  }, [file, initialZoom]);

  // ---------------------------------------------------------------------------
  // IntersectionObserver
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!numPages) {
      return;
    }

    const root = containerRef.current;

    if (!root) {
      return;
    }

    const elements = root.querySelectorAll<HTMLElement>(
      "[data-pdf-page]"
    );

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisiblePages((previous) => {
          const next = new Set(previous);

          for (const entry of entries) {
            const pageNumber = Number(
              entry.target.getAttribute(
                "data-page-number"
              )
            );

            if (!pageNumber) {
              continue;
            }

            if (entry.isIntersecting) {
              next.add(pageNumber);
              next.add(pageNumber - 1);
              next.add(pageNumber + 1);
            }
          }

          for (const pageNumber of Array.from(next)) {
            if (
              pageNumber < 1 ||
              pageNumber > numPages
            ) {
              next.delete(pageNumber);
            }
          }

          return next;
        });
      },
      {
        root,
        rootMargin: "1200px 0px",
        threshold: 0,
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages]);

  // ---------------------------------------------------------------------------
  // Rendered width
  // ---------------------------------------------------------------------------

  const renderedWidth = useMemo(() => {
    return Math.max(
      280,
      pageWidth * zoom
    );
  }, [pageWidth, zoom]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className={`
        relative flex flex-col overflow-hidden
        bg-slate-200
        ${
          isFullscreen
            ? "h-screen w-screen"
            : "h-[82vh] min-h-[500px] w-full rounded-xl"
        }
      `}
      onContextMenu={(event) =>
        event.preventDefault()
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Toolbar                                                           */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          sticky top-0 z-50
          flex shrink-0 items-center justify-between
          gap-2
          border-b border-slate-300
          bg-white/95
          px-2 py-2
          shadow-sm
          backdrop-blur
        "
      >
        {/* Page count */}

        <div className="min-w-0">
          <div className="whitespace-nowrap text-xs font-semibold text-slate-700 sm:text-sm">
            PDF
            {numPages > 0 && (
              <span className="ml-1 text-slate-500">
                · {numPages} pages
              </span>
            )}
          </div>
        </div>

        {/* Controls */}

        <div className="flex items-center gap-1">
          {/* Zoom - */}

          <button
            type="button"
            onClick={decreaseZoom}
            disabled={zoom <= 0.7}
            aria-label="Réduire le zoom"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              border border-slate-300
              bg-white
              text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Minus size={18} />
          </button>

          {/* Zoom percentage */}

          <div className="flex h-9 min-w-[52px] items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-700">
            {Math.round(zoom * 100)}%
          </div>

          {/* Zoom + */}

          <button
            type="button"
            onClick={increaseZoom}
            disabled={zoom >= 2}
            aria-label="Augmenter le zoom"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-lg
              border border-slate-300
              bg-white
              text-slate-700
              transition
              hover:bg-slate-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Plus size={18} />
          </button>

          {/* Fullscreen */}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={
              isFullscreen
                ? "Quitter le plein écran"
                : "Plein écran"
            }
            className="
              ml-1
              flex h-9 items-center justify-center
              gap-1
              rounded-lg
              border border-slate-300
              bg-white
              px-2
              text-slate-700
              transition
              hover:bg-slate-100
            "
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={18} />

                <span className="hidden sm:inline">
                  Quitter
                </span>
              </>
            ) : (
              <>
                <Maximize2 size={18} />

                <span className="hidden sm:inline">
                  Plein écran
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PDF                                                               */}
      {/* ------------------------------------------------------------------ */}

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain bg-slate-200 px-1 py-2 sm:px-3 sm:py-4">
        <Document
          file={file}
          options={pdfOptions}
          loading={
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mb-2 font-semibold">
                  Chargement du PDF...
                </div>

                <div className="text-sm text-slate-500">
                  Préparation du document
                </div>
              </div>
            </div>
          }
          error={
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center font-semibold text-red-600">
                Impossible d'ouvrir ce document PDF.
              </div>
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            console.log(
              "✅ PDF chargé :",
              numPages
            );

            setNumPages(numPages);

            setVisiblePages(
              new Set(
                Array.from(
                  {
                    length: Math.min(
                      3,
                      numPages
                    ),
                  },
                  (_, index) => index + 1
                )
              )
            );
          }}
          onLoadError={(error) => {
            console.error(
              "❌ PDF.js Error :",
              error
            );
          }}
        >
          {Array.from(
            { length: numPages },
            (_, index) => {
              const pageNumber = index + 1;

              const shouldRender =
                visiblePages.has(
                  pageNumber
                );

              return (
                <div
                  key={pageNumber}
                  data-pdf-page
                  data-page-number={
                    pageNumber
                  }
                  className="
                    mb-4
                    flex
                    min-h-[300px]
                    justify-center
                    sm:mb-6
                  "
                >
                  {shouldRender ? (
                    <Page
                      pageNumber={pageNumber}
                      width={
                        renderedWidth
                      }
                      renderAnnotationLayer
                      renderTextLayer
                      loading={
                        <div
                          className="
                            flex
                            min-h-[300px]
                            items-center
                            justify-center
                            text-sm
                            text-slate-500
                          "
                        >
                          Chargement de la page{" "}
                          {pageNumber}...
                        </div>
                      }
                    />
                  ) : (
                    <div
                      className="
                        flex
                        min-h-[300px]
                        w-full
                        max-w-[1000px]
                        items-center
                        justify-center
                        rounded
                        bg-white
                        text-sm
                        text-slate-400
                        shadow-sm
                      "
                    >
                      Page {pageNumber}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </Document>
      </div>
    </div>
  );
}
