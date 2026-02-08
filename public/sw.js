// Piano Practice Timer - Service Worker
let notificationTimer = null;

self.addEventListener("message", (event) => {
  const { type, delayMs, category, message } = event.data;

  if (type === "SCHEDULE_NOTIFICATION") {
    // Clear any existing timer
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }

    // Schedule notification after delayMs
    notificationTimer = setTimeout(() => {
      self.registration.showNotification("PianoLog", {
        body: message || `${category} 연습 시간 완료!`,
        icon: "/piano-log/icon-192.png",
        badge: "/piano-log/icon-192.png",
        tag: "timer-complete",
        renotify: true,
        requireInteraction: true,
      });
      notificationTimer = null;
    }, delayMs);
  }

  if (type === "CANCEL_NOTIFICATION") {
    if (notificationTimer) {
      clearTimeout(notificationTimer);
      notificationTimer = null;
    }
  }
});

// Handle notification click - focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/piano-log") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/piano-log/");
    })
  );
});

// Basic install/activate
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
