"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

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
  zoom = 1,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(900);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(
    new Set([1])
  );

  // ---------------------------------------------------------------------------
  // Responsive page width
  // ---------------------------------------------------------------------------

  useEffect(() => {
    function updateWidth() {
      const width = window.innerWidth;

      if (width < 640) {
        setPageWidth(Math.max(width - 24, 280));
      } else if (width < 1024) {
        setPageWidth(Math.max(width - 80, 500));
      } else {
        setPageWidth(900);
      }
    }

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // IntersectionObserver
  //
  // On ne rend que les pages proches de la zone visible.
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
              entry.target.getAttribute("data-page-number")
            );

            if (!pageNumber) {
              continue;
            }

            if (entry.isIntersecting) {
              // Page visible + pages voisines
              next.add(pageNumber);
              next.add(pageNumber - 1);
              next.add(pageNumber + 1);
            }
          }

          // Limiter aux pages valides
          for (const pageNumber of Array.from(next)) {
            if (pageNumber < 1 || pageNumber > numPages) {
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

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [numPages]);

  // ---------------------------------------------------------------------------
  // Reset quand le document change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setNumPages(0);
    setVisiblePages(new Set([1]));
  }, [file]);

  // ---------------------------------------------------------------------------
  // Largeur finale
  // ---------------------------------------------------------------------------

  const renderedWidth = useMemo(() => {
    return Math.max(280, pageWidth * zoom);
  }, [pageWidth, zoom]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={containerRef}
      className="h-[70vh] overflow-auto bg-slate-100 p-3 sm:p-4"
      onContextMenu={(event) => event.preventDefault()}
    >
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
          console.log("✅ PDF chargé :", numPages);

          setNumPages(numPages);

          // Commencer par les premières pages
          setVisiblePages(
            new Set(
              Array.from(
                { length: Math.min(3, numPages) },
                (_, index) => index + 1
              )
            )
          );
        }}
        onLoadError={(error) => {
          console.error("❌ PDF.js Error :", error);
        }}
      >
        {Array.from({ length: numPages }, (_, index) => {
          const pageNumber = index + 1;

          const shouldRender = visiblePages.has(pageNumber);

          return (
            <div
              key={pageNumber}
              data-pdf-page
              data-page-number={pageNumber}
              className="mb-6 flex min-h-[400px] justify-center"
            >
              {shouldRender ? (
                <Page
                  pageNumber={pageNumber}
                  width={renderedWidth}
                  renderAnnotationLayer
                  renderTextLayer
                  loading={
                    <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
                      Chargement de la page {pageNumber}...
                    </div>
                  }
                />
              ) : (
                <div className="flex min-h-[400px] w-full max-w-[900px] items-center justify-center rounded bg-white text-sm text-slate-400 shadow-sm">
                  Page {pageNumber}
                </div>
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
}
