"use client";

import { useEffect } from "react";

/** Reports the current 404 path once, after paint, so the admin can see it. */
export function NotFoundBeacon() {
  useEffect(() => {
    const path = window.location.pathname;
    if (!path || path.startsWith("/admin")) return;
    const key = `zy-404:${path}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode */
    }
    void fetch("/api/not-found", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, []);
  return null;
}
