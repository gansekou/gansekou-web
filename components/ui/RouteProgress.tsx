"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const COMPLETE_DELAY_MS = 180;
const SAFETY_TIMEOUT_MS = 7000;

function isInternalNavigation(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const link = target.closest("a[href]");
  if (!link) return false;

  const href = link.getAttribute("href");
  const targetAttr = link.getAttribute("target");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  if (targetAttr && targetAttr !== "_self") return false;

  try {
    return new URL(href, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}

function RouteProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function start(event: MouseEvent | TouchEvent) {
      if (!isInternalNavigation(event.target)) return;
      setActive(true);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
      safetyTimer.current = setTimeout(() => setActive(false), SAFETY_TIMEOUT_MS);
    }

    document.addEventListener("click", start, { capture: true });
    document.addEventListener("touchstart", start, { capture: true, passive: true });

    return () => {
      document.removeEventListener("click", start, { capture: true });
      document.removeEventListener("touchstart", start, { capture: true });
      if (completeTimer.current) clearTimeout(completeTimer.current);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    if (completeTimer.current) clearTimeout(completeTimer.current);
    completeTimer.current = setTimeout(() => {
      setActive(false);
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    }, COMPLETE_DELAY_MS);
  }, [active, pathname, searchParams]);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-150 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div className="route-progress-live h-full bg-[#f6c445]" />
    </div>
  );
}

export function RouteProgress() {
  return (
    <Suspense fallback={null}>
      <RouteProgressInner />
    </Suspense>
  );
}
