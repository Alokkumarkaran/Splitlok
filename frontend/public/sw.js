// Splitlok Service Worker for Rich Push Notifications

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : 'New update in your flat!' };
  }

  const title = data.title || '💸 Splitlok Flat Alert';
  const options = {
    body: data.body || 'A flatmate just logged a new expense.',
    icon: data.icon || '/Splitlok-192x192.png',
    badge: data.badge || '/Splitlok-192x192.png',
    vibrate: [120, 60, 120, 60, 200],
    tag: data.tag || `splitlok-${Date.now()}`,
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || '/',
      payload: data.meta || null
    },
    actions: data.actions || [
      { action: 'open', title: '👀 View Split' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Also notify any open app tabs to sync state immediately
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'PUSH_RECEIVED', data });
        });
      })
    ])
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing open Splitlok window if available
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client && targetUrl) {
            return client.navigate(targetUrl);
          }
          return client;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
