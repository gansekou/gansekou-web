"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const queryString = searchParams?.toString();

    const pagePath = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    void analytics.track("page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
