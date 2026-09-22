"use client";

import { useEffect } from "react";

/** Registers the QueueLess service worker (offline shell + tile cache). */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Skip on localhost dev with constantly-changing chunks? No — the worker
    // is network-first for /api and cache-first only for shell/tiles, so it
    // is safe in dev too. Still, only register in production to keep dev
    // debugging honest (stale chunks are exactly what bit us before).
    if (process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement; never break the app.
    });
  }, []);
  return null;
}
