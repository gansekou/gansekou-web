"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    const start = displayRef.current;
    const delta = value - start;
    const startedAt = performance.now();
    const duration = 650;
    let frame = 0;

    function tick(now: number) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = Math.round(start + delta * progress);
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display.toLocaleString()}{suffix}</>;
}
