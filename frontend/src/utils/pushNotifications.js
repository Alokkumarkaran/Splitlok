import API from '../services/api';

// Utility function to convert VAPID public key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') return false;

      const register = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) return false;

      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      await API.post('/users/subscribe', subscription);
      return true;
    } catch (error) {
      console.error('Error subscribing to push:', error);
      return false;
    }
  }
  return false;
};

export const unsubscribeFromPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const register = await navigator.serviceWorker.ready;
      const subscription = await register.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Let the backend know so it can remove it from DB
        await API.post('/users/unsubscribe', { endpoint: subscription.endpoint });
      }
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }
  return false;
};
