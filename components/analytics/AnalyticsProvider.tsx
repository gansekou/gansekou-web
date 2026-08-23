"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

export function AnalyticsProvider() {
  useEffect(() => {
    console.log("[GA4] AnalyticsProvider chargé");

    void analytics.track("gansekou_test", {
      platform: "web",
    });
  }, []);

  return null;
}
