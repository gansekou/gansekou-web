"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    analytics.track("gansekou_test", {
      platform: "web",
    });
  }, []);

  return null;
}
