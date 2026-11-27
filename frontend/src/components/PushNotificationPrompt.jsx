import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Sparkles, ShieldCheck, ArrowRight, Settings, Zap, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { NotificationContext } from '../context/NotificationContext';

const SNOOZE_KEY = 'splitlok_push_prompt_snoozed_until';
const SNOOZE_HOURS = 24;

const PushNotificationPrompt = () => {
  const { user } = useContext(AppContext);
  const { 
    isPushSupported, 
    isPushEnabled, 
    setIsPushEnabled,
    setIsPermissionGuideOpen, 
    requestPushPermission 
  } = useContext(NotificationContext);

  const [isVisible, setIsVisible] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('default');

  useEffect(() => {
    // Check permission state in browser
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }

    // Only prompt authenticated users in a flat group
    if (!user || !user.groupId) {
      setIsVisible(false);
      return;
    }

    // If push is already enabled or unsupported, do not show
    if (!isPushSupported || isPushEnabled) {
      setIsVisible(false);
      return;
    }

    // Check if user already snoozed the prompt
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    if (snoozedUntil && Date.now() < parseInt(snoozedUntil, 10)) {
      setIsVisible(false);
      return;
    }

    // Gentle 1.8 second delay so user sees dashboard first without sudden pop-ups
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1800);

    return () => clearTimeout(timer);
  }, [user, user?.groupId, isPushSupported, isPushEnabled]);

  const handleDismiss = () => {
    // Snooze for 24 hours on "Maybe Later" or "✕"
    const expiry = Date.now() + SNOOZE_HOURS * 60 * 60 * 1000;
    localStorage.setItem(SNOOZE_KEY, expiry.toString());
    setIsVisible(false);
  };

  const handleEnableAlerts = async () => {
    setIsActionLoading(true);

    // If permission is already blocked/denied, directly open the guidance modal
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
      setIsActionLoading(false);
      setIsVisible(false);
      setIsPermissionGuideOpen(true);
      return;
    }

    try {
      const granted = await requestPushPermission();
      if (granted) {
        setIsVisible(false);
        localStorage.removeItem(SNOOZE_KEY);
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPermissionState(Notification.permission);
        }
      }
    } catch (err) {
      console.error("Push prompt action error:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isVisible || isPushEnabled || !isPushSupported) {
    return null;
  }

  const isDenied = permissionState === 'denied';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.92, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 35, scale: 0.92, filter: "blur(6px)" }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="fixed bottom-20 md:bottom-6 left-3 right-3 md:left-auto md:right-6 md:max-w-md z-[95] pointer-events-auto"
        >
          {/* Outer Multi-Color Glow Aura */}
          <div className="absolute -inset-1 rounded-[2.2rem] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-30 dark:opacity-40 blur-xl pointer-events-none -z-10" />

          {/* Premium Card Container */}
          <div className="relative bg-white/95 dark:bg-[#111827]/95 backdrop-blur-2xl border border-indigo-500/25 dark:border-indigo-500/35 rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.3)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.8)] text-slate-900 dark:text-white select-none overflow-hidden">
            
            {/* Ambient Background Light Bloom */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-gradient-to-br from-indigo-500/20 via-cyan-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Top Close / Snooze Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Dismiss notification prompt"
            >
              <X size={16} />
            </button>

            {/* Top Brand Tag */}
            <div className="flex items-center gap-2 mb-3.5">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-cyan-500/15 text-indigo-600 dark:text-cyan-400 border border-indigo-500/30 text-[10px] font-black tracking-widest uppercase">
                <Sparkles size={11} className="text-amber-400" />
                SPLITLOK • LIVE LEDGER PUSH
              </span>
            </div>

            {/* Header with Visual Bell Pod */}
            <div className="flex items-start gap-4">
              
              {/* Animated 3D-styled Bell Pod */}
              <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 border border-white/20">
                  <Bell size={22} className="animate-bounce" />
                </div>
                {/* Orbiting Ring Pulsers */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-[#111827] rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#111827] rounded-full flex items-center justify-center text-[8px] text-white font-bold">
                  ✓
                </span>
              </div>

              {/* Title and Witty Fintech Copy */}
              <div className="pr-4">
                <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Turn on Flat Alerts 🔔
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                  Get witty, instant alerts when flatmates add expenses or settle debts. Say goodbye to awkward <span className="font-bold text-indigo-600 dark:text-cyan-400">"bhai kal dunga"</span> talks forever!
                </p>
              </div>
            </div>

            {/* Micro Feature Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-0.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 flex items-center gap-1">
                <Zap size={11} className="text-amber-500" /> Instant Push
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-500" /> Penny-Perfect
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80">
                🤝 100% Transparent
              </span>
            </div>

            {/* Blocked / Denied Notice if Applicable */}
            {isDenied && (
              <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
                <AlertTriangle size={16} className="flex-shrink-0 text-amber-500" />
                <span className="text-[11px] font-medium leading-snug">
                  Notifications are currently blocked. Click below for a 2-step quick fix in settings.
                </span>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-2.5 mt-4 pt-1">
              <button
                disabled={isActionLoading}
                onClick={handleEnableAlerts}
                className="relative flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/35 transition-all active:scale-95 disabled:opacity-60 overflow-hidden group"
              >
                {/* Specular sheen swipe */}
                <motion.div
                  animate={{ x: ["-100%", "250%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  className="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-20 pointer-events-none"
                />

                {isActionLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enabling...
                  </span>
                ) : isDenied ? (
                  <>
                    <Settings size={15} />
                    <span>Unblock in Settings</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                ) : (
                  <>
                    <Bell size={15} />
                    <span>Enable Push Alerts</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="py-3 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors active:scale-95 flex-shrink-0"
              >
                Maybe Later
              </button>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
