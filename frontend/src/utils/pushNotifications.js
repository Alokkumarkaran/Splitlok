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
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, reason: 'unsupported' };
  }

  try {
    let permission = Notification.permission;
    
    // If user already explicitly denied/blocked, report reason directly
    if (permission === 'denied') {
      return { success: false, reason: 'denied' };
    }

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'denied') {
      return { success: false, reason: 'denied' };
    }

    if (permission !== 'granted') {
      return { success: false, reason: 'dismissed' };
    }

    let register = await navigator.serviceWorker.getRegistration();
    if (!register) {
      register = await navigator.serviceWorker.register('/sw.js');
    }
    await navigator.serviceWorker.ready;

    const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!VAPID_PUBLIC_KEY) {
      console.warn('VITE_VAPID_PUBLIC_KEY is not defined');
      return { success: false, reason: 'missing_key' };
    }

    let subscription = await register.pushManager.getSubscription();
    if (!subscription) {
      subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    await API.post('/users/subscribe', subscription);
    return { success: true };
  } catch (error) {
    console.error('Error subscribing to push:', error);
    const isDenied = 
      error?.name === 'NotAllowedError' || 
      error?.message?.toLowerCase().includes('permission denied') ||
      error?.message?.toLowerCase().includes('not allowed') ||
      (typeof Notification !== 'undefined' && Notification.permission === 'denied');

    if (isDenied) {
      return { success: false, reason: 'denied', error };
    }
    return { success: false, reason: 'error', error };
  }
};

export const unsubscribeFromPushNotifications = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    try {
      let register = await navigator.serviceWorker.getRegistration();
      if (!register) {
        register = await navigator.serviceWorker.ready;
      }
      const subscription = await register.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await API.post('/users/unsubscribe', { endpoint: subscription.endpoint });
      }
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return { success: false, error };
    }
  }
  return { success: false, reason: 'unsupported' };
};
