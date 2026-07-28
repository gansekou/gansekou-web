"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { DocumentProps } from "react-pdf";

// Worker PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type PdfFile = NonNullable<DocumentProps["file"]>;

export function PdfViewer({
  file,
  zoom = 1,
}: {
  file: PdfFile;
  zoom?: number;
}) {
  const [numPages, setNumPages] = useState(0);
  const [pageWidth, setPageWidth] = useState(900);

  useEffect(() => {
    function updateWidth() {
      const width = window.innerWidth;

      if (width < 640) {
        setPageWidth(width - 24);
      } else if (width < 1024) {
        setPageWidth(width - 80);
      } else {
        setPageWidth(900);
      }
    }

    updateWidth();

    window.addEventListener("resize", updateWidth);

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div
      className="overflow-auto bg-slate-100 p-4"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={file}
        loading={
          <div className="py-10 text-center font-bold">
            Chargement du PDF...
          </div>
        }
        error={
          <div className="py-10 text-center text-red-600 font-bold">
            Impossible d'ouvrir ce document PDF.
          </div>
        }
        onLoadSuccess={({ numPages }) => {
          console.log("✅ PDF chargé :", numPages);
          setNumPages(numPages);
        }}
        onLoadError={(error) => {
          console.error("❌ PDF.js Error :", error);
        }}
      >
        {Array.from({ length: numPages }, (_, index) => (
          <div
            key={index}
            className="mb-6 flex justify-center"
          >
            <Page
              pageNumber={index + 1}
              width={pageWidth * zoom}
              renderAnnotationLayer
              renderTextLayer
            />
          </div>
        ))}
      </Document>
    </div>
  );
}
