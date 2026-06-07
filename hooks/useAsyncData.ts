"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

export function useAsyncData<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const activeRequest = useRef<Promise<void> | null>(null);

  const reload = useCallback(async () => {
    if (activeRequest.current) return activeRequest.current;

    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setLoading(true);
    setError(null);

    activeRequest.current = (async () => {
    try {
      const result = await loader();
      if (requestId.current !== currentRequest) return;
      setData(result);
    } catch (err) {
      if (requestId.current !== currentRequest) return;
      console.error("[data] load failed", err);
      setError(err instanceof ApiError ? err.message : "Chargement impossible.");
    } finally {
      if (requestId.current === currentRequest) setLoading(false);
      activeRequest.current = null;
    }
    })();

    return activeRequest.current;
  }, [loader]);

  useEffect(() => {
    const task = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(task);
  }, [reload]);

  return { data, loading, error, reload };
}
