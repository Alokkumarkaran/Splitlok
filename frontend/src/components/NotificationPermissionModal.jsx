import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, SlidersHorizontal, RefreshCw, CheckCircle2, AlertCircle, Smartphone, Monitor, Apple, ArrowRight } from 'lucide-react';
import { subscribeToPushNotifications } from '../utils/pushNotifications';
import toast from 'react-hot-toast';

const NotificationPermissionModal = ({ isOpen, onClose, onPermissionGranted }) => {
  // Detect platform automatically
  const [activeTab, setActiveTab] = useState('desktop');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      const ua = navigator.userAgent;
      if (/iPhone|iPad|iPod/i.test(ua)) {
        setActiveTab('ios');
      } else if (/Android/i.test(ua)) {
        setActiveTab('android');
      } else {
        setActiveTab('desktop');
      }
    }
  }, []);

  const currentHost = typeof window !== 'undefined' ? window.location.host : 'splitlok.app';

  // Live checker to see if user changed setting in browser
  const handleCheckPermission = async () => {
    setChecking(true);
    if (!('Notification' in window)) {
      toast.error("Notifications are not supported by this browser.");
      setChecking(false);
      return;
    }

    const currentPerm = Notification.permission;
    if (currentPerm === 'granted') {
      const res = await subscribeToPushNotifications();
      if (res && (res.success || res === true)) {
        toast.success("Permission detected! Push notifications enabled. 🚀");
        if (onPermissionGranted) onPermissionGranted();
        onClose();
      } else if (res && (res.reason === 'denied' || res.error?.name === 'NotAllowedError')) {
        toast.error("Still blocked. Make sure notifications are allowed in browser & Windows Settings.", {
          icon: '⚠️',
          duration: 5000
        });
      } else {
        toast.error("Registration pending. Please reload the page.", { icon: '⚠️' });
      }
    } else if (currentPerm === 'default') {
      // Browser reset permission to prompt
      const newPerm = await Notification.requestPermission();
      if (newPerm === 'granted') {
        const res = await subscribeToPushNotifications();
        if (res && (res.success || res === true)) {
          toast.success("Push notifications enabled! 🚀");
          if (onPermissionGranted) onPermissionGranted();
          onClose();
        } else {
          toast.error("Permission granted in browser, but registration blocked by OS or browser settings.");
        }
      } else {
        toast.error("Permission was not granted.");
      }
    } else {
      toast.error("Still blocked in browser. Toggle Notifications to 'Allow' above.", {
        icon: '⚠️'
      });
    }
    setChecking(false);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 font-sans select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-[#111827] rounded-3xl sm:rounded-[2rem] p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden"
          >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <SlidersHorizontal size={24} className="stroke-[2.5px]" />
            </div>
            <div className="pr-6">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Action Required
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Enable Notifications in Browser
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Your browser has notifications blocked for this site. Follow the quick steps below to allow them.
              </p>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl mb-5">
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'desktop'
                  ? 'bg-white dark:bg-[#1E2330] text-indigo-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Monitor size={14} /> Desktop (Chrome / Edge)
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-white dark:bg-[#1E2330] text-indigo-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Smartphone size={14} /> Android
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-white dark:bg-[#1E2330] text-indigo-600 dark:text-cyan-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Apple size={14} /> iPhone (iOS)
            </button>
          </div>

          {/* TAB 1: DESKTOP (Chrome, Edge, Brave) */}
          {activeTab === 'desktop' && (
            <div className="space-y-4 mb-6">
              {/* Illustrated Mock Address Bar */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 relative overflow-hidden">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-cyan-400 font-bold text-xs border border-indigo-500/30 animate-pulse">
                  <SlidersHorizontal size={14} />
                  <span>Site settings</span>
                </div>
                <div className="flex-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  <Lock size={12} className="text-slate-400" />
                  <span>https://{currentHost}</span>
                </div>
              </div>

              {/* Instructions list */}
              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Click the <strong>Tune / Settings icon (🎛️)</strong> or <strong>Lock icon (🔒)</strong> on the left of your URL bar.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Look for <strong>Notifications</strong> and toggle it from <strong>Block</strong> to <strong>Allow</strong>.</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Click <strong>Check Permission Now</strong> below to activate instant alerts.</span>
                </div>
              </div>

              {/* Windows OS Notifications Notice */}
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>Windows Notifications Tip</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  If already allowed in Chrome but still failing: Open <strong>Windows Settings</strong> (Win + I) → <strong>System</strong> → <strong>Notifications</strong> → make sure <strong>Google Chrome</strong> is turned <strong>ON</strong>.
                </p>
              </div>

              {/* Direct Chrome Settings Shortcut */}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText('chrome://settings/content/notifications');
                  toast.success("Link copied! Paste into a new Chrome tab to open settings.", { duration: 4000 });
                }}
                className="w-full text-left p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 rounded-xl text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between transition-colors border border-slate-200 dark:border-slate-700/60"
              >
                <span className="truncate">chrome://settings/content/notifications</span>
                <span className="font-sans font-bold text-[10px] text-indigo-600 dark:text-cyan-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md shadow-xs flex-shrink-0 ml-2">Copy Link</span>
              </button>
            </div>
          )}

          {/* TAB 2: ANDROID CHROME */}
          {activeTab === 'android' && (
            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone size={14} className="text-indigo-500" /> In Chrome on Android:
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">1.</span>
                  <span>Tap the <strong>Lock (🔒)</strong> or <strong>Tune icon</strong> next to the address bar.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">2.</span>
                  <span>Tap <strong>Permissions</strong> → <strong>Notifications</strong> → select <strong>Allow</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">3.</span>
                  <span>Return to Splitlok and tap <strong>Check Permission Now</strong>.</span>
                </div>
              </div>

              {/* Android System Note */}
              <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-200">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>Android System Setting</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  If still blocked, go to phone <strong>Settings → Apps → Chrome → Notifications</strong> and ensure it is turned <strong>ON</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IOS */}
          {activeTab === 'ios' && (
            <div className="space-y-3 mb-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Apple size={14} className="text-indigo-500" /> On iPhone / iPad (iOS 16.4+):
                </p>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">1.</span>
                  <span>Tap Safari's <strong>Share button (⬆️)</strong> and tap <strong>"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">2.</span>
                  <span>Open <strong>Splitlok</strong> from your Home Screen app icon.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-500 font-black">3.</span>
                  <span>Go to iPhone <strong>Settings → Splitlok → Notifications → Allow Notifications</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCheckPermission}
              disabled={checking}
              className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
              <span>{checking ? 'Checking...' : 'Check Permission Now'}</span>
            </button>

            <button
              onClick={handleReload}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>Reload Page</span>
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPermissionModal;

