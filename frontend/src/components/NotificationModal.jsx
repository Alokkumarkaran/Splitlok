import React, { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Receipt, ArrowRightLeft, Sparkles, Inbox } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';
import { AppContext } from '../context/AppContext';

// Simple time-ago formatter
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const NotificationModal = () => {
  const { 
    isModalOpen, 
    setIsModalOpen, 
    notifications, 
    unreadCount, 
    markAllRead, 
    loading,
    isPushSupported,
    isPushEnabled,
    requestPushPermission
  } = useContext(NotificationContext);
  const { user } = useContext(AppContext);

  if (!isModalOpen) return null;

  const currentUserId = user?._id?.toString();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 font-sans">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal / Slide-out Panel */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-md h-[85vh] sm:h-[90vh] bg-white dark:bg-[#111827] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col overflow-hidden z-10"
        >
          {/* Mobile Drag Indicator */}
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 sm:hidden" />

          {/* Header */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-cyan-400 flex items-center justify-center">
                <Bell size={20} className="stroke-[2.5px]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Flat Alerts
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  Instant updates from your roommates
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="p-2 text-indigo-600 dark:text-cyan-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                  title="Mark all as read"
                >
                  <CheckCheck size={16} />
                  <span className="hidden sm:inline">Mark Read</span>
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
            
            {/* Attractive Push Notifications Opt-In Card */}
            {isPushSupported && !isPushEnabled && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>🔔</span> Enable Device Push Alerts
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-snug">
                    Get instant phone screen alerts whenever someone adds an expense, even when the app is closed!
                  </p>
                </div>
                <button
                  onClick={requestPushPermission}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 active:scale-95 transition-all flex-shrink-0"
                >
                  Turn On
                </button>
              </motion.div>
            )}

            {loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm font-semibold text-slate-400">Loading alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-4 border border-slate-100 dark:border-slate-800">
                  <Inbox size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                  All Quiet in the Flat
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
                  When a flatmate adds an expense or settles a debt, you'll receive real-time notifications here.
                </p>
              </div>
            ) : (
              notifications.map((notif, idx) => {
                const isUnread = !notif.readBy?.some(id => id.toString() === currentUserId);
                const isSettlement = notif.type === 'settlement';
                const initial = notif.senderName ? notif.senderName.charAt(0).toUpperCase() : 'F';

                return (
                  <motion.div
                    key={notif._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`relative p-4 rounded-2xl border transition-all ${
                      isUnread
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/50 shadow-sm'
                        : 'bg-slate-50/60 dark:bg-[#1a2234]/60 border-slate-200/60 dark:border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 ${
                        isSettlement ? 'bg-gradient-to-tr from-emerald-600 to-teal-500' : 'bg-gradient-to-tr from-indigo-600 to-violet-500'
                      }`}>
                        {initial}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {notif.title || (isSettlement ? "Paisa hi paisa hoga! 🤑" : notif.type === 'payment_reminder' ? "Bhai paise kab dega? 🥺" : "Bhai, kharcha ho gaya! 💸")}
                          </p>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                          {notif.message || (
                            isSettlement ? (
                              <>{notif.senderName} settled up <span className="font-black text-emerald-600 dark:text-emerald-400">₹{notif.amount?.toLocaleString('en-IN')}</span></>
                            ) : (
                              <>{notif.senderName} added '{notif.description}' of <span className="font-black text-indigo-600 dark:text-cyan-400">₹{notif.amount?.toLocaleString('en-IN')}</span></>
                            )
                          )}
                        </p>

                        {notif.funCaption && (
                          <p className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 mt-1 italic">
                            👉 {notif.funCaption}
                          </p>
                        )}
                      </div>

                      {/* Unread indicator dot */}
                      {isUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-cyan-400 flex-shrink-0 mt-1 shadow-sm" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-[#0d131f] border-t border-slate-100 dark:border-slate-800/80 text-center">
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                Notifications sync live across all flatmate devices
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationModal;

