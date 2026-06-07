"use client";

import { useEffect } from "react";

export function PWARegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
      console.warn("[pwa] service worker registration failed", error);
    });
  }, []);

  return null;
}
