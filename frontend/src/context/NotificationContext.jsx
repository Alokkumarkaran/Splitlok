import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AppContext } from './AppContext';
import { getNotifications, markNotificationsAsRead } from '../services/api';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '../utils/pushNotifications';
import toast from 'react-hot-toast';

export const NotificationContext = createContext();

// Harmonious glass-ping audio using Web Audio API (zero external assets, instant response)
const playNotificationChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Chime Note 1: E5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    // Chime Note 2: B5 (high harmonious ping)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.65);
  } catch (err) {
    // Non-blocking if browser audio is suspended
  }
};

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePopup, setActivePopup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  const eventSourceRef = useRef(null);
  const popupTimerRef = useRef(null);

  // Check push subscription state on load
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsPushEnabled(!!sub);
        });
      }).catch(() => {});

      const handleSwMessage = (event) => {
        if (event.data?.type === 'PUSH_RECEIVED') {
          fetchNotifications();
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleSwMessage);
      };
    }
  }, []);

  const requestPushPermission = async () => {
    const success = await subscribeToPushNotifications();
    if (success) {
      setIsPushEnabled(true);
      toast.success("Push alerts enabled! 🚀");
    } else {
      toast.error("Could not enable push alerts. Please check browser settings.");
    }
    return success;
  };

  // Fetch persisted notification history from API
  const fetchNotifications = useCallback(async () => {
    if (!user || !user.groupId) return;
    try {
      setLoading(true);
      const res = await getNotifications();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Dismiss popup helper
  const dismissPopup = useCallback(() => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
      popupTimerRef.current = null;
    }
    setActivePopup(null);
  }, []);

  // Trigger an in-app popup message
  const triggerPopup = useCallback((popupData) => {
    dismissPopup();
    playNotificationChime();

    // Trigger subtle mobile haptic vibration if supported
    if (navigator && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch (e) {}
    }

    setActivePopup(popupData);

    // Auto dismiss after 7.5 seconds
    popupTimerRef.current = setTimeout(() => {
      setActivePopup(null);
    }, 7500);
  }, [dismissPopup]);

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      await markNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readBy: user?._id ? [...(n.readBy || []), user._id] : n.readBy
        }))
      );
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  // Establish Real-time SSE Connection
  useEffect(() => {
    if (!user || !user.groupId) {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const token = localStorage.getItem('token');
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const sseUrl = `${apiBase}/notifications/stream?token=${encodeURIComponent(token || '')}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === 'connected') return;

          if (parsed.event === 'expense_added' || parsed.event === 'settlement_recorded') {
            const notifPayload = parsed.data;

            // Trigger the in-app popup message
            triggerPopup({
              id: notifPayload._id || Date.now(),
              senderName: notifPayload.senderName || 'Flatmate',
              senderId: notifPayload.senderId,
              amount: notifPayload.amount,
              description: notifPayload.description,
              splitCount: notifPayload.splitCount,
              type: notifPayload.type,
              createdAt: notifPayload.createdAt || new Date().toISOString()
            });

            // Prepend to notification list & bump unread count
            setNotifications((prev) => [
              {
                _id: notifPayload._id || Date.now().toString(),
                senderName: notifPayload.senderName,
                sender: { _id: notifPayload.senderId, name: notifPayload.senderName },
                amount: notifPayload.amount,
                description: notifPayload.description,
                type: notifPayload.type,
                splitCount: notifPayload.splitCount,
                createdAt: notifPayload.createdAt || new Date().toISOString(),
                readBy: []
              },
              ...prev
            ]);
            setUnreadCount((count) => count + 1);
          }
        } catch (e) {
          console.error('SSE Message parsing error:', e);
        }
      };

      es.onerror = () => {
        // EventSource will automatically attempt reconnection
      };
    } catch (e) {
      console.error('SSE Connection failed:', e);
    }

    // Safety polling every 25 seconds as a fallback
    const interval = setInterval(() => {
      fetchNotifications();
    }, 25000);

    return () => {
      clearInterval(interval);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, user?.groupId, fetchNotifications, triggerPopup]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activePopup,
        isModalOpen,
        setIsModalOpen,
        triggerPopup,
        dismissPopup,
        markAllRead,
        fetchNotifications,
        loading,
        isPushSupported,
        isPushEnabled,
        requestPushPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

