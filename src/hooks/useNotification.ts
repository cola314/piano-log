"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  // Register SW and check permission on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      const basePath = "/piano-log";
      navigator.serviceWorker
        .register(`${basePath}/sw.js`, { scope: `${basePath}/` })
        .then((reg) => {
          swRef.current = reg;
        })
        .catch(() => {});
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const scheduleNotification = useCallback((delayMs: number, category: string, message: string) => {
    const sw = swRef.current?.active;
    if (!sw || permission !== "granted") return;
    sw.postMessage({
      type: "SCHEDULE_NOTIFICATION",
      delayMs,
      category,
      message,
    });
  }, [permission]);

  const cancelNotification = useCallback(() => {
    const sw = swRef.current?.active;
    if (!sw) return;
    sw.postMessage({ type: "CANCEL_NOTIFICATION" });
  }, []);

  return {
    permission,
    requestPermission,
    scheduleNotification,
    cancelNotification,
  };
}
