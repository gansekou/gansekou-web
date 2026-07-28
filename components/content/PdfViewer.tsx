"use client";

import dynamic from "next/dynamic";

export const PdfViewer = dynamic(
  () =>
    import("./PdfViewerClient").then((mod) => ({
      default: mod.PdfViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center">
        Chargement du lecteur PDF...
      </div>
    ),
  }
);
